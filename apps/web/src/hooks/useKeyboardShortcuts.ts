import { useEffect, useCallback } from "react";

interface KeyboardShortcutsOptions {
  onToggleAnalytics?: () => void;
  onToggleActivity?: () => void;
  onToggleMembers?: () => void;
  onToggleShortcuts?: () => void;
  onNewTask?: () => void;
  onSearch?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Only handle Escape in inputs
        if (event.key === "Escape" && options.onEscape) {
          options.onEscape();
        }
        return;
      }

      const isMac = navigator.platform.toLowerCase().includes("mac");
      const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      // ? or / for help/shortcuts
      if (event.key === "?" || (event.key === "/" && !cmdOrCtrl)) {
        event.preventDefault();
        options.onToggleShortcuts?.();
        return;
      }

      // Escape to close modals
      if (event.key === "Escape") {
        options.onEscape?.();
        return;
      }

      // Cmd/Ctrl + K for search
      if (cmdOrCtrl && event.key === "k") {
        event.preventDefault();
        options.onSearch?.();
        return;
      }

      // Single key shortcuts (without modifiers)
      if (!cmdOrCtrl && !event.altKey && !event.shiftKey) {
        switch (event.key.toLowerCase()) {
          case "a":
            event.preventDefault();
            options.onToggleAnalytics?.();
            break;
          case "h":
            event.preventDefault();
            options.onToggleActivity?.();
            break;
          case "m":
            event.preventDefault();
            options.onToggleMembers?.();
            break;
          case "n":
            event.preventDefault();
            options.onNewTask?.();
            break;
        }
      }
    },
    [options]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}
