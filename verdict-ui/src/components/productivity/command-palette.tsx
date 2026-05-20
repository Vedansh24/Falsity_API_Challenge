'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCommandPaletteIndex, useDebouncedValue, type CommandPaletteResult } from '../../hooks/use-command-palette';
import { useUiStore } from '../../stores/ui.store';
import Input from '../ui/input';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CommandPalette({ open, onOpenChange }: Props) {
  const router = useRouter();
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const debounced = useDebouncedValue(query, 250);
  const { groups, isLoading } = useCommandPaletteIndex(open, debounced);
  const pushRecent = useUiStore((s) => s.pushRecentItem);

  const flatItems = groups.flatMap((g) => g.items);
  const total = flatItems.length;

  useEffect(() => {
    setActiveIndex(0);
  }, [debounced, open]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    lastFocusRef.current = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    panel.addEventListener('keydown', handler);
    return () => panel.removeEventListener('keydown', handler);
  }, [open]);

  const applySelection = useCallback(
    (item: CommandPaletteResult) => {
      if (item.kind === 'action') {
        item.onSelect?.();
      } else if (item.href) {
        pushRecent({
          id: item.id,
          label: item.label,
          href: item.href,
          type: item.kind === 'claim' ? 'claim' : item.kind === 'investigation' ? 'investigation' : 'route'
        });
        router.push(item.href);
      }
      onOpenChange(false);
      lastFocusRef.current?.focus?.();
    },
    [onOpenChange, pushRecent, router]
  );

  const flatRef = useRef(flatItems);
  flatRef.current = flatItems;
  const activeRef = useRef(activeIndex);
  activeRef.current = activeIndex;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
        lastFocusRef.current?.focus?.();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (total === 0 ? 0 : (i + 1) % total));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (total === 0 ? 0 : (i - 1 + total) % total));
      }
      if (e.key === 'Enter' && total > 0) {
        e.preventDefault();
        const item = flatRef.current[activeRef.current];
        if (item) applySelection(item);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [applySelection, onOpenChange, open, total]);

  if (!open) {
    return null;
  }

  let running = -1;

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-start justify-center bg-black/40 px-4 pt-[10vh]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={panelRef}
        className="w-full max-w-xl rounded-xl border border-neutral-200 bg-white shadow-lg outline-none"
      >
        <div className="border-b border-neutral-200 px-4 py-3">
          <p id={titleId} className="sr-only">
            Command palette
          </p>
          <Input
            ref={inputRef}
            data-command-palette-input
            aria-label="Command palette"
            aria-activedescendant={total > 0 ? `cmd-result-${activeIndex}` : undefined}
            placeholder="Search claims, investigations, or go somewhere…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isLoading && <p className="mt-2 text-xs text-neutral-500">Loading directory…</p>}
        </div>
        <div className="max-h-[50vh] overflow-y-auto py-2" role="listbox" aria-label="Command results">
          {total === 0 && !isLoading ? (
            <div className="px-4 py-6 text-sm text-neutral-600">No results. Try a different keyword.</div>
          ) : (
            groups.map((group) => (
              <div key={group.title} className="mb-4">
                <div className="px-4 pb-1 text-xs font-medium uppercase tracking-wide text-neutral-500">{group.title}</div>
                <ul className="space-y-0">
                  {group.items.map((item) => {
                    running += 1;
                    const idx = running;
                    const selected = idx === activeIndex;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          id={`cmd-result-${idx}`}
                          role="option"
                          aria-selected={selected}
                          className={`flex w-full flex-col items-start px-4 py-2 text-left text-sm ${
                            selected ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700 hover:bg-neutral-50'
                          }`}
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => applySelection(item)}
                        >
                          <span className="font-medium">{item.label}</span>
                          {'subtitle' in item && item.subtitle ? (
                            <span className="text-xs text-neutral-500">{item.subtitle}</span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
