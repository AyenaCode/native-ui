import type { TabConfig, TabTransition } from '@/ui/app-tabs';

/** Showcase tabs. Order = display order. */
export const TABS = [
  { name: '(home)', href: '/', label: 'Home', icon: { sf: { default: 'house', selected: 'house.fill' }, md: 'home' } },
  { name: '(explore)', href: '/explore', label: 'Explore', icon: { sf: 'safari', md: 'explore' } },
  { name: '(activity)', href: '/activity', label: 'Activity', icon: { sf: { default: 'bell', selected: 'bell.fill' }, md: 'notifications' } },
  { name: '(profile)', href: '/profile', label: 'Profile', icon: { sf: { default: 'person', selected: 'person.fill' }, md: 'person' } },
] as const satisfies readonly TabConfig[];

/** Tab switch motion for every showcase tab. `{}` = component defaults (shared-axis, strong, reversed). Try `variant: 'fade-through'`, `intensity: 'subtle'`, `reverse: false`. */
export const TAB_TRANSITION = {} as const satisfies TabTransition;
