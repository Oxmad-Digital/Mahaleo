"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      style={{
        padding: "9px 16px",
        borderRadius: 6,
        border: "none",
        background: "var(--brand-green, #1c6b3a)",
        color: "#fff",
        fontSize: 14,
        fontWeight: 600,
        fontFamily: "inherit",
        cursor: "pointer",
      }}
    >
      Imprimer / Enregistrer en PDF
    </button>
  );
}
