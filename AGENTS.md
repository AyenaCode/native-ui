# aycode-ui

Expo SDK 57 · React Native 0.86 · React 19.2 · TypeScript · Expo Router (typed routes, React Compiler on). Package manager: **npm**.

## Rule #1
Expo changes every SDK. Before touching any Expo/RN/EAS API, read the docs: https://docs.expo.dev/versions/v57.0.0/ (index: https://docs.expo.dev/llms.txt). Never code from memory.

## Commands
```bash
npx expo install <pkg>   # only way to add deps (never npm install <pkg>)
npx expo start           # dev server
npx expo lint            # lint      ┐ both must pass
npx tsc --noEmit         # typecheck ┘ before "done"
npx expo-doctor          # diagnose deps/config
```

## Layout
This repo is a **UI library** + a showcase app.
- `src/ui/<component>/` = library, source of truth. Self-contained: relative imports only (never `@/`), assets inside the folder, `index.ts` barrel, `README.md` (Requirements · Install · Usage · API · Notes), `component.json` (name, description, dependencies to `expo install`, registryDependencies, minSdk).
- `src/app/` = showcase routes only. Showcase-only code in `src/components`, `src/hooks`, `src/constants`, `src/data`.
- `cli/` = npm package `@ay-code/native-ui` (zero-dep Node CLI). `prepack` snapshots `src/ui` → `cli/registry` (gitignored).
- New component = `src/ui/<name>/` + `component.json` + demo in showcase + row in root `README.md` and `cli/README.md`.
- Platform variants: `*.ios.tsx` / `*.android.tsx` / `*.web.tsx` (never inside `src/app/`).

## Library rules
- Native first: `expo-router` (NativeTabs, Stack.Toolbar), `@expo/ui`, platform components before custom JS UI.
- Motion on the UI thread only: Reanimated 4 (CSS transitions → layout animations → shared values + Gesture). Never `setState` per frame, never core `Animated`. Ship reduced motion.
- Lists: FlashList. Short fixed groups: `@expo/ui` `List`.
- React Compiler is on: no manual `useMemo` / `memo` / `useCallback`.

## Constraints
- `ios/` `android/` are generated (CNG, gitignored): never edit. Native config goes in `app.json` / config plugins.
- Prefer Expo modules over third-party libs.
