"use client";

import { IconX } from "@tabler/icons-react";
import { type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ animation: "fade-in 150ms ease-out" }}
    >
      {/* Clickable backdrop */}
      <button
        ref={overlayRef}
        type="button"
        aria-label="Close modal"
        onClick={handleOverlayClick}
        className="absolute inset-0 cursor-default bg-black/60"
      />

      {/* Modal content */}
      <div
        className="relative w-full max-w-md rounded-xl border border-border bg-surface-overlay p-6 shadow-2xl"
        style={{ animation: "scale-in 150ms ease-out" }}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-base text-text-primary">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-md p-1 text-text-muted transition-colors hover:bg-surface-raised hover:text-text-primary"
            >
              <IconX size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
