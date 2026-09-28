# Skeleton

Loading placeholders that match your layout's shape: `Skeleton` (block), `SkeletonCircle`, `SkeletonText`.
Opacity-only pulse as a Reanimated CSS animation — runs on the UI thread, zero React renders, no layout pass. Static when reduced motion is on. Hidden from screen readers.

## Requirements

- `react-native-reanimated` 4 + `react-native-worklets` — installed by the CLI

## Install

```bash
npx @ay-code/native-ui add skeleton
```

## Usage

Build a skeleton that mirrors the real row, and swap on `loading`:

```tsx
import { Skeleton, SkeletonCircle, SkeletonText } from '@/ui/skeleton';

function RowSkeleton() {
  return (
    <View style={{ flexDirection: 'row', gap: 12, padding: 16 }}>
      <SkeletonCircle size={40} />
      <View style={{ flex: 1 }}>
        <SkeletonText lines={2} lineHeight={12} lastLineWidth="45%" />
      </View>
    </View>
  );
}

// In a FlashList: placeholders as data, same list, no layout jump
<FlashList
  data={loading ? Array(8).fill(null) : items}
  renderItem={({ item }) => (item ? <Row item={item} /> : <RowSkeleton />)}
/>

<Skeleton width={180} height={24} radius={6} />   // title
<Skeleton height={160} radius={16} />             // image / card
```

## API

| Component | Props |
|---|---|
| `Skeleton` | `width` (`'100%'`), `height` (`16`), `radius` (`8`), `color`, `style` |
| `SkeletonCircle` | `size` (`40`), `color`, `style` |
| `SkeletonText` | `lines` (`3`), `lineHeight` (`14`), `lastLineWidth` (`'60%'`), `gap` (`8`), `radius`, `color` |

Default color: `#E4E4E7` light / `#2C2F34` dark — pass `color` to match your theme.

## Notes

- Mirror the real layout (same heights, same avatar size): shape beats shimmer, and nothing jumps when data arrives.
- Skeletons mounted together pulse together.
