import type { TabConfig } from '@/ui/app-tabs';

/** Showcase tabs. Order = display order. */
export const TABS = [
  { name: '(home)', label: 'Home', icon: { sf: { default: 'house', selected: 'house.fill' }, md: 'home' } },
  { name: '(explore)', label: 'Explore', icon: { sf: 'safari', md: 'explore' } },
  { name: '(activity)', label: 'Activity', icon: { sf: { default: 'bell', selected: 'bell.fill' }, md: 'notifications' } },
  { name: '(profile)', label: 'Profile', icon: { sf: { default: 'person', selected: 'person.fill' }, md: 'person' } },
] as const satisfies readonly TabConfig[];
