import { StyleSheet, Text, View } from 'react-native';

import { AVATAR_COLORS } from '@/constants/theme';

type Props = { id: string; name: string; size?: number };

function initials(name: string) {
  const [first = '', second = ''] = name.trim().split(/\s+/);
  return (first[0] ?? '') + (second[0] ?? '');
}

function colorFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function Avatar({ id, name, size = 54 }: Props) {
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: colorFor(id) }]}>
      <Text style={[styles.label, { fontSize: size * 0.38 }]}>{initials(name).toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  label: { color: '#FFFFFF', fontWeight: '600' },
});
