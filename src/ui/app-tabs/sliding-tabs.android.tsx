import { Badge, BadgedBox, Box, Column, Host, Icon, Row, Text, useMaterialColors } from '@expo/ui/jetpack-compose';
import {
  alpha,
  animated,
  background,
  clickable,
  clip,
  fillMaxHeight,
  fillMaxWidth,
  graphicsLayer,
  matchParentSize,
  offset,
  onSizeChanged,
  selectable,
  selectableGroup,
  Shapes,
  size,
  snap,
  tween,
  weight,
} from '@expo/ui/jetpack-compose/modifiers';
import { TabSlot, useTabsWithTriggers } from 'expo-router/ui';
import { unstable_getMaterialSymbolSourceAsync, type AndroidSymbol } from 'expo-symbols';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { I18nManager, StyleSheet, useColorScheme, View, type ColorValue, type ImageSourcePropType } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { TabConfig } from './app-tabs';
import type { BarColors, SlidingTabsProps } from './sliding-tabs.types';
import { resolveTabTransition } from './use-tab-transition';

// Material 3 navigation bar metrics (dp).
const BAR_HEIGHT = 80;
const INDICATOR_WIDTH = 64;
const INDICATOR_HEIGHT = 32;
const INDICATOR_TOP = 12;
const ICON_SIZE = 24;
// Glyphs are rendered once in white (expo-font scales them to the screen density) and tinted by Compose.

type Glyphs = Record<string, ImageSourcePropType>;
type ScreenTrigger = Parameters<typeof useTabsWithTriggers>[0]['triggers'][number];

const formatBadge = (value: number | string) => (typeof value === 'number' && value > 99 ? '99+' : String(value));

function symbolsOf(tab: TabConfig): { default?: AndroidSymbol; selected?: AndroidSymbol } {
  const md = 'md' in tab.icon ? tab.icon.md : undefined;
  if (!md) return {};
  return typeof md === 'string' ? { default: md, selected: md } : { default: md.default ?? md.selected, selected: md.selected };
}

/** Loads every Material Symbol glyph of the bar once. `null` until all are ready, so the bar never flashes empty. */
function useGlyphs(tabs: readonly TabConfig[]) {
  const names = useMemo(
    () => [...new Set(tabs.flatMap((tab) => Object.values(symbolsOf(tab)).filter((name) => name !== undefined)))],
    [tabs],
  );
  const key = names.join('|');
  const [glyphs, setGlyphs] = useState<{ key: string; sources: Glyphs } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all(names.map((name) => unstable_getMaterialSymbolSourceAsync(name, ICON_SIZE, 'white'))).then(
      (sources) => {
        if (cancelled) return;
        const loaded: Glyphs = {};
        sources.forEach((source, i) => {
          if (source) loaded[names[i]] = source;
        });
        setGlyphs({ key, sources: loaded });
      },
      (error: unknown) => {
        console.warn('[AppTabs] Could not load Material Symbols for the sliding tab bar.', error);
        if (!cancelled) setGlyphs({ key, sources: {} });
      },
    );
    return () => {
      cancelled = true;
    };
    // `key` identifies `names`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return glyphs?.key === key ? glyphs.sources : null;
}

function useBarColors(props: SlidingTabsProps): BarColors {
  const scheme = useColorScheme();
  const m3 = useMaterialColors({ colorScheme: scheme });
  const icon = props.iconColor;
  const unselectedIcon = (typeof icon === 'object' && icon !== null && 'default' in icon ? icon.default : icon) as
    | ColorValue
    | undefined;
  const selectedIcon = typeof icon === 'object' && icon !== null && 'selected' in icon ? icon.selected : undefined;
  return {
    container: props.backgroundColor ?? m3.surfaceContainer,
    indicator: props.indicatorColor ?? m3.secondaryContainer,
    selectedIcon: selectedIcon ?? props.tintColor ?? m3.onSecondaryContainer,
    selectedLabel: props.tintColor ?? m3.onSurface,
    unselectedIcon: unselectedIcon ?? m3.onSurfaceVariant,
    unselectedLabel: m3.onSurfaceVariant,
    badge: props.badgeBackgroundColor ?? m3.error,
    badgeText: props.badgeTextColor ?? m3.onError,
  };
}

/**
 * Android tab bar drawn with Jetpack Compose (`@expo/ui`): Material 3 metrics and colors (Material You),
 * with an active indicator that slides between tabs, animated by Compose on the UI thread.
 * Screens are hosted by expo-router's headless tabs.
 */
