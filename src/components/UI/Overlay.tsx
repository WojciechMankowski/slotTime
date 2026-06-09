import React, { useEffect, useRef } from "react";

interface OverlayProps {
  children: React.ReactNode;
  onClose: () => void;
  labelledBy?: string; // id nagłówka modala → aria-labelledby
  label?: string; // fallback aria-label, gdy nagłówek nie ma id
  initialFocusId?: string; // opcjonalny override pierwszego focusa
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Overlay({
  children,
  onClose,
  labelledBy,
  label,
  initialFocusId,
}: OverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Esc + focus-trap (Tab/Shift+Tab) — wzorzec Esc jak w DayDrawer.tsx
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) {
        e.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Scroll-lock tła + focus na otwarciu + powrót focusa po zamknięciu
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const trigger = document.activeElement as HTMLElement | null;
    const node = dialogRef.current;
    if (node) {
      const target =
        (initialFocusId &&
          node.querySelector<HTMLElement>(`#${CSS.escape(initialFocusId)}`)) ||
        node.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ||
        node;
      target.focus();
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      trigger?.focus();
    };
  }, [initialFocusId]);

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-(--z-modal) flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : label}
        tabIndex={-1}
        className="contents"
      >
        {children}
      </div>
    </div>
  );
}
