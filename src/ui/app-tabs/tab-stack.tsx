import { Stack } from 'expo-router';
import type { ComponentProps } from 'react';

type StackProps = ComponentProps<typeof Stack>;

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
 */
export function TabStack({ screenOptions = TAB_STACK_OPTIONS, ...props }: StackProps) {
  return <Stack screenOptions={screenOptions} {...props} />;
}
