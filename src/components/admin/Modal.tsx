"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

export function Modal({ title, children }: { title?: string; children: React.ReactNode }) {
  const router = useRouter();

  const close = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close]);

  return (
    <div
      onClick={close}
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
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
          width: "100%",
          maxWidth: 680,
        }}
      >
        {title && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px",
              borderBottom: "1px solid rgba(55,53,47,0.09)",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>{title}</div>
            <button
              type="button"
              onClick={close}
              aria-label="Fermer"
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: "none",
                background: "transparent",
                color: "rgba(55,53,47,0.55)",
                fontSize: 18,
                lineHeight: 1,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
