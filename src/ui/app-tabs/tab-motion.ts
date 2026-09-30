import { createContext } from 'react';
import { Easing } from 'react-native-reanimated';

import type { TabTransition } from './use-tab-transition';

export type TabMotion = {
  /** Route names in tab bar order: the side a tab slides from follows this, not the navigator's route order. */
  order: readonly string[];
  /** Transition set on `AppTabs`: default for every `TabStack`, and the timing of the sliding indicator. */
  transition?: TabTransition;
  /** Sliding indicator on: screens default to the indicator's curve so both move as one. */
  sliding: boolean;
};

/**
 * Compose's `LinearOutSlowInEasing` (0, 0, 0.2, 1), the curve of the sliding indicator.
 * Compose tweens only take named curves, so the screen uses this one to stay in sync.
 */
export const SYNC_EASING = Easing.bezier(0, 0, 0.2, 1);

export const TabMotionContext = createContext<TabMotion>({ order: [], sliding: false });
