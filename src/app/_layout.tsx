import { ThemeProvider } from 'expo-router';

import { AppTabs } from '@/components/navigation/app-tabs';
import { NavigationThemes } from '@/constants/theme';
import { useScheme } from '@/hooks/use-colors';

export default function RootLayout() {
  return (
    <ThemeProvider value={NavigationThemes[useScheme()]}>
      <AppTabs />
    </ThemeProvider>
  );
}
