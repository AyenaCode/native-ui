import { useFocusEffect, useNavigation } from 'expo-router';
import { useCallback } from 'react';
import { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

export type TabTransition = {
  /** Fade-in length in ms. Default `250`. */
  duration?: number;
  /** `false` switches tabs instantly (platform default). Default: on for Android (Material), off for iOS. */
  enabled?: boolean;
};

// Material fade-through: the incoming destination grows from 92% while fading in.
const START_SCALE = 0.92;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

/**
 * Material fade-through played each time the tab gains focus, on the UI thread.
 * The outgoing tab is hidden natively, so only the incoming one animates. The launch tab doesn't animate.
 * Reduced motion: opacity only. Apply the returned style to an `Animated.View` wrapping the tab content.
 */
export function useTabTransition({ duration = 250, enabled = process.env.EXPO_OS === 'android' }: TabTransition = {}) {
  const reduced = useReducedMotion();
  const navigation = useNavigation();
  // NativeTabs mounts every tab at launch: only the launch tab starts visible, the others fade in on first visit.
  const progress = useSharedValue(!enabled || navigation.isFocused() ? 1 : 0);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        progress.set(1);
        return;
      }
      progress.set(withTiming(1, { duration, easing: EASE_OUT }));
      // Blurred tab is off-screen: reset now so the next focus starts from the first frame.
      return () => progress.set(0);
    }, [enabled, duration, progress]),
  );

  return useAnimatedStyle(() => {
    const p = progress.get();
    return {
      opacity: p,
      transform: reduced ? [] : [{ scale: START_SCALE + (1 - START_SCALE) * p }],
    };
  }, [reduced]);
}
