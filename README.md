# native-ui

UI library for Expo / React Native: native-first, optimized, animations on the UI thread.
Distributed shadcn-style — components are copied into your project, you own the code.

```bash
npx @ay-code/native-ui add overflow-menu
```

## Components

| Component | What |
|---|---|
| [`app-tabs`](src/ui/app-tabs/README.md) | Native tab bar from a config (Liquid Glass iOS 26+, Material 3 Android) + native stack per tab, UI-thread Material tab transitions (shared axis, fade-through) with proportional intensity presets, optional Compose bar with sliding indicator (Android) |
| [`overflow-menu`](src/ui/overflow-menu/README.md) | Native `…` / `⋮` header menu: actions, checkmarks, sections, submenus |
| [`pressable-scale`](src/ui/pressable-scale/README.md) | Press feedback: subtle scale on press-in (UI thread), optional haptic |
| [`swipeable-row`](src/ui/swipeable-row/README.md) | Swipe-to-reveal row actions, one open row at a time, a11y actions |
| [`toast`](src/ui/toast/README.md) | `toast()` from anywhere: stacked, swipe to dismiss, Undo action, haptics |
| [`skeleton`](src/ui/skeleton/README.md) | Loading placeholders (block, circle, text) with a UI-thread pulse |

## Repo

| Path | |
|---|---|
| `src/ui/<component>/` | Components — source of truth (+ `component.json` manifest) |
| `src/app/` | Showcase app using every component |
| `cli/` | The `@ay-code/native-ui` npm package (CLI + registry snapshot of `src/ui`) |

```bash
npx expo start                                    # showcase
node cli/bin/cli.mjs add <c> --cwd <app>          # test the CLI locally
cd cli && npm version patch --no-git-tag-version  # release: bump, commit, push to main
```

CI (`.github/workflows/release.yml`): on push to `main` → lint + typecheck → `npm stage publish` if the version is new → tag `v<version>`. Then approve it on npmjs.com → **Staged Packages** (2FA).
