import type { ColorValue } from 'react-native';
import type { NativeTabsProps } from 'expo-router/unstable-native-tabs';

import type { TabConfig } from './app-tabs';
import type { TabTransition } from './use-tab-transition';

export type SlidingTabsProps = Pick<
  NativeTabsProps,
  | 'tintColor'
  | 'iconColor'
  | 'backgroundColor'
  | 'indicatorColor'
  | 'disableIndicator'
  | 'badgeBackgroundColor'
  | 'badgeTextColor'
  | 'labelVisibilityMode'
  | 'hidden'
  | 'backBehavior'
> & {
  tabs: readonly TabConfig[];
  badges?: Partial<Record<string, number | string>>;
  hiddenTabs?: Partial<Record<string, boolean>>;
  transition?: TabTransition;
  ripple?: TabRipple;
};

/** Press feedback of the sliding bar: `'pill'` (Material 3, default), `'item'` (whole tab), `'none'`. */
export type TabRipple = 'pill' | 'item' | 'none';

export type BarColors = {
  container: ColorValue;
  indicator: ColorValue;
  selectedIcon: ColorValue;
  selectedLabel: ColorValue;
  unselectedIcon: ColorValue;
  unselectedLabel: ColorValue;
  badge: ColorValue;
  badgeText: ColorValue;
};
