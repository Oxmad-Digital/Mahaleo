"use client";

import { useState, useTransition } from "react";
import { deleteClient } from "@/app/actions/clients";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function DeleteClientButton({ id, name }: { id: string; name: string }) {
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
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Supprimer le compte
      </button>
      <ConfirmDialog
        open={confirmOpen}
        title="Supprimer le compte"
        message={`Supprimer définitivement le compte de « ${name} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        danger
        pending={pending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          startTransition(async () => {
            await deleteClient(id);
            setConfirmOpen(false);
          });
        }}
      />
    </>
  );
}
