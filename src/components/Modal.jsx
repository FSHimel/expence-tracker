"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog shell: focus moves inside on open, Tab is trapped,
 * Escape closes, focus returns to the trigger on close and the page behind
 * cannot scroll while the dialog is open.
 */
export default function Modal({ open, onClose, labelledBy, describedBy, children, maxWidth = "27rem" }) {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const panel = panelRef.current;
    const first = panel?.querySelector(FOCUSABLE);
    (first || panel)?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = panel?.querySelectorAll(FOCUSABLE);
      if (!items || items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="anim-backdrop fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-[rgba(52,48,40,0.34)] p-4 backdrop-blur-[2px] sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeRef.current();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className="anim-modal neu my-auto w-full p-6 outline-none sm:p-7"
        style={{ maxWidth }}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ title, id, onClose }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <h2 id={id} className="font-display text-2xl font-semibold leading-tight">
        {title}
      </h2>
      <button
        type="button"
        onClick={onClose}
        className="key h-9 w-9 shrink-0"
        aria-label="Close dialog"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export function ModalActions({ children }) {
  return <div className="mt-7 flex flex-wrap justify-end gap-3">{children}</div>;
}

export function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-2 text-sm font-medium text-danger">
      {children}
    </p>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className="mt-5 rounded-xl bg-[rgba(180,83,75,0.1)] px-4 py-3 text-sm font-medium text-danger"
    >
      {children}
    </div>
  );
}
