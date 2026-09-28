import * as Haptics from 'expo-haptics';
import { useState, type ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { cubicBezier, useReducedMotion } from 'react-native-reanimated';

export type PressHaptic = 'selection' | 'light' | 'medium' | false;

export type PressableScaleProps = Omit<PressableProps, 'style' | 'children'> & {
  children?: ReactNode;
  /** Style of the scaled surface. */
  style?: StyleProp<ViewStyle>;
  /** Pressed scale. Keep it subtle: 0.95–0.98. */
  scale?: number;
  /** Haptic on press-in. Off by default — use it for commits, not every button. */
  haptic?: PressHaptic;
};

// Strong ease-out: instant response, soft landing.
const EASE_OUT = cubicBezier(0.23, 1, 0.32, 1);

const HAPTICS: Record<Exclude<PressHaptic, false>, () => Promise<void>> = {
  selection: Haptics.selectionAsync,
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
};

/**
 * Pressable that shrinks on press-in (120 ms, UI thread via a Reanimated CSS transition).
 * Two renders per press, zero per frame. Respects reduced motion. See README.md.
 */
export function PressableScale({
  children,
  style,
  scale = 0.97,
  haptic = false,
  onPressIn,
  onPressOut,
  hitSlop = 8,
  pressRetentionOffset = 16,
  ...props
}: PressableScaleProps) {
  const [pressed, setPressed] = useState(false);
  const reduced = useReducedMotion();

  return (
    <Pressable
      {...props}
      hitSlop={hitSlop}
      pressRetentionOffset={pressRetentionOffset}
      onPressIn={(e) => {
        setPressed(true);
        if (haptic) HAPTICS[haptic]();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: pressed && !reduced ? scale : 1 }],
            opacity: pressed && reduced ? 0.7 : 1,
            transitionProperty: ['transform', 'opacity'],
            transitionDuration: 120,
            transitionTimingFunction: EASE_OUT,
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
