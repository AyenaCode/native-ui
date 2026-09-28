import { ThemeProvider } from 'expo-router';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { TABS } from '@/constants/tabs';
import { Colors, NavigationThemes } from '@/constants/theme';
import { useScheme } from '@/hooks/use-colors';
import { useUnreadCount } from '@/hooks/use-notifications';
import { AppTabs } from '@/ui/app-tabs';
import { Toaster } from '@/ui/toast';

export default function RootLayout() {
  const scheme = useScheme();
  const unread = useUnreadCount();

  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider value={NavigationThemes[scheme]}>
        <AppTabs tabs={TABS} badges={{ '(activity)': unread }} tintColor={Colors[scheme].accent} />
        <Toaster />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
