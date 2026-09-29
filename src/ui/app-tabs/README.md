# AppTabs + TabStack

Bottom tab bar driven by a config array, with a native stack (header, large title, search, menu) in each tab.
Platform tab bar: **Liquid Glass on iOS 26+**, **Material 3 on Android**. Push / pop use the native stack transition. On Android, tab switches play a Material transition on the UI thread — by default **shared axis X**, strong and reversed (45dp slide from the side opposite to the tab you come from + fade, 300 ms, Material 3 emphasized decelerate). **Fade-through** (scale + fade) is the alternative. NativeTabs has no native option for it. iOS keeps the instant platform switch (opt-in).

## Requirements

- Expo SDK 57+ with `expo-router` (`NativeTabs` from `expo-router/unstable-native-tabs`)
- `react-native-reanimated` 4 + `react-native-worklets` (New Architecture)

## Install

```bash
npx @ay-code/native-ui add app-tabs
```

## Usage

**1. Routes** — one group per tab; `name` in the config = folder name:

```
src/app/
  _layout.tsx          ← <AppTabs />
  (home)/_layout.tsx   ← TabStack
  (home)/index.tsx     ← "/" must exist
  (search)/_layout.tsx
  (search)/search.tsx
```

**2. Config** — define once, outside render:

```ts
// src/constants/tabs.ts
import type { TabConfig } from '@/ui/app-tabs';

export const TABS = [
  { name: '(home)', label: 'Home', icon: { sf: { default: 'house', selected: 'house.fill' }, md: 'home' } },
  { name: '(search)', label: 'Search', icon: { sf: 'magnifyingglass', md: 'search' } },
] as const satisfies readonly TabConfig[];
```

**3. Root layout**:

```tsx
// src/app/_layout.tsx
import { AppTabs } from '@/ui/app-tabs';
import { TABS } from '@/constants/tabs';

export default function RootLayout() {
  return <AppTabs tabs={TABS} badges={{ '(home)': 3 }} tintColor="#3390EC" />;
}
```

**4. Each tab layout** — one line:

```tsx
// src/app/(home)/_layout.tsx
export { TabStack as default } from '@/ui/app-tabs';
```

**5. Screens** set their own header: `<Stack.Title large>Home</Stack.Title>`, `<Stack.SearchBar />`, `<OverflowMenu />` (see `../overflow-menu`).
Put the `ScrollView` / `FlashList` **first** with `contentInsetAdjustmentBehavior="automatic"`.

## API

**`AppTabs`** — all `NativeTabs` props, plus:

| Prop | Type | Notes |
|---|---|---|
| `tabs` | `TabConfig[]` | static, max 5 on Android |
| `badges` | `Partial<Record<name, number \| string>>` | `0` hides, `> 99` → `99+` |
| `hiddenTabs` | `Partial<Record<name, boolean>>` | hidden tab = not in the bar and not navigable; a change remounts the tabs (state reset) |

Default: `minimizeBehavior="onScrollDown"` (iOS 26). Android styling: `indicatorColor`, `rippleColor`, `labelVisibilityMode`, `iconColor`, `labelStyle`.

**`TabStack`** — all `Stack` props, plus `transition`. `TAB_STACK_OPTIONS` = defaults (large title, transparent header on iOS, minimal back button). Extend: `screenOptions={{ ...TAB_STACK_OPTIONS, headerTintColor }}`.

| Prop | Type | Notes |
|---|---|---|
| `transition` | `TabTransition` (below) | played on tab focus; all fields optional |

**`TabTransition`** — every field is optional. Pick an `intensity`: it sets `distance`, `startScale` and `duration` together, kept proportional. Override any of the three directly when needed. Static or inline object, both are fine.

