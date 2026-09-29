import { TAB_TRANSITION } from '@/constants/tabs';
import { TabStack } from '@/ui/app-tabs';

/** Layout shared by every showcase tab: `TabStack` with the showcase transition. */
export function TabLayout() {
  return <TabStack transition={TAB_TRANSITION} />;
}
