"use client";

import { useCallback, useEffect } from "react";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  danger,
  pending,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const handleCancel = useCallback(() => {
    if (!pending) onCancel();
  }, [pending, onCancel]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, handleCancel]);

  if (!open) return null;

  return (
    <div
      onClick={handleCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,15,15,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        style={{
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
          width: "100%",
          maxWidth: 420,
          padding: 24,
        }}
      >
        {title && (
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 10 }}>
            {title}
          </div>
        )}
        <div style={{ fontSize: 14, color: "rgba(55,53,47,0.75)", lineHeight: 1.5, marginBottom: 22 }}>
          {message}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            type="button"
            onClick={handleCancel}
            disabled={pending}
            style={{
              padding: "9px 16px",
              borderRadius: 6,
              border: "1px solid rgba(55,53,47,0.15)",
              background: "transparent",
              color: "#37352f",
              fontSize: 14,
              fontWeight: 600,
              cursor: pending ? "default" : "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            style={{
              padding: "9px 16px",
              borderRadius: 6,
              border: "none",
              background: danger ? "#a82c2c" : "var(--brand-green, #1c6b3a)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: pending ? "default" : "pointer",
              opacity: pending ? 0.7 : 1,
            }}
          >
            {pending ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
