import { FlashList } from '@shopify/flash-list';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { ListRow } from '@/components/lists/list-row';
import { CATEGORY_LABELS, RESOURCES, type Category, type Resource } from '@/data/mock';
import { useColors } from '@/hooks/use-colors';
import { OverflowMenu, type MenuEntry } from '@/ui/overflow-menu';

type Filter = Category | 'all';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];

function openResource(resource: Resource) {
  Alert.alert(resource.title, `by ${resource.author}`);
}

// Demo: native header search + a filter submenu, both driving the same list.
export default function ExploreScreen() {
  const c = useColors();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

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
      <FlashList
        data={resources}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <ListRow
            title={item.title}
            subtitle={`${CATEGORY_LABELS[item.category]} · ${item.author}`}
            leading={<Avatar id={item.category} name={item.title} size={40} />}
            onPress={() => openResource(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: c.muted }}>No results</Text>
          </View>
        }
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
});
