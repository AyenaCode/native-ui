import { Stack } from 'expo-router';
import { useMemo, type ComponentProps } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { useTabTransition, type TabTransition } from './use-tab-transition';

type StackProps = ComponentProps<typeof Stack>;

export type TabStackProps = StackProps & {
  /** Fade-through played when the tab gains focus. `{ enabled: false }` to switch instantly. */
  transition?: TabTransition;
};

/** Defaults for a stack living inside a tab. Spread it to extend: `{ ...TAB_STACK_OPTIONS, headerTintColor }`. */
export const TAB_STACK_OPTIONS = {
  headerLargeTitleEnabled: true,
  headerTransparent: process.env.EXPO_OS === 'ios',
  headerShadowVisible: false,
  headerLargeTitleShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal',
} as const satisfies StackProps['screenOptions'];

/**
 * Native stack for one tab (NativeTabs render no header). Use as the tab group's `_layout.tsx`:
 * `export { TabStack as default } from '@/ui/app-tabs';`
 * Screens set their own title / search / menu with `Stack.Title`, `Stack.SearchBar`, `OverflowMenu`.
 * Push / pop keep the native platform transition; reduced motion turns it into a fade.
 */
export function TabStack({ screenOptions = TAB_STACK_OPTIONS, transition, ...props }: TabStackProps) {
  const reduced = useReducedMotion();
  const style = useTabTransition(transition);
  const options = useMemo(
    () => (reduced && typeof screenOptions === 'object' ? { animation: 'fade' as const, ...screenOptions } : screenOptions),
    [reduced, screenOptions],
  );

  return (
    <Animated.View style={[styles.fill, style]}>
      <Stack screenOptions={options} {...props} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
