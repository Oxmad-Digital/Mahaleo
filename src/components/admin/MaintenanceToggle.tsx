"use client";

import { setMaintenanceMode } from "@/app/actions/settings";

export function MaintenanceToggle({ enabled }: { enabled: boolean }) {
  return (
    <form
      action={setMaintenanceMode.bind(null, !enabled)}
      onSubmit={(event) => {
        const confirmMessage = enabled
          ? "Désactiver le mode maintenance ? Le site redeviendra accessible à tous les visiteurs."
          : "Activer le mode maintenance ? Le site affichera un écran de maintenance à tous les visiteurs (les administrateurs connectés continueront d'y accéder normalement).";
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        style={{
          padding: "10px 18px",
          borderRadius: 6,
          border: enabled ? "1px solid rgba(168,44,44,0.25)" : "1px solid rgba(55,53,47,0.09)",
          background: enabled ? "transparent" : "var(--brand-green, #1c6b3a)",
          color: enabled ? "#a82c2c" : "#fff",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {enabled ? "Désactiver le mode maintenance" : "Activer le mode maintenance"}
      </button>
    </form>
  );
}
