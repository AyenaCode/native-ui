import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';

export const Colors = {
  light: {
    accent: '#3390EC',
    background: '#FFFFFF',
    surface: '#F1F1F4',
    text: '#0F0F10',
    muted: '#707579',
    separator: '#E4E4E7',
    onAccent: '#FFFFFF',
  },
  dark: {
    accent: '#5EB5F7',
    background: '#17191C',
    surface: '#22252A',
    text: '#FFFFFF',
    muted: '#8D9399',
    separator: '#2C2F34',
    onAccent: '#FFFFFF',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type AppColors = (typeof Colors)[ColorScheme];

export const AVATAR_COLORS = ['#E17076', '#7BC862', '#65AADD', '#A695E7', '#EE7AAE', '#6EC9CB', '#FAA774'] as const;

const toNavigationTheme = (base: Theme, c: AppColors): Theme => ({
  ...base,
  colors: {
    ...base.colors,
    primary: c.accent,
    background: c.background,
    card: c.background,
    text: c.text,
    border: c.separator,
    notification: c.accent,
  },
});

export const NavigationThemes: Record<ColorScheme, Theme> = {
  light: toNavigationTheme(DefaultTheme, Colors.light),
  dark: toNavigationTheme(DarkTheme, Colors.dark),
};
