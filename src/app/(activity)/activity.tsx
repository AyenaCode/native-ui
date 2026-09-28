import { FlashList } from '@shopify/flash-list';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { ListRow } from '@/components/lists/list-row';
import { OverflowMenu, type MenuEntry } from '@/components/navigation/overflow-menu';
import { useColors } from '@/hooks/use-colors';
import { notificationsActions, useNotifications } from '@/hooks/use-notifications';

type ActivityAction = 'unread-only' | 'mark-all-read' | 'reset' | 'clear';

// Demo: toggle option, disabled state, bulk action, destructive action with confirmation. Tab badge follows the store.
export default function ActivityScreen() {
  const c = useColors();
  const notifications = useNotifications();
  const [unreadOnly, setUnreadOnly] = useState(false);

  const visible = unreadOnly ? notifications.filter((n) => !n.read) : notifications;
  const hasUnread = notifications.some((n) => !n.read);

  const menu: MenuEntry<ActivityAction>[] = [
    { id: 'unread-only', title: 'Unread only', sf: 'line.3.horizontal.decrease', isOn: unreadOnly },
    { id: 'mark-all-read', title: 'Mark all as read', sf: 'checkmark.circle', disabled: !hasUnread },
    {
      inline: true,
      items: [
        { id: 'reset', title: 'Restore demo data', sf: 'arrow.counterclockwise' },
        { id: 'clear', title: 'Clear all', sf: 'trash', destructive: true, disabled: notifications.length === 0 },
      ],
    },
  ];

  const onAction = (id: ActivityAction) => {
    switch (id) {
      case 'unread-only':
        return setUnreadOnly((v) => !v);
      case 'mark-all-read':
        return notificationsActions.markAllRead();
      case 'reset':
        return notificationsActions.reset();
      case 'clear':
        return Alert.alert('Clear all notifications?', 'This cannot be undone.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear', style: 'destructive', onPress: notificationsActions.clear },
        ]);
    }
  };

  return (
    <>
      <FlashList
        data={visible}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <ListRow
            title={item.title}
            subtitle={item.body}
            highlighted={!item.read}
            leading={<View style={[styles.dot, { backgroundColor: item.read ? 'transparent' : c.accent }]} />}
            trailing={<Text style={{ color: c.muted }}>{item.time}</Text>}
            onPress={() => notificationsActions.markRead(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: c.muted }}>You&apos;re all caught up</Text>
          </View>
        }
        contentInsetAdjustmentBehavior="automatic"
      />
      <Stack.Title large>Activity</Stack.Title>
      <OverflowMenu items={menu} onAction={onAction} />
    </>
  );
}

const styles = StyleSheet.create({
  dot: { width: 10, height: 10, borderRadius: 5 },
  empty: { alignItems: 'center', paddingVertical: 48 },
});
