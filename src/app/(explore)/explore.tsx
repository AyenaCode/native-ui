import { FlashList } from '@shopify/flash-list';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { ListRow } from '@/components/lists/list-row';
import { CATEGORY_LABELS, RESOURCES, type Category, type Resource } from '@/data/mock';
import { useColors } from '@/hooks/use-colors';
import { OverflowMenu, type MenuEntry } from '@/ui/overflow-menu';
import { SkeletonCircle, SkeletonText } from '@/ui/skeleton';

type Filter = Category | 'all';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];
const PLACEHOLDERS: null[] = Array(8).fill(null);
const FAKE_LATENCY = 1200;

function ResourceSkeleton() {
  return (
    <View style={styles.skeletonRow}>
      <SkeletonCircle size={40} />
      <View style={styles.skeletonText}>
        <SkeletonText lines={2} lineHeight={12} lastLineWidth="45%" />
      </View>
    </View>
  );
}

function openResource(resource: Resource) {
  Alert.alert(resource.title, `by ${resource.author}`);
}

// Demo: header search + filter submenu driving the list, skeletons while loading (first load + pull to refresh).
export default function ExploreScreen() {
  const c = useColors();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);

  // Simulated network latency — replace with your data fetching.
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), FAKE_LATENCY);
    return () => clearTimeout(timer);
  }, [loading]);

  const q = query.trim().toLowerCase();
  const resources = RESOURCES.filter(
    (r) => (filter === 'all' || r.category === filter) && (!q || r.title.toLowerCase().includes(q)),
  );

  const menu: MenuEntry<Filter>[] = [
    {
      title: 'Filter by category',
      inline: true,
      items: [
        { id: 'all', title: 'All', sf: 'square.grid.2x2', isOn: filter === 'all' },
        ...CATEGORIES.map((cat) => ({ id: cat, title: CATEGORY_LABELS[cat], isOn: filter === cat })),
      ],
    },
  ];

  return (
    <>
      <FlashList<Resource | null>
        data={loading ? PLACEHOLDERS : resources}
        keyExtractor={(r, i) => r?.id ?? `skeleton-${i}`}
        renderItem={({ item }) =>
          item ? (
            <ListRow
              title={item.title}
              subtitle={`${CATEGORY_LABELS[item.category]} · ${item.author}`}
              leading={<Avatar id={item.category} name={item.title} size={40} />}
              onPress={() => openResource(item)}
            />
          ) : (
            <ResourceSkeleton />
          )
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: c.muted }}>No results</Text>
          </View>
        }
        refreshing={false}
        onRefresh={() => setLoading(true)}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
      />
      <Stack.Title large>Explore</Stack.Title>
      <Stack.SearchBar placeholder="Search resources" onChangeText={(e) => setQuery(e.nativeEvent.text)} />
      <OverflowMenu items={menu} onAction={setFilter} />
    </>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', paddingVertical: 48 },
  skeletonRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16 },
  skeletonText: { flex: 1 },
});
