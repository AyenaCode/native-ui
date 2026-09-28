# SwipeableRow

List row with swipe-to-reveal actions (Read, Archive, Delete…), like iOS Mail.
Built on gesture-handler's `ReanimatedSwipeable`: drag, spring and button fan-out all run on the UI thread. Extras you usually re-wire by hand: **one open row at a time**, auto-close after an action, light haptic on open, screen-reader actions, safe with recycled lists.

## Requirements

- `react-native-gesture-handler`, `react-native-reanimated` 4 + `react-native-worklets`, `expo-haptics` — installed by the CLI
- App wrapped once in `GestureHandlerRootView`:

```tsx
// src/app/_layout.tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return <GestureHandlerRootView style={{ flex: 1 }}>{/* navigator */}</GestureHandlerRootView>;
}
```

## Install

```bash
npx @ay-code/native-ui add swipeable-row
```

## Usage

```tsx
import { SwipeableRow, type SwipeAction } from '@/ui/swipeable-row';

type Action = 'archive' | 'delete';
const RIGHT: SwipeAction<Action>[] = [
  { id: 'archive', label: 'Archive', color: '#8E8E93' },
  { id: 'delete', label: 'Delete', color: '#FF3B30' },
];

<FlashList
  data={items}
  renderItem={({ item }) => (
    <SwipeableRow id={item.id} rightActions={RIGHT} onAction={(action) => handle(action, item)}>
      <View style={{ backgroundColor: 'white' }}>{/* your row */}</View>
    </SwipeableRow>
  )}
/>
```

## API

| Prop | Type | Default |
|---|---|---|
| `leftActions` / `rightActions` | `SwipeAction[]` — revealed by swiping right / left | `[]` |
| `onAction` | `(id) => void` — row closes automatically | — |
| `id` | item id — **pass it in FlashList/FlatList** so a recycled cell never shows up open | — |
| `actionWidth` | `number` | `80` |
| `haptics` | light haptic when the row snaps open | `true` |
| `enabled` | `boolean` | `true` |

**`SwipeAction`**: `id`, `label`, `color`, `icon?` (any node, rendered above the label).

## Notes

- Give the row content an **opaque background**, otherwise actions show through while swiping.
- VoiceOver / TalkBack users get the same actions through the accessibility actions menu.
