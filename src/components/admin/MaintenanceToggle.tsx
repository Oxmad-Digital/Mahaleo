"use client";

import { useState, useTransition } from "react";
import { setMaintenanceMode } from "@/app/actions/settings";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function MaintenanceToggle({ enabled }: { enabled: boolean }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const confirmMessage = enabled
    ? "Désactiver le mode maintenance ? Le site redeviendra accessible à tous les visiteurs."
    : "Activer le mode maintenance ? Le site affichera un écran de maintenance à tous les visiteurs (les administrateurs connectés continueront d'y accéder normalement).";

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
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
      <ConfirmDialog
        open={confirmOpen}
        title={enabled ? "Désactiver la maintenance" : "Activer la maintenance"}
        message={confirmMessage}
        confirmLabel={enabled ? "Désactiver" : "Activer"}
        danger={enabled}
        pending={pending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          startTransition(async () => {
            await setMaintenanceMode(!enabled);
            setConfirmOpen(false);
          });
        }}
      />
    </>
  );
}
