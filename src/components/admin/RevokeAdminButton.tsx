"use client";

import { useState, useTransition } from "react";
import { revokeAdmin } from "@/app/actions/settings";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function RevokeAdminButton({ id, name }: { id: string; name: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        style={{
          padding: "9px 16px",
          borderRadius: 6,
          border: "1px solid rgba(168,44,44,0.25)",
          background: "transparent",
          color: "#a82c2c",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Retirer les droits admin
      </button>
      <ConfirmDialog
        open={confirmOpen}
        title="Retirer les droits admin"
        message={`Retirer les droits administrateur de « ${name} » ?`}
        confirmLabel="Retirer"
        danger
        pending={pending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          startTransition(async () => {
            await revokeAdmin(id);
            setConfirmOpen(false);
          });
        }}
      />
    </>
  );
}
