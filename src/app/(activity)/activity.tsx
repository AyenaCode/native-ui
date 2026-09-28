import { FlashList } from '@shopify/flash-list';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { ListRow } from '@/components/lists/list-row';
import { useColors } from '@/hooks/use-colors';
import { notificationsActions, useNotifications } from '@/hooks/use-notifications';
import { OverflowMenu, type MenuEntry } from '@/ui/overflow-menu';
import { SwipeableRow, type SwipeAction } from '@/ui/swipeable-row';
import { toast } from '@/ui/toast';

type ActivityAction = 'unread-only' | 'mark-all-read' | 'reset' | 'clear';
type RowAction = 'read' | 'delete';

const READ_ACTION: SwipeAction<RowAction>[] = [{ id: 'read', label: 'Read', color: '#3390EC' }];
const DELETE_ACTION: SwipeAction<RowAction>[] = [{ id: 'delete', label: 'Delete', color: '#FF3B30' }];

function deleteWithUndo(id: string) {
  const { removed, index } = notificationsActions.remove(id);
  if (!removed) return;
  toast('Notification deleted', { action: { label: 'Undo', onPress: () => notificationsActions.restore(removed, index) } });
}

// Demo: overflow menu (toggle, disabled, destructive), swipeable rows (read / delete + Undo toast). Tab badge follows the store.
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
        notificationsActions.markAllRead();
        return toast.success('All caught up', { description: 'Every notification is marked as read.' });
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
          <SwipeableRow
            id={item.id}
            leftActions={item.read ? [] : READ_ACTION}
            rightActions={DELETE_ACTION}
            onAction={(action) => (action === 'read' ? notificationsActions.markRead(item.id) : deleteWithUndo(item.id))}
          >
            <View style={{ backgroundColor: c.background }}>
              <ListRow
                title={item.title}
                subtitle={item.body}
                highlighted={!item.read}
                leading={<View style={[styles.dot, { backgroundColor: item.read ? 'transparent' : c.accent }]} />}
                trailing={<Text style={{ color: c.muted }}>{item.time}</Text>}
                onPress={() => notificationsActions.markRead(item.id)}
              />
            </View>
          </SwipeableRow>
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
