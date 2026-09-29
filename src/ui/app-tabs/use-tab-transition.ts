import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback } from 'react';
import { I18nManager } from 'react-native';
import { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

/**
 * Material motion for the incoming tab:
 * - `fade-through`: grows from 92% while fading in. Material's pattern for bottom navigation.
 * - `shared-axis`: slides 30dp from the side of the tab bar it comes from while fading in (Material shared axis X).
 */
export type TabTransitionVariant = 'fade-through' | 'shared-axis';

export type TabTransition = {
  /** Default `'fade-through'`. */
  variant?: TabTransitionVariant;
  /** Animation length in ms. Default `250`. */
  duration?: number;
  /** `false` switches tabs instantly (platform default). Default: on for Android (Material), off for iOS. */
  enabled?: boolean;
};

// Values from Material Components Android (MaterialFadeThrough / MaterialSharedAxis).
const START_SCALE = 0.92;
const SLIDE_DISTANCE = 30;
// RTL: the tab bar is mirrored, so is the side a tab comes from.
const SIDE = I18nManager.isRTL ? -1 : 1;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

// Last focused tab index per tab navigator, to know which side the incoming tab comes from.
const lastFocusedIndex = new Map<string, number>();

/**
 * Material tab transition played each time the tab gains focus, on the UI thread.
 * The outgoing tab is hidden natively, so only the incoming one animates. The launch tab doesn't animate.
 * Reduced motion: opacity only. Apply the returned style to an `Animated.View` wrapping the tab content.
 */
export function useTabTransition({
  variant = 'fade-through',
  duration = 250,
  enabled = process.env.EXPO_OS === 'android',
}: TabTransition = {}) {
  const reduced = useReducedMotion();
  const navigation = useNavigation();
  // NativeTabs mounts every tab at launch: only the launch tab starts visible, the others fade in on first visit.
  const progress = useSharedValue(!enabled || navigation.isFocused() ? 1 : 0);
  // -1 = comes from the left, 1 = from the right, 0 = no side (launch, same tab).
  const direction = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      const state = navigation.getState();
      const previous = state && lastFocusedIndex.get(state.key);
      if (state) lastFocusedIndex.set(state.key, state.index);

      if (!enabled) {
        progress.set(1);
        return;
      }
      direction.set(!state || previous === undefined ? 0 : Math.sign(state.index - previous) * SIDE);
      progress.set(withTiming(1, { duration, easing: EASE_OUT }));
      // Blurred tab is off-screen: reset now so the next focus starts from the first frame.
      return () => progress.set(0);
    }, [enabled, duration, navigation, progress, direction]),
  );

  return useAnimatedStyle(() => {
    const p = progress.get();
    const moving = !reduced;
    // Same transform shape every frame: identity values instead of adding / removing entries.
    return {
      opacity: p,
      transform: [
        { translateX: moving && variant === 'shared-axis' ? direction.get() * SLIDE_DISTANCE * (1 - p) : 0 },
        { scale: moving && variant === 'fade-through' ? START_SCALE + (1 - START_SCALE) * p : 1 },
      ],
    };
  }, [reduced, variant]);
}
