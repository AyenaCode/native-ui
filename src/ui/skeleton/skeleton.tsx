import { StyleSheet, useColorScheme, View, type ColorValue, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { cubicBezier, useReducedMotion } from 'react-native-reanimated';

export type SkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  /** Corner radius. */
  radius?: number;
  /** Block color. Defaults to a light / dark neutral. */
  color?: ColorValue;
  style?: StyleProp<ViewStyle>;
};

export type SkeletonCircleProps = Omit<SkeletonProps, 'width' | 'height' | 'radius'> & { size?: number };

export type SkeletonTextProps = Omit<SkeletonProps, 'height' | 'width'> & {
  lines?: number;
  /** Line height of the text being replaced. */
  lineHeight?: number;
  /** Width of the last line — reads as a paragraph end. */
  lastLineWidth?: DimensionValue;
  gap?: number;
};

const COLORS = { light: '#E4E4E7', dark: '#2C2F34' } as const;

// Opacity-only pulse: compositor work on the UI thread, no React render, no layout pass.
const PULSE = { from: { opacity: 1 }, to: { opacity: 0.45 } };
const EASE_IN_OUT = cubicBezier(0.77, 0, 0.175, 1);

/** Placeholder block with a UI-thread pulse (static when reduced motion is on). See README.md. */
export function Skeleton({ width = '100%', height = 16, radius = 8, color, style }: SkeletonProps) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const reduced = useReducedMotion();

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        { width, height, borderRadius: radius, backgroundColor: color ?? COLORS[scheme] },
        reduced
          ? styles.static
          : {
              animationName: PULSE,
              animationDuration: 900,
              animationDirection: 'alternate',
              animationIterationCount: 'infinite',
              animationTimingFunction: EASE_IN_OUT,
            },
        style,
      ]}
    />
  );
}

/** Round placeholder (avatar, icon). */
export function SkeletonCircle({ size = 40, ...props }: SkeletonCircleProps) {
  return <Skeleton {...props} width={size} height={size} radius={size / 2} />;
}

/** Paragraph placeholder: `lines` bars, the last one shorter. */
export function SkeletonText({ lines = 3, lineHeight = 14, lastLineWidth = '60%', gap = 8, ...props }: SkeletonTextProps) {
  return (
    <View style={{ gap }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} {...props} height={lineHeight} width={i === lines - 1 && lines > 1 ? lastLineWidth : '100%'} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  static: { opacity: 0.7 },
});
