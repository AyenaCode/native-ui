import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { I18nManager } from 'react-native';
import {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type EasingFunction,
  type EasingFunctionFactory,
} from 'react-native-reanimated';

/**
 * Material motion for the incoming tab:
 * - `fade-through`: grows from `startScale` while fading in. Material's pattern for bottom navigation.
 * - `shared-axis`: slides `distance` from the side of the tab bar it comes from while fading in (Material shared axis X).
 */
export type TabTransitionVariant = 'fade-through' | 'shared-axis';

export type TabTransition = {
  /** Default `'fade-through'`. */
  variant?: TabTransitionVariant;
  /** Animation length in ms. Default `250`. */
  duration?: number;
  /** Timing curve, e.g. `Easing.bezier(0.2, 0, 0, 1)`. Default: strong ease-out `Easing.bezier(0.23, 1, 0.32, 1)`. */
  easing?: EasingFunction | EasingFunctionFactory;
  /** `shared-axis` slide length in dp. Default `30` (Material). */
  distance?: number;
  /** `fade-through` start scale, `0`–`1`. Default `0.92` (Material). */
  startScale?: number;
  /** `false` switches tabs instantly (platform default). Default: on for Android (Material), off for iOS. */
  enabled?: boolean;
};

// Defaults from Material Components Android (MaterialFadeThrough / MaterialSharedAxis).
const START_SCALE = 0.92;
const SLIDE_DISTANCE = 30;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
// RTL: the tab bar is mirrored, so is the side a tab comes from.
const SIDE = I18nManager.isRTL ? -1 : 1;

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
  easing = EASE_OUT,
  distance = SLIDE_DISTANCE,
  startScale = START_SCALE,
  enabled = process.env.EXPO_OS === 'android',
}: TabTransition = {}) {
  const reduced = useReducedMotion();
  const navigation = useNavigation();
  // NativeTabs mounts every tab at launch: only the launch tab starts visible, the others fade in on first visit.
  const progress = useSharedValue(!enabled || navigation.isFocused() ? 1 : 0);
  // -1 = comes from the left, 1 = from the right, 0 = no side (launch, same tab).
  const direction = useSharedValue(0);

  // Latest duration / easing, read on focus without re-running the focus effect
  // (an inline `Easing.bezier()` is a new object each render and would replay the animation).
  const timing = useRef({ duration, easing });
  useLayoutEffect(() => {
    timing.current = { duration, easing };
  });

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
      progress.set(withTiming(1, timing.current));
      // Blurred tab is off-screen: reset now so the next focus starts from the first frame.
      return () => progress.set(0);
    }, [enabled, navigation, progress, direction]),
  );

  const scale = Math.min(Math.max(startScale, 0), 1);

  return useAnimatedStyle(() => {
    const p = progress.get();
    const moving = !reduced;
    // Same transform shape every frame: identity values instead of adding / removing entries.
    return {
      opacity: p,
      transform: [
        { translateX: moving && variant === 'shared-axis' ? direction.get() * distance * (1 - p) : 0 },
        { scale: moving && variant === 'fade-through' ? scale + (1 - scale) * p : 1 },
      ],
    };
  }, [reduced, variant, distance, scale]);
}
