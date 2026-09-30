# @ay-code/native-ui

Native-first Expo / React Native components you **copy into your project** — like shadcn/ui, with zero config.
Built on platform UI (NativeTabs, native menus, `@expo/ui`), animations on the UI thread.

```bash
npx @ay-code/native-ui add toast swipeable-row
```

That's it: files land in `src/ui/<component>/`, missing deps are installed with `npx expo install` (versions matched to your SDK). No `init`, no config file. The code is yours — edit it or keep it as is.

## Commands

```bash
npx @ay-code/native-ui list                    # available components
npx @ay-code/native-ui add <component...>      # copy + install deps
npx @ay-code/native-ui diff <component...>     # your copy vs the latest version
```

| Option | |
|---|---|
| `-p, --path <dir>` | target folder (default `src/ui`, or `ui` without `src/`) |
| `-o, --overwrite` | take the latest version (adds / replaces files, never deletes) |
| `--no-install` | copy only, skip `expo install` |
| `--dry-run` | print the plan, change nothing |
| `--cwd <dir>` | project root |

## Components

| Name | What |
|---|---|
| `app-tabs` | Native tab bar from a config (Liquid Glass iOS 26+, Material 3 Android) + native stack per tab, UI-thread Material tab transitions (shared axis, fade-through) with proportional intensity presets, optional Compose bar with sliding indicator (Android) |
| `overflow-menu` | Native `…` / `⋮` header menu: actions, checkmarks, sections, submenus |
| `pressable-scale` | Press feedback: subtle scale on press-in (UI thread), optional haptic |
| `swipeable-row` | Swipe-to-reveal row actions, one open row at a time, a11y actions |
| `toast` | `toast()` from anywhere: stacked, swipe to dismiss, Undo action, haptics |
| `skeleton` | Loading placeholders (block, circle, text) with a UI-thread pulse |

Each component ships its own `README.md` (usage + API) next to the code.

## Requirements

Expo SDK 57+, Expo Router, Node 20.19+. Older SDKs get a warning (skipped if the `expo` version can't be parsed).

MIT
