import { Stack } from 'expo-router';

/** Native stack shared by every tab. Titles, search and menus are declared by each screen. */
export function TabStack() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitleEnabled: true,
        headerTransparent: process.env.EXPO_OS === 'ios',
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
      }}
    />
  );
}
