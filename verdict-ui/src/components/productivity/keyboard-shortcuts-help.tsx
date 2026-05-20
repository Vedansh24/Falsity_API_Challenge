'use client';

import { useEffect, useId, useRef } from 'react';
import { KEYBOARD_SHORTCUTS } from '../../constants/keyboard-shortcuts';
import Button from '../ui/button';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function KeyboardShortcutsHelp({ open, onOpenChange }: Props) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastRef.current = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => panelRef.current?.querySelector('button')?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
        lastRef.current?.focus?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  const global = KEYBOARD_SHORTCUTS.filter((s) => s.category === 'global');
  const investigation = KEYBOARD_SHORTCUTS.filter((s) => s.category === 'investigation');

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div ref={panelRef} className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border border-neutral-200 bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <h2 id={titleId} className="text-lg font-semibold text-neutral-900">
            Keyboard shortcuts
          </h2>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
        <p className="mt-2 text-sm text-neutral-600">Shortcuts are disabled while typing in form fields.</p>
        <div className="mt-6 space-y-6">
          <section>
            <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-500">Global</h3>
            <ul className="mt-2 divide-y divide-neutral-100">
              {global.map((s) => (
                <li key={s.id} className="flex justify-between gap-4 py-2 text-sm">
                  <span className="text-neutral-700">{s.description}</span>
                  <kbd className="shrink-0 rounded border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-xs text-neutral-800">
                    {s.keys}
                  </kbd>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-500">Investigation workspace</h3>
            <ul className="mt-2 divide-y divide-neutral-100">
              {investigation.map((s) => (
                <li key={s.id} className="flex justify-between gap-4 py-2 text-sm">
                  <span className="text-neutral-700">{s.description}</span>
                  <kbd className="shrink-0 rounded border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-xs text-neutral-800">
                    {s.keys}
                  </kbd>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
