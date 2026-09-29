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
 * - `fade-through`: grows from `startScale` while fading in (Material's pattern for bottom navigation).
 * - `shared-axis`: slides `distance` from the side of the tab bar it comes from while fading in (Material shared axis X).
 */
export type TabTransitionVariant = 'fade-through' | 'shared-axis';

/** Named amplitude preset. See `TAB_TRANSITION_INTENSITIES`. */
export type TabTransitionIntensityName = 'subtle' | 'medium' | 'strong' | 'max';

export type TabTransitionTuning = {
  /** `shared-axis` slide length in dp. */
  distance: number;
  /** `fade-through` start scale, `0`–`1`. */
  startScale: number;
  /** Animation length in ms. */
  duration: number;
};

export type TabTransition = {
  /** Default `'shared-axis'`. */
  variant?: TabTransitionVariant;
  /**
   * Sets `distance`, `startScale` and `duration` together, kept proportional. Default `'strong'`.
   * A preset name, or a slide distance in dp (`0`–`90`) from which the other two are derived.
   * `distance` / `startScale` / `duration` below override it one by one.
   */
  intensity?: TabTransitionIntensityName | number;
  /** `shared-axis`: enter from the side opposite to the tab you come from. Default `true`. */
  reverse?: boolean;
  /** Overrides the intensity. Animation length in ms. */
  duration?: number;
  /** Overrides the intensity. `shared-axis` slide length in dp (negative also reverses). */
  distance?: number;
  /** Overrides the intensity. `fade-through` start scale, `0`–`1`. */
  startScale?: number;
  /** Timing curve. Default: Material 3 emphasized decelerate `Easing.bezier(0.1, 0.7, 0.1, 1)`. Keep a decelerate (ease-out) curve. */
  easing?: EasingFunction | EasingFunctionFactory;
  /** `false` switches tabs instantly (platform default). Default: on for Android (Material), off for iOS. */
  enabled?: boolean;
};

const MAX_DISTANCE = 90;

/**
 * Proportional tuning for a slide distance: duration grows with the amplitude (≈ 200 + 2.2 × distance ms)
 * and the scale matches the slide's visual weight (≈ 1 − distance / 180). Distance is clamped to `0`–`90` dp.
 */
export function tabTransitionTuning(distance: number): TabTransitionTuning {
  const d = Math.min(Math.abs(distance), MAX_DISTANCE);
  return { distance: d, startScale: Math.round((1 - d / 180) * 100) / 100, duration: Math.round((200 + 2.2 * d) / 5) * 5 };
}

/** Presets. `subtle` is Material's own spec (0.92 / 30dp), which predates the proportional rule. */
export const TAB_TRANSITION_INTENSITIES = {
  subtle: { distance: 30, startScale: 0.92, duration: 250 },
  medium: tabTransitionTuning(36),
  strong: tabTransitionTuning(45),
  max: tabTransitionTuning(60),
} as const satisfies Record<TabTransitionIntensityName, TabTransitionTuning>;

const EASE_DECELERATE = Easing.bezier(0.1, 0.7, 0.1, 1); // Material 3 emphasized decelerate (entering elements)
// Opacity reaches 1 at 80% of the motion, so the long settle happens on solid content, not a ghost.
const FADE_END = 0.8;
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
  variant = 'shared-axis',
  intensity = 'strong',
  reverse = true,
  easing = EASE_DECELERATE,
  enabled = process.env.EXPO_OS === 'android',
  ...overrides
}: TabTransition = {}) {
  const preset = typeof intensity === 'number' ? tabTransitionTuning(intensity) : TAB_TRANSITION_INTENSITIES[intensity];
  const duration = overrides.duration ?? preset.duration;
  const distance = (overrides.distance ?? preset.distance) * (reverse ? -1 : 1);
  const scale = Math.min(Math.max(overrides.startScale ?? preset.startScale, 0), 1);

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

  return useAnimatedStyle(() => {
    const p = progress.get();
    const moving = !reduced;
    // Same transform shape every frame: identity values instead of adding / removing entries.
    return {
      opacity: Math.min(p / FADE_END, 1),
      transform: [
        { translateX: moving && variant === 'shared-axis' ? direction.get() * distance * (1 - p) : 0 },
        { scale: moving && variant === 'fade-through' ? scale + (1 - scale) * p : 1 },
      ],
    };
  }, [reduced, variant, distance, scale]);
}
