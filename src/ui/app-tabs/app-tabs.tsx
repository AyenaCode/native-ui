import type { Href } from 'expo-router';
import { NativeTabs, type NativeTabsProps, type NativeTabsTriggerIconProps } from 'expo-router/unstable-native-tabs';
import { useMemo } from 'react';

import { SlidingTabs } from './sliding-tabs';
import type { TabRipple } from './sliding-tabs.types';
import { TabMotionContext, type TabMotion } from './tab-motion';
import type { TabTransition } from './use-tab-transition';

export type TabConfig<Name extends string = string> = {
  /** Route group name, must match a folder in `app/` — e.g. `'(home)'`. */
  name: Name;
  label: string;
  /** `sf` = SF Symbol (iOS), `md` = Material Symbol (Android). */
  icon: NativeTabsTriggerIconProps;
  /** Path of the tab's first screen, e.g. `'/'` or `'/explore'`. Required by `slidingIndicator`. */
  href?: Href;
};

export type AppTabsProps<Name extends string> = Omit<NativeTabsProps, 'children'> & {
  /** Keep static (defined once, outside render). Max 5 on Android. */
  tabs: readonly TabConfig<Name>[];
  /** Badge per tab. `0` / `undefined` hides it, values above 99 show `99+`. */
  badges?: Partial<Record<Name, number | string>>;
  /** Tabs to hide, e.g. by permission: hidden and unreachable. A change remounts the tabs. */
  hiddenTabs?: Partial<Record<Name, boolean>>;
  /** Screen transition of every tab (each `TabStack` can override it) and timing of the sliding indicator. */
  transition?: TabTransition;
  /**
   * Android: Material 3 bar drawn with Jetpack Compose whose active indicator slides with the screen.
   * Every tab needs an `href`. iOS keeps the system tab bar. Default `false`.
   */
  slidingIndicator?: boolean;
  /** `slidingIndicator` press feedback: `'pill'` ripple clipped to the indicator (default), `'item'` whole tab, `'none'`. */
  ripple?: TabRipple;
};

const formatBadge = (value: number | string) => (typeof value === 'number' && value > 99 ? '99+' : String(value));

/**
 * Platform tab bar driven by a config array: Liquid Glass on iOS 26+, Material 3 on Android.
 * `slidingIndicator` swaps the Android bar for a Compose one with a sliding indicator. See README.md.
 */
export function AppTabs<Name extends string>({
  tabs,
  badges,
  hiddenTabs,
  transition,
  slidingIndicator = false,
  ripple,
  ...nativeTabsProps
}: AppTabsProps<Name>) {
  const sliding = slidingIndicator && process.env.EXPO_OS === 'android';
  const motion = useMemo<TabMotion>(
    () => ({ order: tabs.filter((tab) => !hiddenTabs?.[tab.name]).map((tab) => tab.name), transition, sliding }),
    [tabs, hiddenTabs, transition, sliding],
  );

  return (
    <TabMotionContext value={motion}>
      {sliding ? (
        <SlidingTabs
          {...nativeTabsProps}
          tabs={tabs}
          badges={badges}
          hiddenTabs={hiddenTabs}
          transition={transition}
          ripple={ripple}
        />
      ) : (
        <NativeTabs minimizeBehavior="onScrollDown" {...nativeTabsProps}>
          {tabs.map((tab) => {
            const badge = badges?.[tab.name];
            return (
              <NativeTabs.Trigger key={tab.name} name={tab.name} hidden={hiddenTabs?.[tab.name] ?? false}>
                <NativeTabs.Trigger.Icon {...tab.icon} />
                <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
                {badge ? <NativeTabs.Trigger.Badge>{formatBadge(badge)}</NativeTabs.Trigger.Badge> : null}
              </NativeTabs.Trigger>
            );
          })}
        </NativeTabs>
      )}
    </TabMotionContext>
  );
}
