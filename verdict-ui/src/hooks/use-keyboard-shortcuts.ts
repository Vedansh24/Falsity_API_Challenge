'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import type { Role } from '../config/roles';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    return true;
  }
  if (target.isContentEditable) {
    return true;
  }
  return Boolean(target.closest('[data-command-palette-input]'));
}

export type KeyboardShortcutsHandlers = {
  role: Role | null;
  onOpenCommandPalette: () => void;
  onOpenShortcutsHelp: () => void;
  onCloseOverlays: () => void;
  /** Investigation workspace panel focus ids */
  investigationPanelIds?: {
    evidence?: string;
    verdict?: string;
    timeline?: string;
    addEvidenceButton?: string;
  };
};

export function useKeyboardShortcuts({
  role,
  onOpenCommandPalette,
  onOpenShortcutsHelp,
  onCloseOverlays,
  investigationPanelIds
}: KeyboardShortcutsHandlers): void {
  const router = useRouter();
  const pathname = usePathname();
  const chordRef = useRef<'g' | null>(null);
  const chordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearChord = useCallback(() => {
    chordRef.current = null;
    if (chordTimerRef.current) {
      clearTimeout(chordTimerRef.current);
      chordTimerRef.current = null;
    }
  }, []);

  const focusById = useCallback((id: string | undefined) => {
    if (!id || typeof document === 'undefined') {
      return;
    }
    const el = document.getElementById(id);
    if (el && 'focus' in el) {
      (el as HTMLElement).focus();
    }
  }, []);

  useEffect(() => {
    const isInvestigationDetail = Boolean(pathname?.match(/^\/dashboard\/investigations\/[^/]+$/));

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      if (event.key === 'Escape') {
        onCloseOverlays();
        clearChord();
        return;
      }

      const metaOrCtrl = event.metaKey || event.ctrlKey;

      if (metaOrCtrl && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenCommandPalette();
        clearChord();
        return;
      }

      if (metaOrCtrl && event.key === '/') {
        event.preventDefault();
        onOpenShortcutsHelp();
        clearChord();
        return;
      }

      if (isEditableTarget(event.target)) {
        if (metaOrCtrl && event.key === 'Enter') {
          const form = (event.target as HTMLElement).closest('form');
          if (form && isInvestigationDetail) {
            event.preventDefault();
            if (typeof form.requestSubmit === 'function') {
              form.requestSubmit();
            }
          }
        }
        return;
      }

      if (metaOrCtrl && event.key === 'Enter' && isInvestigationDetail) {
        const form = document.activeElement?.closest?.('form');
        if (form instanceof HTMLFormElement) {
          event.preventDefault();
          form.requestSubmit();
        }
        return;
      }

      const key = event.key.toLowerCase();

      if (key === 'g' && !metaOrCtrl) {
        chordRef.current = 'g';
        if (chordTimerRef.current) clearTimeout(chordTimerRef.current);
        chordTimerRef.current = setTimeout(() => clearChord(), 1000);
        return;
      }

      if (chordRef.current === 'g' && !metaOrCtrl) {
        if (key === 'd') {
          event.preventDefault();
          router.push('/dashboard');
        } else if (key === 'c') {
          event.preventDefault();
          router.push('/dashboard/claims');
        } else if (key === 'i') {
          event.preventDefault();
          router.push('/dashboard/investigations');
        } else if (key === 'a') {
          event.preventDefault();
          if (role === 'REVIEWER' || role === 'ADMIN') {
            router.push('/dashboard/review');
          } else {
            router.push('/dashboard/claims');
          }
        }
        clearChord();
        return;
      }

      if (!isInvestigationDetail || !investigationPanelIds) {
        return;
      }

      if (key === 'e') {
        event.preventDefault();
        focusById(investigationPanelIds.evidence);
      } else if (key === 'v') {
        event.preventDefault();
        focusById(investigationPanelIds.verdict);
      } else if (key === 't') {
        event.preventDefault();
        focusById(investigationPanelIds.timeline);
      } else if (key === 'a' && chordRef.current !== 'g') {
        event.preventDefault();
        focusById(investigationPanelIds.addEvidenceButton);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (chordTimerRef.current) clearTimeout(chordTimerRef.current);
    };
  }, [
    pathname,
    role,
    router,
    onOpenCommandPalette,
    onOpenShortcutsHelp,
    onCloseOverlays,
    investigationPanelIds,
    focusById,
    clearChord
  ]);
}