| Field | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'shared-axis' \| 'fade-through'` | `'shared-axis'` | shared-axis = side slide + fade, side from the tab order (mirrored in RTL); fade-through = scale + fade |
| `intensity` | `'subtle' \| 'medium' \| 'strong' \| 'max'` or `number` (dp, 0–90) | `'strong'` | preset (table below), or a slide distance from which the scale and duration are derived |
| `reverse` | `boolean` | `true` | `shared-axis`: enter from the side opposite to the tab you come from. `false` = from the same side |
| `duration` | `number` (ms) | from `intensity` | override |
| `distance` | `number` (dp) | from `intensity` | override. Negative also reverses |
| `startScale` | `number` 0–1 | from `intensity` | override (clamped) |
| `easing` | Reanimated `EasingFunction` / `Easing.bezier(...)` | `Easing.bezier(0.1, 0.7, 0.1, 1)` | Material 3 emphasized decelerate; keep a decelerate curve, never `Easing.in` |
| `enabled` | `boolean` | `true` Android · `false` iOS | `false` = instant switch |

```tsx
<TabStack />                                                        // shared-axis, strong, reversed
<TabStack transition={{ intensity: 'subtle', reverse: false }} />   // Material's own spec, natural side
<TabStack transition={{ variant: 'fade-through', intensity: 50 }} /> // derived: 50dp, scale 0.72, 310 ms
<TabStack transition={{ intensity: 'medium', duration: 320 }} />    // preset + one override
```

Same transition for every tab: wrap it once and point each tab layout to it.

```tsx
// src/components/tab-layout.tsx
export function TabLayout() {
  return <TabStack transition={{ intensity: 'medium' }} />;
}
// src/app/(home)/_layout.tsx
export { TabLayout as default } from '@/components/tab-layout';
```

Custom tab layout: `useTabTransition(transition)` returns the animated style — put it on an `Animated.View` around your `Stack`.

### Tuning

`distance`, `startScale` and `duration` move together. Changing one alone is what makes a transition feel off: a big move that's too fast looks like a jump, a small one that's too slow looks sluggish. `intensity` keeps them in step — exported as `TAB_TRANSITION_INTENSITIES` and `tabTransitionTuning(distance)`.

| `intensity` | `distance` | `startScale` | `duration` |
|---|---|---|---|
| `'subtle'` (Material spec, predates the rule) | `30` | `0.92` | `250` |
| `'medium'` | `36` | `0.8` | `280` |
| **`'strong'` (default)** | **`45`** | **`0.75`** | **`300`** |
| `'max'` | `60` | `0.67` | `330` |
| `number` (dp) | `n` | `1 − n / 180` | `200 + 2.2 × n` (rounded to 5 ms) |

Rules of thumb when overriding:

- **Duration follows amplitude**: `duration ≈ 200 + 2.2 × |distance|` ms. Past ~350 ms a tab switch feels slow — it's done dozens of times per session.
- **Scale follows distance**: `startScale ≈ 1 − |distance| / 180`, so both variants have the same visual weight and you can swap `variant` without retuning.
- **Keep the decelerate curve** (fast start, soft settle) whatever the amplitude; only change it for another decelerate (e.g. Material 3 standard decelerate `Easing.bezier(0, 0, 0, 1)`).
- Opacity is fixed to finish at 80% of the motion, so the settle happens on solid content — nothing to tune.
- Reduced motion is automatic (fade only) and ignores these values.

**`TabConfig`**: `name` (`'(group)'`), `label`, `icon` (`sf` iOS SF Symbol, `md` Android Material Symbol).

## Notes

- Tab switch: the outgoing tab is hidden natively, only the incoming one animates — which is why `shared-axis` is a short offset (45dp by default), not a full-width slide (there is no swipe between tabs either: native tab bars have none). Material recommends `fade-through` for bottom navigation; `shared-axis` suits tabs with a strong left-to-right order. The launch tab doesn't animate; every other tab animates from its first visit. Reduced motion: fade only, no scale; push / pop become `animation: 'fade'` (unless `screenOptions.animation` is set).
- Stack transitions stay native on purpose (interactive back gesture, platform timing). `animationDuration` is iOS-only; on Android pick an `animation` value per screen, or `presentation: 'modal' | 'formSheet'`.
- Judge smoothness on a release build (`npx expo run:android --variant release`), not Expo Go / dev.

- Wrap the root in `ThemeProvider` (from `expo-router`) to avoid header flicker between tabs.
- Don't add / remove tabs at runtime — it remounts the navigator. To gate a tab (roles, feature flag), keep it in `tabs` and use `hiddenTabs`; guard the screens pushed from it with `Stack.Protected`. Toggling `hiddenTabs` remounts the navigator too (state reset): resolve the gate before the tabs mount (e.g. behind the splash screen).
- A hidden tab has no redirect: if its route gets focused (deep link), NativeTabs throws in dev and falls back to the first tab in prod.
- Screens without a scroll view (e.g. `@expo/ui` `List`): `<Stack.Screen options={{ headerTransparent: false, headerLargeTitleEnabled: false }} />`.
