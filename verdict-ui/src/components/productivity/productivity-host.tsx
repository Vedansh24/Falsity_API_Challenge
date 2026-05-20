'use client';

import { useCallback, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import CommandPalette from './command-palette';
import KeyboardShortcutsHelp from './keyboard-shortcuts-help';
import { useKeyboardShortcuts } from '../../hooks/use-keyboard-shortcuts';
import { useRole } from '../../hooks/use-role';

export default function ProductivityHost() {
  const pathname = usePathname();
  const role = useRole();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const onCloseOverlays = useCallback(() => {
    setPaletteOpen(false);
    setHelpOpen(false);
  }, []);

  const investigationPanelIds = useMemo(() => {
    if (!pathname?.match(/^\/dashboard\/investigations\/[^/]+$/)) {
      return undefined;
    }
    return {
      evidence: 'investigation-panel-evidence',
      verdict: 'investigation-panel-verdict',
      timeline: 'investigation-panel-timeline',
      addEvidenceButton: 'investigation-add-evidence'
    };
  }, [pathname]);

  useKeyboardShortcuts({
    role,
    onOpenCommandPalette: () => {
      setHelpOpen(false);
      setPaletteOpen(true);
    },
    onOpenShortcutsHelp: () => {
      setPaletteOpen(false);
      setHelpOpen(true);
    },
    onCloseOverlays,
    investigationPanelIds
  });

  return (
    <>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <KeyboardShortcutsHelp open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}
