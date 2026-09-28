import { useColorScheme } from 'react-native';

import { Colors, type ColorScheme } from '@/constants/theme';

export function useScheme(): ColorScheme {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}

export function useColors() {
  return Colors[useScheme()];
}
