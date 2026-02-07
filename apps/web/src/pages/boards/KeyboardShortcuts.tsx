import { useEffect } from "react";
import { Modal } from "../../components/Modal";
import { FiCommand } from "react-icons/fi";
import "./KeyboardShortcuts.css";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={<><FiCommand /> Keyboard Shortcuts</>}>
      <div className="shortcuts-content">
        <div className="shortcuts-section">
          <h4>Navigation</h4>
          <div className="shortcut-item">
            <span className="shortcut-keys"><kbd>?</kbd></span>
            <span className="shortcut-desc">Show keyboard shortcuts</span>
          </div>
          <div className="shortcut-item">
            <span className="shortcut-keys"><kbd>⌘</kbd> + <kbd>K</kbd></span>
            <span className="shortcut-desc">Quick search</span>
          </div>
          <div className="shortcut-item">
            <span className="shortcut-keys"><kbd>Esc</kbd></span>
            <span className="shortcut-desc">Close modal / panel</span>
          </div>
        </div>

        <div className="shortcuts-section">
          <h4>Board Actions</h4>
          <div className="shortcut-item">
            <span className="shortcut-keys"><kbd>N</kbd></span>
            <span className="shortcut-desc">New task (in first column)</span>
          </div>
          <div className="shortcut-item">
            <span className="shortcut-keys"><kbd>A</kbd></span>
            <span className="shortcut-desc">Toggle analytics panel</span>
          </div>
          <div className="shortcut-item">
            <span className="shortcut-keys"><kbd>H</kbd></span>
            <span className="shortcut-desc">Toggle activity history</span>
          </div>
          <div className="shortcut-item">
            <span className="shortcut-keys"><kbd>M</kbd></span>
            <span className="shortcut-desc">Manage board members</span>
          </div>
        </div>

        <div className="shortcuts-section">
          <h4>Task Actions (when modal open)</h4>
          <div className="shortcut-item">
            <span className="shortcut-keys"><kbd>E</kbd></span>
            <span className="shortcut-desc">Edit task</span>
          </div>
          <div className="shortcut-item">
            <span className="shortcut-keys"><kbd>C</kbd></span>
            <span className="shortcut-desc">Focus comment input</span>
          </div>
          <div className="shortcut-item">
            <span className="shortcut-keys"><kbd>Delete</kbd></span>
            <span className="shortcut-desc">Delete task</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Hook for handling keyboard shortcuts
export function useKeyboardShortcuts({
  onNewTask,
  onToggleAnalytics,
  onToggleActivity,
  onToggleMembers,
  onToggleShortcuts,
}: {
  onNewTask?: () => void;
  onToggleAnalytics?: () => void;
  onToggleActivity?: () => void;
  onToggleMembers?: () => void;
  onToggleShortcuts?: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Ignore if modifier key is pressed (except for cmd+k)
      if (e.altKey) return;

      switch (e.key.toLowerCase()) {
        case "?":
          e.preventDefault();
          onToggleShortcuts?.();
          break;
        case "n":
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            onNewTask?.();
          }
          break;
        case "a":
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            onToggleAnalytics?.();
          }
          break;
        case "h":
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            onToggleActivity?.();
          }
          break;
        case "m":
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            onToggleMembers?.();
          }
          break;
        case "k":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            // Focus search input
            const searchInput = document.querySelector('.search-box input') as HTMLInputElement;
            searchInput?.focus();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNewTask, onToggleAnalytics, onToggleActivity, onToggleMembers, onToggleShortcuts]);
}
