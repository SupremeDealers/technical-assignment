"use client";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-1000"
      onClick={onCancel}
    >
      <div
        className="bg-bg-secondary rounded-lg shadow-xl border border-border p-lg max-w-1/3 w-[90%] animate-slideInUp"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-md text-text-primary font-semibold">
          {title}
        </h2>
        <p className="mb-lg text-text-secondary">
          {message}
        </p>

        <div className="flex gap-md justify-end">
          <button
            onClick={onCancel}
            className="px-md py-sm bg-bg-tertiary text-text-primary border border-border rounded-md font-medium text-sm transition-all hover:bg-bg-tertiary hover:border-primary"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-md py-sm rounded-md font-medium text-sm text-white border-none transition-opacity hover:opacity-90 ${
              isDangerous
                ? "bg-danger"
                : "bg-primary"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
