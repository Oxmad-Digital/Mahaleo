"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { useRouter } from "next/navigation";

export function Modal({ title, children }: { title?: string; children: React.ReactNode }) {
  const router = useRouter();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [close]);

  return (
    <div
      className="retro-admin-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,15,15,0.45)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        overflowY: "auto",
        padding: "40px 16px",
        zIndex: 1000,
      }}
    >
      <div
        ref={dialogRef}
        className="retro-admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        style={{
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
          width: "100%",
          maxWidth: 680,
        }}
      >
        {title && (
          <div className="retro-admin-modal-header">
            <div className="retro-admin-modal-folio" aria-hidden="true">
              <span>Catalogue</span>
              <strong>01</strong>
            </div>
            <div className="retro-admin-modal-heading">
              <span>Administration · boutique officielle</span>
              <div id={titleId} className="retro-admin-modal-title">{title}</div>
            </div>
            <button
              ref={closeButtonRef}
              className="retro-admin-modal-close"
              type="button"
              onClick={close}
              aria-label="Fermer"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        )}
        <div className="retro-admin-modal-body">{children}</div>
      </div>
    </div>
  );
}
