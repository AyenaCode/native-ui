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
- `src/app/` = routes only (`_layout.tsx` = navigator). Everything else in `src/components`, `src/hooks`, `src/constants`.
- Navigation: `Link`, `router`, `useLocalSearchParams` from `expo-router`.
- Platform variants: `*.web.tsx` / `*.web.ts`.

## Constraints
- `ios/` `android/` are generated (CNG, gitignored): never edit. Native config goes in `app.json` / config plugins.
- Prefer Expo modules over third-party libs.
