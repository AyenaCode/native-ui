import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { TABS, type TabName } from '@/constants/tabs';
import { useColors } from '@/hooks/use-colors';
import { useUnreadCount } from '@/hooks/use-notifications';

/** Platform tab bar (Liquid Glass on iOS 26+, Material 3 on Android). Native transitions, no JS animation. */
export function AppTabs() {
  const colors = useColors();
  const badges: Partial<Record<TabName, number>> = { '(activity)': useUnreadCount() };

  return (
    <NativeTabs tintColor={colors.accent} minimizeBehavior="onScrollDown">
      {TABS.map((tab) => {
        const badge = badges[tab.name];
        return (
          <NativeTabs.Trigger key={tab.name} name={tab.name}>
            <NativeTabs.Trigger.Icon {...tab.icon} />
            <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
            {badge ? <NativeTabs.Trigger.Badge>{String(badge)}</NativeTabs.Trigger.Badge> : null}
          </NativeTabs.Trigger>
        );
      })}
    </NativeTabs>
  );
}
