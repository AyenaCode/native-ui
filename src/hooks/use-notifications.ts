import { useSyncExternalStore } from 'react';

import { NOTIFICATIONS, type Notification } from '@/data/mock';

// Tiny module store: shared by the Activity screen and the tab badge without a provider.
let items: Notification[] = NOTIFICATIONS;
const listeners = new Set<() => void>();

function set(next: Notification[]) {
  items = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => items;

export const notificationsActions = {
  markRead: (id: string) => set(items.map((n) => (n.id === id ? { ...n, read: true } : n))),
  markAllRead: () => set(items.map((n) => (n.read ? n : { ...n, read: true }))),
  remove: (id: string) => {
    const index = items.findIndex((n) => n.id === id);
    const removed = items[index];
    set(items.filter((n) => n.id !== id));
    return { removed, index };
  },
  restore: (item: Notification, index: number) => set([...items.slice(0, index), item, ...items.slice(index)]),
  clear: () => set([]),
  reset: () => set(NOTIFICATIONS),
};

export function useNotifications() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useUnreadCount() {
  return useSyncExternalStore(subscribe, () => items.filter((n) => !n.read).length);
}
