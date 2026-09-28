import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';

type Props = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** Emphasize the title (e.g. unread item). */
  highlighted?: boolean;
  onPress?: () => void;
};

/** Generic tappable row for virtualized lists (FlashList). Native ripple on Android, highlight on iOS. */
export function ListRow({ title, subtitle, leading, trailing, highlighted, onPress }: Props) {
  const c = useColors();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      android_ripple={{ color: c.separator }}
      style={({ pressed }) => [styles.row, process.env.EXPO_OS === 'ios' && pressed && { backgroundColor: c.surface }]}
    >
      {leading}
      <View style={[styles.body, { borderBottomColor: c.separator }]}>
        <View style={styles.texts}>
          <Text style={[styles.title, { color: c.text }, highlighted && styles.bold]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: c.muted }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {trailing}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 64, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, gap: 14 },
  body: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  texts: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '500' },
  bold: { fontWeight: '700' },
  subtitle: { fontSize: 14 },
});
