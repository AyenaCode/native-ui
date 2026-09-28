import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Project } from '@/data/mock';
import { useColors } from '@/hooks/use-colors';

type Props = { project: Project; compact?: boolean; onPress: (project: Project) => void };

function formatAgo(minutes: number) {
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} h ago`;
  return `${Math.round(minutes / 1440)} d ago`;
}

/** Project tile, used in both list (full width) and grid (`compact`) layouts. */
export function ProjectCard({ project, compact, onPress }: Props) {
  const c = useColors();

  return (
    <Pressable
      onPress={() => onPress(project)}
      android_ripple={{ color: c.separator, foreground: true }}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: c.surface },
        compact && styles.compact,
        process.env.EXPO_OS === 'ios' && pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
        {project.name}
      </Text>
      <Text style={[styles.meta, { color: c.muted }]} numberOfLines={compact ? 2 : 1}>
        {project.description}
      </Text>
      <View style={[styles.track, { backgroundColor: c.separator }]}>
        <View style={[styles.fill, { width: `${project.progress * 100}%`, backgroundColor: c.accent }]} />
      </View>
      <Text style={[styles.meta, { color: c.muted }]}>
        {Math.round(project.progress * 100)}% · {formatAgo(project.updatedMinutesAgo)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { margin: 6, padding: 16, gap: 8, borderRadius: 16, borderCurve: 'continuous', overflow: 'hidden' },
  compact: { minHeight: 150 },
  pressed: { opacity: 0.7 },
  name: { fontSize: 17, fontWeight: '600' },
  meta: { fontSize: 13 },
  track: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 'auto' },
  fill: { height: 4 },
});
