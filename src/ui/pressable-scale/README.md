# PressableScale

Drop-in `Pressable` that shrinks slightly on press-in — the "physical" feedback every button and card needs.
Reanimated CSS transition on `transform` (UI thread, 120 ms strong ease-out), 2 renders per press, 0 per frame. Optional haptic. Reduced motion → opacity dim instead of scale.

## Requirements

- `react-native-reanimated` 4 + `react-native-worklets`, `expo-haptics` — installed by the CLI

## Install

```bash
npx @ay-code/native-ui add pressable-scale
```

## Usage

```tsx
import { PressableScale } from '@/ui/pressable-scale';

<PressableScale onPress={save} style={styles.button}>
  <Text>Save</Text>
</PressableScale>

<PressableScale onPress={buy} haptic="light" scale={0.95} style={styles.cta}>
  <Text>Buy now</Text>
</PressableScale>
```

## API

All `Pressable` props (`onPress`, `onLongPress`, `disabled`, `accessibilityLabel`…) plus:

| Prop | Type | Default |
|---|---|---|
| `style` | `StyleProp<ViewStyle>` — style of the scaled surface | — |
| `scale` | `number` | `0.97` |
| `haptic` | `'selection' \| 'light' \| 'medium' \| false` — fired on press-in | `false` |
| `hitSlop` / `pressRetentionOffset` | touch comfort | `8` / `16` |

## Notes

- Keep `scale` between 0.95 and 0.98: it's touched dozens of times a day, it must stay near-imperceptible.
- Haptics are for commits (buy, send, confirm), not every button.
- Full-width list rows should highlight their background instead of scaling.
