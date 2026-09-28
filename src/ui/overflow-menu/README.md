# OverflowMenu

Header "more" menu (`…` iOS / `⋮` Android) declared from data. 100 % native: UIMenu on iOS, Compose `DropdownMenu` on Android — animations run on the UI thread, zero JS cost.

## Requirements

- Expo SDK 57+ with `expo-router` (native `Stack`)
- `@expo/ui` (used by expo-router for the Android menu) — installed by the CLI

## Install

```bash
npx @aycode/native-ui add overflow-menu
```

## Usage

Render it inside any screen of a native `Stack`:

```tsx
import { OverflowMenu, type MenuEntry } from '@/ui/overflow-menu';

type Action = 'sort:name' | 'sort:date' | 'share' | 'delete';

const items: MenuEntry<Action>[] = [
  {
    title: 'Sort by',
    inline: true, // section with divider — omit for a nested submenu
    items: [
      { id: 'sort:name', title: 'Name', isOn: sortBy === 'name' },
      { id: 'sort:date', title: 'Date', isOn: sortBy === 'date' },
    ],
  },
  { id: 'share', title: 'Share', sf: 'square.and.arrow.up' },
  { id: 'delete', title: 'Delete', sf: 'trash', destructive: true },
];

export default function Screen() {
  return (
    <>
      <ScrollView contentInsetAdjustmentBehavior="automatic">{/* content first */}</ScrollView>
      <OverflowMenu items={items} onAction={(id) => { /* id is typed as Action */ }} />
    </>
  );
}
```

## API

| Prop | Type | Default |
|---|---|---|
| `items` | `MenuEntry<Id>[]` — empty array renders nothing | — |
| `onAction` | `(id: Id) => void` | — |
| `placement` | `'left' \| 'right'` | `'right'` |
| `accessibilityLabel` | `string` | `'More options'` |

**`MenuAction`**: `id`, `title`, `subtitle?`, `sf?` (SF Symbol, iOS only), `isOn?` (checkmark), `disabled?`, `destructive?`
**`MenuGroup`**: `title?`, `sf?`, `inline?` (`true` = section, `false` = submenu), `items`

## Notes

- Android shows no item icons (expo-router drops SF Symbols there) — titles only.
- Keep the menu a direct child of the screen: `Stack.Toolbar.*` can't be wrapped in custom components.
- Demo: `src/app/(home)`, `(explore)`, `(activity)` in this repo.
