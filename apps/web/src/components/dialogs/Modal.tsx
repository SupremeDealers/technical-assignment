"use client";
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface CustomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  backdropClassName?: string;
}

const Modal: React.FC<CustomModalProps> = ({
  open,
  onOpenChange,
  children,
  header,
  footer,
  className = "",
  backdropClassName = "",
}) => {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (typeof window === "undefined") return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            className={`fixed inset-0 z-[10007] backdrop-blur-sm bg-black/40 transition-opacity px-8 flex justify-center items-center ${backdropClassName}`}
            onClick={() => onOpenChange(false)}
            aria-label="Close modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatePresence>
              {open && (
                <motion.div
                  key="modal-content"
                  className={`relative z-[10570]  w-full bg-white rounded-lg shadow p-0  max-h-[90vh] flex flex-col mt-8 ${className}`}
                  role="dialog"
                  aria-modal="true"
                  tabIndex={-1}
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, scale: 0.96, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 40 }}
                  transition={{ duration: 0.22, ease: "easeOut", delay: 0.18 }}
                  style={{ maxHeight: "90vh" }}
                >
                  {header && (
                    <div className="sticky top-0 z-10 flex-shrink-0 w-full px-4 py-3 pb-0 font-semibold text-white">
                      {header}
                    </div>
                  )}

                  <div
                    className="flex-1 w-full px-2 py-3 overflow-y-auto"
                    style={{ maxHeight: "70vh" }}
                  >
                    {children}
                  </div>
                  {footer && (
                    <div className="sticky bottom-0 z-10 flex-shrink-0 w-full px-2 py-3">
                      {footer}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default Modal;
