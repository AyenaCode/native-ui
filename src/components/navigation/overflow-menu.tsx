import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

export type MenuAction<Id extends string = string> = {
  id: Id;
  title: string;
  subtitle?: string;
  /** iOS only — Android menus only render image icons. */
  sf?: SFSymbol;
  destructive?: boolean;
  disabled?: boolean;
  /** Shows a checkmark (radio / toggle options). */
  isOn?: boolean;
};

export type MenuGroup<Id extends string = string> = {
  /** Submenu label, or section header when `inline`. */
  title?: string;
  sf?: SFSymbol;
  /** `true` = section separated by a divider; `false` = nested submenu. */
  inline?: boolean;
  items: readonly MenuEntry<Id>[];
};

export type MenuEntry<Id extends string = string> = MenuAction<Id> | MenuGroup<Id>;

type Props<Id extends string> = {
  items: readonly MenuEntry<Id>[];
  onAction: (id: Id) => void;
  accessibilityLabel?: string;
};

const IS_IOS = Platform.OS === 'ios';

// iOS: native "…" SF Symbol. Android: Material "⋮" vector drawable (SF Symbols are dropped there).
const TRIGGER_ICON = IS_IOS ? 'ellipsis' : require('@/assets/icons/more-vert.xml');

const isGroup = <Id extends string>(entry: MenuEntry<Id>): entry is MenuGroup<Id> => 'items' in entry;

// Plain function, not a component: Stack.Toolbar.Menu only accepts Stack.Toolbar.* elements as direct children.
function renderEntry<Id extends string>(entry: MenuEntry<Id>, onAction: (id: Id) => void, key: string) {
  if (isGroup(entry)) {
    return (
      <Stack.Toolbar.Menu key={key} title={entry.title} icon={IS_IOS ? entry.sf : undefined} inline={entry.inline}>
        {entry.items.map((child, i) => renderEntry(child, onAction, `${key}.${i}`))}
      </Stack.Toolbar.Menu>
    );
  }
  return (
    <Stack.Toolbar.MenuAction
      key={entry.id}
      icon={IS_IOS ? entry.sf : undefined}
      subtitle={entry.subtitle}
      destructive={entry.destructive}
      disabled={entry.disabled}
      isOn={entry.isOn}
      onPress={() => onAction(entry.id)}
    >
      {entry.title}
    </Stack.Toolbar.MenuAction>
  );
}

/**
 * Header "more" menu (⋮ / …), declared from a screen. Fully native — UIMenu on iOS,
 * Compose DropdownMenu on Android — so open/close animations cost zero JS.
 * Supports actions, checkmarks, sections (`inline` groups) and submenus. Renders nothing when `items` is empty.
 *
 * @example
 * <OverflowMenu
 *   items={[{ title: 'Sort by', inline: true, items: [{ id: 'name', title: 'Name', isOn: true }] }, { id: 'delete', title: 'Delete', destructive: true }]}
 *   onAction={(id) => …}
 * />
 */
export function OverflowMenu<Id extends string>({ items, onAction, accessibilityLabel = 'More options' }: Props<Id>) {
  if (items.length === 0) return null;

  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Menu icon={TRIGGER_ICON} accessibilityLabel={accessibilityLabel}>
        {items.map((entry, i) => renderEntry(entry, onAction, String(i)))}
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}
