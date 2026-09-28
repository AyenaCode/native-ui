import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View, type ColorValue } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  LinearTransition,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { dismiss, internal, type ToastItem } from './store';

// Plain function refs: worklets capture these, not the `internal` object.
const { remove, pause, resume } = internal;

export type ToasterColors = { background: ColorValue; text: ColorValue; description: ColorValue; action: ColorValue };

export type ToasterProps = {
  /** Screen edge. `top` by default: native tab bars can't be measured, so `bottom` may sit under them. */
  position?: 'top' | 'bottom';
  /** Extra distance from the safe area, in px. */
  offset?: number;
  colors?: Partial<ToasterColors>;
};

const PALETTE: Record<'light' | 'dark', ToasterColors> = {
  light: { background: '#FFFFFF', text: '#0F0F10', description: '#6B6F76', action: '#3390EC' },
  dark: { background: '#2A2D32', text: '#FFFFFF', description: '#A1A6AD', action: '#5EB5F7' },
};
const ICONS = { success: { glyph: '✓', color: '#34C759' }, error: { glyph: '!', color: '#FF3B30' } } as const;

// Module scope: builders are rebuilt otherwise. Enter 300 ms ease-out, exit ~20 % faster.
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const ENTER_TOP = FadeInUp.duration(300).easing(EASE_OUT);
const ENTER_BOTTOM = FadeInDown.duration(300).easing(EASE_OUT);
const ENTER_REDUCED = FadeIn.duration(200);
const REFLOW = LinearTransition.duration(200).easing(EASE_OUT);
const EXIT_MS = 240;

// Where a flick would come to rest (Apple's decay projection).
function project(velocity: number) {
  'worklet';
  return ((velocity / 1000) * 0.998) / (1 - 0.998);
}

function ToastCard({ item, edge, colors }: { item: ToastItem; edge: 1 | -1; colors: ToasterColors }) {
  const reduced = useReducedMotion();
  const y = useSharedValue(0);
  const opacity = useSharedValue(1);
  const { id } = item;

  // Single exit path (timer, swipe, action, dismiss()): animate out, then remove.
  useEffect(() => {
    if (!item.dismissing) return;
    y.set(withTiming(reduced ? 0 : edge * 48, { duration: EXIT_MS, easing: EASE_OUT }));
    opacity.set(
      withTiming(0, { duration: EXIT_MS, easing: EASE_OUT }, (finished) => {
        if (finished) scheduleOnRN(remove, id);
      }),
    );
  }, [item.dismissing, reduced, edge, id, y, opacity]);

  // Explicit memo: library code must not rely on the React Compiler (a rebuilt gesture drops a drag).
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-8, 8])
        .onBegin(() => scheduleOnRN(pause, id))
        .onUpdate((e) => {
          const t = e.translationY;
          // Toward the edge follows the finger; away from it resists.
          y.set(t * edge >= 0 ? t : t / (1 + Math.abs(t) / 30));
        })
        .onEnd((e) => {
          if ((y.get() + project(e.velocityY)) * edge > 40) {
            y.set(withSpring(edge * 160, { duration: 300, dampingRatio: 1, velocity: e.velocityY, overshootClamping: true }));
            opacity.set(
              withTiming(0, { duration: 200 }, (finished) => {
                if (finished) scheduleOnRN(remove, id);
              }),
            );
          } else {
            y.set(withSpring(0, { duration: 400, dampingRatio: 0.8, velocity: e.velocityY }));
            scheduleOnRN(resume, id);
          }
        }),
    [edge, id, y, opacity],
  );

  const style = useAnimatedStyle(() => ({ opacity: opacity.get(), transform: [{ translateY: y.get() }] }));
  const icon = item.type === 'default' ? null : ICONS[item.type];

  return (
    <Animated.View entering={reduced ? ENTER_REDUCED : edge < 0 ? ENTER_TOP : ENTER_BOTTOM} layout={REFLOW}>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[styles.card, { backgroundColor: colors.background }, style]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {icon ? (
            <View style={[styles.icon, { backgroundColor: icon.color }]}>
              <Text style={styles.iconGlyph}>{icon.glyph}</Text>
            </View>
          ) : null}
          <View style={styles.texts}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </Text>
            {item.description ? (
              <Text style={[styles.description, { color: colors.description }]} numberOfLines={3}>
                {item.description}
              </Text>
            ) : null}
          </View>
          {item.action ? (
            <Pressable
              hitSlop={12}
              onPress={() => {
                item.action?.onPress();
                dismiss(id);
              }}
              style={({ pressed }) => [styles.action, pressed && styles.pressed]}
            >
              <Text style={[styles.actionLabel, { color: colors.action }]}>{item.action.label}</Text>
            </Pressable>
          ) : null}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

/**
 * Renders toasts. Mount once at the root, inside `GestureHandlerRootView` and `SafeAreaProvider`.
 * Enter/reflow are layout animations; swipe-to-dismiss and exit run on the UI thread. See README.md.
 */
export function Toaster({ position = 'top', offset = 8, colors }: ToasterProps) {
  const items = useSyncExternalStore(internal.subscribe, internal.getSnapshot);
  const insets = useSafeAreaInsets();
  const palette = { ...PALETTE[useColorScheme() === 'dark' ? 'dark' : 'light'], ...colors };
  const top = position === 'top';
  const ordered = top ? [...items].reverse() : items;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.viewport, top ? { top: insets.top + offset } : { bottom: insets.bottom + offset }]}
    >
      {ordered.map((item) => (
        <ToastCard key={item.id} item={item} edge={top ? -1 : 1} colors={palette} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { position: 'absolute', left: 12, right: 12, gap: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderCurve: 'continuous',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.18)',
  },
  icon: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  iconGlyph: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  texts: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '600' },
  description: { fontSize: 14 },
  action: { paddingHorizontal: 4, paddingVertical: 6 },
  pressed: { opacity: 0.5 },
  actionLabel: { fontSize: 15, fontWeight: '600' },
});
