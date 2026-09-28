import type { NativeTabsTriggerIconProps } from 'expo-router/unstable-native-tabs';

export type TabConfig = {
  /** Route group name, must match the folder in `src/app/`. */
  name: `(${string})`;
  label: string;
  icon: NativeTabsTriggerIconProps;
};

/** Single source of truth for the bottom tabs. Order = display order. Keep static (max 5 on Android). */
export const TABS = [
  { name: '(home)', label: 'Home', icon: { sf: { default: 'house', selected: 'house.fill' }, md: 'home' } },
  { name: '(explore)', label: 'Explore', icon: { sf: 'safari', md: 'explore' } },
  { name: '(activity)', label: 'Activity', icon: { sf: { default: 'bell', selected: 'bell.fill' }, md: 'notifications' } },
  { name: '(profile)', label: 'Profile', icon: { sf: { default: 'person', selected: 'person.fill' }, md: 'person' } },
] as const satisfies readonly TabConfig[];

export type TabName = (typeof TABS)[number]['name'];