export function SlidingTabs(props: SlidingTabsProps) {
  const { tabs, badges, hiddenTabs, backBehavior = 'initialRoute', transition, hidden, disableIndicator } = props;
  const visible = useMemo(() => tabs.filter((tab) => !hiddenTabs?.[tab.name]), [tabs, hiddenTabs]);
  const triggers = useMemo(
    () =>
      visible.map((tab): ScreenTrigger => {
        if (!tab.href) throw new Error(`[AppTabs] slidingIndicator: tab '${tab.name}' needs an \`href\` (e.g. '/').`);
        return { type: 'internal', name: tab.name, href: tab.href };
      }),
    [visible],
  );
  const { state, navigation, NavigationContent } = useTabsWithTriggers({ triggers, backBehavior });

  useEffect(() => {
    const noSymbol = visible.filter((tab) => !('md' in tab.icon)).map((tab) => tab.name);
    if (noSymbol.length) {
      console.warn(`[AppTabs] slidingIndicator draws Material Symbols only (icon.md). No icon for: ${noSymbol.join(', ')}.`);
    }
  }, [visible]);

  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const colors = useBarColors(props);
  const glyphs = useGlyphs(visible);
  const { duration } = resolveTabTransition(transition);
  const labels = props.labelVisibilityMode ?? 'labeled';
  const ripple = props.ripple ?? 'pill';

  // Bar width in dp, from Compose. The indicator is composed only once it's known: Compose starts an
  // animated value at its first target, so it appears in place, then slides on every later change.
  const [width, setWidth] = useState(0);

  const focusedName = state.routes[state.index]?.name;
  const focusedIndex = Math.max(
    0,
    visible.findIndex((tab) => tab.name === focusedName),
  );
  const itemWidth = visible.length ? width / visible.length : 0;
  // The Host is laid out left-to-right (translationX is never mirrored); RTL order comes from reversing the items.
  const items = I18nManager.isRTL ? [...visible].reverse() : visible;
  const slot = I18nManager.isRTL ? visible.length - 1 - focusedIndex : focusedIndex;
  const indicatorX = itemWidth * slot + (itemWidth - INDICATOR_WIDTH) / 2;
  const spec = reduced ? snap() : tween({ durationMillis: duration, easing: 'linearOutSlowIn' });

  const onPress = useCallback(
    (name: string) => {
      const route = state.routes.find((r) => r.name === name);
      if (!route) return;
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      // Tapping the active tab: the tab's native stack handles `tabPress` and pops to its root.
      if (route.key !== state.routes[state.index]?.key && !event.defaultPrevented) {
        navigation.dispatch({ type: 'JUMP_TO', payload: { name } });
      }
    },
    [navigation, state],
  );

  return (
    <NavigationContent>
      <View style={styles.fill}>
        <TabSlot />
      </View>
      {hidden ? null : (
        <View style={{ backgroundColor: colors.container, paddingBottom: insets.bottom }}>
          <Host style={styles.bar} layoutDirection="leftToRight">
            <Box
              modifiers={[
                fillMaxWidth(),
                fillMaxHeight(),
                background(colors.container),
                onSizeChanged(({ width: w }) => setWidth(w)),
              ]}>
              {disableIndicator || width === 0 ? null : (
                <Box
                  modifiers={[
                    offset(0, INDICATOR_TOP),
                    graphicsLayer({ translationX: animated(indicatorX, spec) }),
                    size(INDICATOR_WIDTH, INDICATOR_HEIGHT),
                    clip(Shapes.RoundedCorner(INDICATOR_HEIGHT / 2)),
                    background(colors.indicator),
                  ]}
                />
              )}
              <Row modifiers={[fillMaxWidth(), fillMaxHeight(), selectableGroup()]}>
                {items.map((tab) => {
                  const selected = tab.name === focusedName;
                  const symbols = symbolsOf(tab);
                  const source = glyphs?.[(selected ? symbols.selected : symbols.default) ?? ''];
                  const badge = badges?.[tab.name];
                  const showLabel = labels === 'labeled' || labels === 'auto' || (labels === 'selected' && selected);
                  return (
                    <Column
                      key={tab.name}
                      horizontalAlignment="center"
                      modifiers={[
                        weight(1),
                        fillMaxHeight(),
                        // 'item': ripple over the whole tab. Otherwise the whole tab stays tappable without one.
                        ripple === 'item'
                          ? selectable(selected, () => onPress(tab.name), 'tab')
                          : clickable(() => onPress(tab.name), { indication: false }),
                      ]}>
                      <Box
                        contentAlignment="center"
                        modifiers={[offset(0, INDICATOR_TOP), size(INDICATOR_WIDTH, INDICATOR_HEIGHT)]}>
                        {ripple === 'pill' ? (
                          // Ripple layer clipped to the pill (Material 3), under the icon so the badge isn't clipped.
                          <Box
                            modifiers={[
                              matchParentSize(),
                              clip(Shapes.RoundedCorner(INDICATOR_HEIGHT / 2)),
                              selectable(selected, () => onPress(tab.name), 'tab'),
                            ]}
                          />
                        ) : null}
                        <BadgedBox>
                          {source ? (
                            <Icon
                              source={source}
                              size={ICON_SIZE}
                              tint={String(selected ? colors.selectedIcon : colors.unselectedIcon)}
                              // The visible label already names the tab; describe the icon only when it's alone.
                              contentDescription={showLabel ? undefined : tab.label}
                            />
                          ) : (
                            <Box modifiers={[size(ICON_SIZE, ICON_SIZE)]} />
                          )}
                          {badge ? (
                            <BadgedBox.Badge>
                              <Badge containerColor={colors.badge} contentColor={colors.badgeText}>
                                <Text>{formatBadge(badge)}</Text>
                              </Badge>
                            </BadgedBox.Badge>
                          ) : null}
                        </BadgedBox>
                      </Box>
                      {labels === 'unlabeled' ? null : (
                        <Text
                          style={{ typography: 'labelMedium' }}
                          maxLines={1}
                          color={String(selected ? colors.selectedLabel : colors.unselectedLabel)}
                          modifiers={[offset(0, INDICATOR_TOP + 4), alpha(showLabel ? 1 : 0)]}>
                          {tab.label}
                        </Text>
                      )}
                    </Column>
                  );
                })}
              </Row>
            </Box>
          </Host>
        </View>
      )}
    </NavigationContent>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  bar: { width: '100%', height: BAR_HEIGHT },
});
