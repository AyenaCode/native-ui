# Toast

`toast('Saved')` from anywhere — no hook, no context. Stacked (max 3), swipe toward the edge to dismiss (a flick is enough), Undo-style action, success / error haptics, auto-dismiss paused while touched.
Enter + reflow are Reanimated layout animations; swipe and exit run on the UI thread with a single exit path (no flash).

## Requirements

- `react-native-gesture-handler`, `react-native-reanimated` 4 + `react-native-worklets`, `react-native-safe-area-context`, `expo-haptics` — installed by the CLI
- `GestureHandlerRootView` at the root (Expo Router already provides `SafeAreaProvider`)

## Install

```bash
npx @ay-code/native-ui add toast
```

## Usage

**1. Mount once**, last child of the root:

```tsx
// src/app/_layout.tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toaster } from '@/ui/toast';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack />
      <Toaster />
    </GestureHandlerRootView>
  );
}
```

**2. Call it anywhere** (components, stores, API callbacks):

```ts
import { toast } from '@/ui/toast';

toast('Link copied');
toast.success('Saved', { description: 'Your changes are live.' });
toast.error('Upload failed', { duration: Infinity });
toast('Message deleted', { action: { label: 'Undo', onPress: restore } });

const id = toast('Syncing…');
toast.dismiss(id); // or toast.dismiss() for all
```

## API

**`toast(title, options?)`**, `toast.success`, `toast.error` → returns the toast id.

| Option | Type | Default |
|---|---|---|
| `description` | `string` | — |
| `action` | `{ label, onPress }` — dismisses after press | — |
| `duration` | ms, `Infinity` = sticky | `4000` |
| `haptic` | success / error haptic | `true` |

**`<Toaster />`**

| Prop | Type | Default |
|---|---|---|
| `position` | `'top' \| 'bottom'` | `'top'` |
| `offset` | px from the safe area | `8` |
| `colors` | `{ background, text, description, action }` (partial) | light / dark palette |

## Notes

- Default is `top`: native tab bars can't be measured, so a `bottom` toast may sit under them — raise `offset` if you use `bottom` with tabs.
- Reduced motion → fade only, no slide.
