# aycode-ui

Personal UI library for Expo / React Native: native-first, optimized, animations on the UI thread.
Distributed shadcn-style — components are copied into your project, you own the code.

```bash
npx @ay-code/native-ui add overflow-menu
```

## Components

| Component | What |
|---|---|
| [`app-tabs`](src/ui/app-tabs/README.md) | Native tab bar from a config (Liquid Glass iOS 26+, Material 3 Android) + native stack per tab |
| [`overflow-menu`](src/ui/overflow-menu/README.md) | Native `…` / `⋮` header menu: actions, checkmarks, sections, submenus |

## Repo

| Path | |
|---|---|
| `src/ui/<component>/` | Components — source of truth (+ `component.json` manifest) |
| `src/app/` | Showcase app using every component |
| `cli/` | The `@ay-code/native-ui` npm package (CLI + registry snapshot of `src/ui`) |

```bash
npx expo start                                   # showcase
node cli/bin/cli.mjs add <c> --cwd <app>          # test the CLI locally
cd cli && npm publish                            # release (bump version first)
```
