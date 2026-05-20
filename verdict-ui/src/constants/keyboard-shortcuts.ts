export type ShortcutCategory = 'global' | 'investigation';

export type ShortcutDefinition = {
  id: string;
  keys: string;
  description: string;
  category: ShortcutCategory;
};

export const KEYBOARD_SHORTCUTS: ShortcutDefinition[] = [
  { id: 'palette', keys: 'Ctrl / Cmd + K', description: 'Open command palette', category: 'global' },
  { id: 'help', keys: 'Ctrl / Cmd + /', description: 'Open keyboard shortcuts help', category: 'global' },
  { id: 'go-dashboard', keys: 'G then D', description: 'Go to Dashboard', category: 'global' },
  { id: 'go-claims', keys: 'G then C', description: 'Go to Claims', category: 'global' },
  { id: 'go-investigations', keys: 'G then I', description: 'Go to Investigations', category: 'global' },
  { id: 'go-review', keys: 'G then A', description: 'Go to Audit / Review queue', category: 'global' },
  { id: 'escape', keys: 'Escape', description: 'Close palette, help, or overlays', category: 'global' },
  { id: 'evidence-focus', keys: 'E', description: 'Focus evidence panel', category: 'investigation' },
  { id: 'verdict-focus', keys: 'V', description: 'Focus verdict panel', category: 'investigation' },
  { id: 'timeline-focus', keys: 'T', description: 'Focus timeline panel', category: 'investigation' },
  { id: 'add-evidence', keys: 'A', description: 'Open add evidence (when available)', category: 'investigation' },
  { id: 'submit-form', keys: 'Ctrl / Cmd + Enter', description: 'Submit active form', category: 'investigation' }
];
