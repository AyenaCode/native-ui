import { NativeTabs, type NativeTabsProps, type NativeTabsTriggerIconProps } from 'expo-router/unstable-native-tabs';

export type TabConfig<Name extends string = string> = {
  /** Route group name, must match a folder in `app/` — e.g. `'(home)'`. */
  name: Name;
  label: string;
  /** `sf` = SF Symbol (iOS), `md` = Material Symbol (Android). */
  icon: NativeTabsTriggerIconProps;
};

export type AppTabsProps<Name extends string> = Omit<NativeTabsProps, 'children'> & {
  /** Keep static (defined once, outside render). Max 5 on Android. */
  tabs: readonly TabConfig<Name>[];
  /** Badge per tab. `0` / `undefined` hides it, values above 99 show `99+`. */
  badges?: Partial<Record<Name, number | string>>;
  /** Tabs to hide, e.g. by permission: hidden and unreachable. A change remounts the tabs. */
  hiddenTabs?: Partial<Record<Name, boolean>>;
};

const formatBadge = (value: number | string) => (typeof value === 'number' && value > 99 ? '99+' : String(value));

/**
 * Platform tab bar driven by a config array: Liquid Glass on iOS 26+, Material 3 on Android.
 * Native switching and transitions — no JS animation. See README.md.
 */
export function AppTabs<Name extends string>({ tabs, badges, hiddenTabs, ...nativeTabsProps }: AppTabsProps<Name>) {
  return (
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
  );
}
