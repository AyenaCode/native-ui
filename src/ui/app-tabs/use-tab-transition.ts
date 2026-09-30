import { useFocusEffect, useNavigation } from 'expo-router';
import { use, useCallback, useLayoutEffect, useRef } from 'react';
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

import { SYNC_EASING, TabMotionContext } from './tab-motion';

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
  /**
   * Timing curve. Default: Material 3 emphasized decelerate `Easing.bezier(0.1, 0.7, 0.1, 1)`;
   * with `AppTabs slidingIndicator`, `Easing.bezier(0, 0, 0.2, 1)` to match the indicator. Keep a decelerate (ease-out) curve.
   */
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

/** Resolved values of a transition: `intensity` preset, then direct overrides. Shared by the screens and the sliding indicator. */
export function resolveTabTransition(transition: TabTransition = {}) {
  const { intensity = 'strong', reverse = true } = transition;
  const preset = typeof intensity === 'number' ? tabTransitionTuning(intensity) : TAB_TRANSITION_INTENSITIES[intensity];
  return {
    duration: transition.duration ?? preset.duration,
    distance: (transition.distance ?? preset.distance) * (reverse ? -1 : 1),
    startScale: Math.min(Math.max(transition.startScale ?? preset.startScale, 0), 1),
  };
}

/**
 * Material tab transition played each time the tab gains focus, on the UI thread.
 * The outgoing tab is hidden natively, so only the incoming one animates. The launch tab doesn't animate.
 * Reduced motion: opacity only. Apply the returned style to an `Animated.View` wrapping the tab content.
 * Defaults come from `AppTabs transition`; the argument overrides them field by field.
 */
export function useTabTransition(transition?: TabTransition) {
  const motion = use(TabMotionContext);
  const merged = { ...motion.transition, ...transition };
  const {
    variant = 'shared-axis',
    easing = motion.sliding ? SYNC_EASING : EASE_DECELERATE,
    enabled = process.env.EXPO_OS === 'android',
  } = merged;
  const { duration, distance, startScale: scale } = resolveTabTransition(merged);

  const reduced = useReducedMotion();
  const navigation = useNavigation();
  // Only the first tab ever focused in this navigator starts visible (the launch tab). The others start hidden,
  // whether they mount at launch (NativeTabs) or on first visit (headless tabs, lazy), and fade in on focus.
  const navigatorKey = navigation.getState()?.key;
  const progress = useSharedValue(
    !enabled || (navigation.isFocused() && navigatorKey !== undefined && !lastFocusedIndex.has(navigatorKey)) ? 1 : 0,
  );
  // -1 = comes from the left, 1 = from the right, 0 = no side (launch, same tab).
  const direction = useSharedValue(0);

  // Latest duration / easing / order, read on focus without re-running the focus effect
  // (an inline `Easing.bezier()` is a new object each render and would replay the animation).
  const latest = useRef({ duration, easing, order: motion.order });
  useLayoutEffect(() => {
    latest.current = { duration, easing, order: motion.order };
  });

  useFocusEffect(
    useCallback(() => {
      const state = navigation.getState();
      const { duration, easing, order } = latest.current;
      // Position in the tab bar, not in the navigator (headless tabs sort their routes).
      const position = state ? order.indexOf(String(state.routes[state.index]?.name)) : -1;
      const index = position === -1 ? (state?.index ?? 0) : position;
      const previous = state && lastFocusedIndex.get(state.key);
      if (state) lastFocusedIndex.set(state.key, index);

      if (!enabled) {
        progress.set(1);
        return;
      }
      direction.set(previous === undefined ? 0 : Math.sign(index - previous) * SIDE);
      progress.set(withTiming(1, { duration, easing }));
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
