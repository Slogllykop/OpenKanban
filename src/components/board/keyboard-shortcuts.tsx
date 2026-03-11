"use client";

import { IconKeyboard, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { SHORTCUTS } from "@/lib/constants";

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasSeen = localStorage.getItem("okb_has_seen_shortcuts");
    if (!hasSeen) {
      const timer = setTimeout(() => setShowHint(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    localStorage.setItem("okb_has_seen_shortcuts", "true");
  };

  const toggleOpen = () => {
    if (showHint) dismissHint();
    setIsOpen(!isOpen);
  };

  // Close on outside click
  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  return (
    <div
      ref={containerRef}
      className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-72 overflow-hidden rounded-2xl border border-border bg-surface-raised/90 p-5 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-text-primary tracking-wide">
                Keyboard Shortcuts
              </h3>
            </div>
            <ul className="flex flex-col gap-3">
              {SHORTCUTS.map((shortcut) => (
                <li
                  key={shortcut.action}
                  className="flex items-center justify-between"
                >
                  <span className="text-text-secondary text-xs">
                    {shortcut.action}
                  </span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key) => (
                      <kbd
                        key={key}
                        className="flex h-6 min-w-6 items-center justify-center rounded-md border border-border bg-surface-overlay px-1.5 font-medium text-[10px] text-text-primary shadow-sm"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative">
        <AnimatePresence>
          {showHint && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="absolute right-2 bottom-full mb-5 flex flex-col items-end whitespace-nowrap"
            >
              <div className="relative flex items-center gap-2 rounded-xl border border-border bg-surface-raised p-2.5 px-3 pr-2 shadow-xl">
                <span className="font-medium text-text-primary text-xs">
                  Keyboard shortcuts
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissHint();
                  }}
                  className="ml-1 rounded-sm text-text-muted hover:text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                  aria-label="Dismiss hint"
                >
                  <IconX size={14} stroke={2} />
                </button>
                <svg
                  width="30"
                  height="40"
                  viewBox="0 0 30 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="-bottom-9 absolute right-4 text-accent opacity-80"
                >
                  <title>Animated arrow pointing to keyboard shortcuts</title>
                  <motion.path
                    d="M 5 0 C 5 20, 15 30, 25 35"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="4 4"
                    fill="transparent"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  />
                  <motion.path
                    d="M 18 32 L 25 35 L 22 28"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 1 }}
                  />
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleOpen}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-accent bg-surface-raised/90 text-text-secondary shadow-lg backdrop-blur-xl transition-colors hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Toggle keyboard shortcuts"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <IconX size={20} stroke={2} />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <IconKeyboard size={20} stroke={2} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
