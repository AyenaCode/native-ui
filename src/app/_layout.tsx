import { ThemeProvider } from 'expo-router';

import { TABS } from '@/constants/tabs';
import { Colors, NavigationThemes } from '@/constants/theme';
import { useScheme } from '@/hooks/use-colors';
import { useUnreadCount } from '@/hooks/use-notifications';
import { AppTabs } from '@/ui/app-tabs';

export default function RootLayout() {
  const scheme = useScheme();
  const unread = useUnreadCount();

  return (
    <ThemeProvider value={NavigationThemes[scheme]}>
      <AppTabs tabs={TABS} badges={{ '(activity)': unread }} tintColor={Colors[scheme].accent} />
    </ThemeProvider>
  );
}
