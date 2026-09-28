import * as Haptics from 'expo-haptics';

export type ToastType = 'default' | 'success' | 'error';

export type ToastOptions = {
  description?: string;
  /** Inline action button, e.g. Undo. Dismisses the toast when pressed. */
  action?: { label: string; onPress: () => void };
  /** Auto-dismiss delay in ms. `Infinity` keeps it until dismissed. */
  duration?: number;
  /** Success / error haptic. */
  haptic?: boolean;
};

export type ToastItem = ToastOptions & {
  id: number;
  type: ToastType;
  title: string;
  /** Set when the exit animation should play; the view removes the item when it's done. */
  dismissing: boolean;
};

const DEFAULT_DURATION = 4000;
export const MAX_VISIBLE = 3;

let items: ToastItem[] = [];
let seq = 0;
const listeners = new Set<() => void>();
const timers = new Map<number, ReturnType<typeof setTimeout>>();

function set(next: ToastItem[]) {
  items = next;
  listeners.forEach((l) => l());
}

function clearTimer(id: number) {
  clearTimeout(timers.get(id));
  timers.delete(id);
}

function startTimer(item: ToastItem) {
  clearTimer(item.id);
  const duration = item.duration ?? DEFAULT_DURATION;
  if (Number.isFinite(duration)) timers.set(item.id, setTimeout(() => dismiss(item.id), duration));
}

function add(type: ToastType, title: string, options: ToastOptions = {}) {
  const item: ToastItem = { ...options, id: ++seq, type, title, dismissing: false };
  set([...items, item]);
  startTimer(item);

  const active = items.filter((t) => !t.dismissing);
  if (active.length > MAX_VISIBLE) dismiss(active[0].id);

  if (options.haptic !== false && type !== 'default') {
    Haptics.notificationAsync(
      type === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
    );
  }
  return item.id;
}

/** Play the exit animation of one toast, or of all toasts. */
export function dismiss(id?: number) {
  const hit = (t: ToastItem) => id === undefined || t.id === id;
  items.filter(hit).forEach((t) => clearTimer(t.id));
  set(items.map((t) => (hit(t) && !t.dismissing ? { ...t, dismissing: true } : t)));
}

// Internal — used by the view.
export const internal = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => items,
  remove(id: number) {
    clearTimer(id);
    set(items.filter((t) => t.id !== id));
  },
  pause: clearTimer,
  resume(id: number) {
    const item = items.find((t) => t.id === id);
    if (item && !item.dismissing) startTimer(item);
  },
};

/** Show a toast. Returns its id. Needs `<Toaster />` mounted once at the root. */
export const toast = Object.assign((title: string, options?: ToastOptions) => add('default', title, options), {
  success: (title: string, options?: ToastOptions) => add('success', title, options),
  error: (title: string, options?: ToastOptions) => add('error', title, options),
  dismiss,
});
