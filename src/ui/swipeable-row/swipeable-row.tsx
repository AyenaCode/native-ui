import * as Haptics from 'expo-haptics';
import { useEffect, useRef, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type ColorValue } from 'react-native';
import Swipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

export type SwipeAction<Id extends string = string> = {
  id: Id;
  label: string;
  /** Button background. */
  color: ColorValue;
  /** Optional icon above the label. */
  icon?: ReactNode;
};

export type SwipeableRowProps<Id extends string> = {
  children: ReactNode;
  /** Revealed by swiping right. */
  leftActions?: readonly SwipeAction<Id>[];
  /** Revealed by swiping left. */
  rightActions?: readonly SwipeAction<Id>[];
  onAction: (id: Id) => void;
  /** Width of each action button. */
  actionWidth?: number;
  /** Light haptic when the row snaps open. */
  haptics?: boolean;
  enabled?: boolean;
  /** Item id when rendered in FlashList / FlatList: closes the row if its cell gets recycled. */
  id?: string | number;
};

type Side = 'left' | 'right';

// One open row at a time, app-wide (like iOS Mail).
let openRow: SwipeableMethods | null = null;

function ActionButton<Id extends string>({
  action,
  index,
  count,
  side,
  width,
  translation,
  onPress,
}: {
  action: SwipeAction<Id>;
  index: number;
  count: number;
  side: Side;
  width: number;
  translation: SharedValue<number>;
  onPress: (id: Id) => void;
}) {
  // Buttons stay pinned to the moving row edge and fan out as the row opens (UI thread, follows the finger).
  const style = useAnimatedStyle(() => {
    const total = count * width;
    const p = Math.min(Math.abs(translation.get()) / total, 1);
    const hidden = side === 'right' ? total - index * width : -(index + 1) * width;
    return { transform: [{ translateX: hidden * (1 - p) }] };
  });

  return (
    <Animated.View style={[{ width, zIndex: side === 'right' ? count - index : index }, style]}>
      <Pressable
        onPress={() => onPress(action.id)}
        accessibilityRole="button"
        style={[styles.button, { backgroundColor: action.color }]}
      >
        {action.icon}
        <Text style={styles.label} numberOfLines={1}>
          {action.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/**
 * List row with swipe-to-reveal actions. Gesture + spring on the UI thread (gesture-handler's
 * ReanimatedSwipeable), one open row at a time, auto-close after an action, screen-reader actions. See README.md.
 */
export function SwipeableRow<Id extends string>({
  children,
  leftActions = [],
  rightActions = [],
  onAction,
  actionWidth = 80,
  haptics = true,
  enabled = true,
  id,
}: SwipeableRowProps<Id>) {
  const ref = useRef<SwipeableMethods>(null);

  // Recycled cell (new item) or unmount: close without animation and release the "open" slot.
  useEffect(() => {
    const row = ref.current;
    return () => {
      row?.reset();
      if (openRow === row) openRow = null;
    };
  }, [id]);

  const renderActions = (side: Side, actions: readonly SwipeAction<Id>[]) =>
    actions.length === 0
      ? undefined
      : (_progress: SharedValue<number>, translation: SharedValue<number>, methods: SwipeableMethods) => (
          <View style={styles.actions}>
            {actions.map((action, index) => (
              <ActionButton
                key={action.id}
                action={action}
                index={index}
                count={actions.length}
                side={side}
                width={actionWidth}
                translation={translation}
                onPress={(actionId) => {
                  methods.close();
                  onAction(actionId);
                }}
              />
            ))}
          </View>
        );

  const allActions = [...leftActions, ...rightActions];

  return (
    <Swipeable
      ref={ref}
      enabled={enabled}
      overshootLeft={false}
      overshootRight={false}
      renderLeftActions={renderActions('left', leftActions)}
      renderRightActions={renderActions('right', rightActions)}
      onSwipeableWillOpen={() => {
        if (openRow && openRow !== ref.current) openRow.close();
        openRow = ref.current;
        if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onSwipeableClose={() => {
        if (openRow === ref.current) openRow = null;
      }}
    >
      <View
        accessibilityActions={allActions.map((a) => ({ name: a.id, label: a.label }))}
        onAccessibilityAction={(e) => onAction(e.nativeEvent.actionName as Id)}
      >
        {children}
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row' },
  button: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 8 },
  label: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
