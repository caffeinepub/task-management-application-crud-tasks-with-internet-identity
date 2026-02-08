import { useEffect } from 'react';

interface KeyboardShortcutsOptions {
  onNewTask: () => void;
  onSearch: () => void;
  onCommandPalette: () => void;
}

export default function useKeyboardShortcuts({
  onNewTask,
  onSearch,
  onCommandPalette,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input/textarea/contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // N - New task
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        onNewTask();
      }

      // F - Focus search
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        onSearch();
      }

      // K - Command palette (Cmd/Ctrl + K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNewTask, onSearch, onCommandPalette]);
}
