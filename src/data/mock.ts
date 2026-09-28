// Placeholder data until a real API is wired. Swap these for your own models.

export type Project = {
  id: string;
  name: string;
  description: string;
  /** Minutes since last update, used for sorting. */
  updatedMinutesAgo: number;
  progress: number;
};

export type Category = 'design' | 'development' | 'marketing';

export type Resource = {
  id: string;
  title: string;
  author: string;
  category: Category;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

export type User = { name: string; email: string; role: string; team: string };

export const ME: User = {
  name: 'Moses Moon',
  email: 'moses@example.com',
  role: 'Mobile Developer',
  team: 'aycode',
};

export const PROJECTS: Project[] = [
  { id: 'p1', name: 'Mobile App', description: 'Expo SDK 57 client', updatedMinutesAgo: 12, progress: 0.72 },
  { id: 'p2', name: 'Design System', description: 'Tokens, components, docs', updatedMinutesAgo: 240, progress: 0.45 },
  { id: 'p3', name: 'Landing Page', description: 'Marketing website', updatedMinutesAgo: 2880, progress: 0.9 },
  { id: 'p4', name: 'API Gateway', description: 'Auth and rate limiting', updatedMinutesAgo: 60, progress: 0.3 },
  { id: 'p5', name: 'Analytics', description: 'Events and dashboards', updatedMinutesAgo: 10080, progress: 0.15 },
  { id: 'p6', name: 'Onboarding', description: 'First-run experience', updatedMinutesAgo: 5, progress: 0.6 },
];

export const CATEGORY_LABELS: Record<Category, string> = {
  design: 'Design',
  development: 'Development',
  marketing: 'Marketing',
};

export const RESOURCES: Resource[] = [
  { id: 'r1', title: 'Color Tokens Guide', author: 'Aya K.', category: 'design' },
  { id: 'r2', title: 'Native Tabs in Expo Router', author: 'Bamba I.', category: 'development' },
  { id: 'r3', title: 'Launch Checklist', author: 'Gracia M.', category: 'marketing' },
  { id: 'r4', title: 'Motion Principles', author: 'Aya K.', category: 'design' },
  { id: 'r5', title: 'FlashList Performance', author: 'Yao S.', category: 'development' },
  { id: 'r6', title: 'App Store Screenshots', author: 'Gracia M.', category: 'marketing' },
  { id: 'r7', title: 'Typography Scale', author: 'Kadjo K.', category: 'design' },
  { id: 'r8', title: 'EAS Update Strategy', author: 'Yao S.', category: 'development' },
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'New comment', body: 'Aya commented on "Design System"', time: '2m', read: false },
  { id: 'n2', title: 'Build succeeded', body: 'Mobile App · Android release', time: '1h', read: false },
  { id: 'n3', title: 'Invitation', body: 'Bamba invited you to "API Gateway"', time: '3h', read: false },
  { id: 'n4', title: 'Task completed', body: 'Landing Page reached 90%', time: '1d', read: true },
  { id: 'n5', title: 'Weekly report', body: 'Your activity summary is ready', time: '3d', read: true },
];
