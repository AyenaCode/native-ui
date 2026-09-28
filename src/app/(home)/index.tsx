import { FlashList } from '@shopify/flash-list';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { ProjectCard } from '@/components/lists/project-card';
import { PROJECTS, type Project } from '@/data/mock';
import { OverflowMenu, type MenuEntry } from '@/ui/overflow-menu';
import { toast } from '@/ui/toast';

type Layout = 'list' | 'grid';
type SortBy = 'recent' | 'name' | 'progress';
type HomeAction = `layout:${Layout}` | `sort:${SortBy}` | 'new';

const SORTERS: Record<SortBy, (a: Project, b: Project) => number> = {
  recent: (a, b) => a.updatedMinutesAgo - b.updatedMinutesAgo,
  name: (a, b) => a.name.localeCompare(b.name),
  progress: (a, b) => b.progress - a.progress,
};

function openProject(project: Project) {
  Alert.alert(project.name, project.description);
}

// Demo: menu drives screen state — radio sections (layout, sort) + a plain action.
export default function HomeScreen() {
  const [layout, setLayout] = useState<Layout>('list');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const projects = [...PROJECTS].sort(SORTERS[sortBy]);

  const menu: MenuEntry<HomeAction>[] = [
    {
      inline: true,
      items: [
        { id: 'layout:list', title: 'List', sf: 'list.bullet', isOn: layout === 'list' },
        { id: 'layout:grid', title: 'Grid', sf: 'square.grid.2x2', isOn: layout === 'grid' },
      ],
    },
    {
      title: 'Sort by',
      sf: 'arrow.up.arrow.down',
      items: [
        { id: 'sort:recent', title: 'Recently updated', isOn: sortBy === 'recent' },
        { id: 'sort:name', title: 'Name', isOn: sortBy === 'name' },
        { id: 'sort:progress', title: 'Progress', isOn: sortBy === 'progress' },
      ],
    },
    { id: 'new', title: 'New project', sf: 'plus' },
  ];

  const onAction = (id: HomeAction) => {
    const [kind, value] = id.split(':');
    if (kind === 'layout') setLayout(value as Layout);
    else if (kind === 'sort') setSortBy(value as SortBy);
    else toast('New project', { description: 'Coming soon' });
  };

  return (
    <>
      <FlashList
        key={layout}
        data={projects}
        numColumns={layout === 'grid' ? 2 : 1}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <ProjectCard project={item} compact={layout === 'grid'} onPress={openProject} />}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      />
      <Stack.Title large>Home</Stack.Title>
      <OverflowMenu items={menu} onAction={onAction} />
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 10 },
});
