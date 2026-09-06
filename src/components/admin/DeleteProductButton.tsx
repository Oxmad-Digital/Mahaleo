"use client";

import { useState, useTransition } from "react";
import { deleteProduct } from "@/app/actions/products";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        title="Supprimer"
        onClick={() => setConfirmOpen(true)}
        style={{
          width: 30,
          height: 30,
          borderRadius: 6,
          border: "1px solid rgba(55,53,47,0.09)",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a82c2c" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7h16M9 7V4.8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V7M6 7l1 13a1 1 0 0 0 1 .9h8a1 1 0 0 0 1-.9l1-13" />
        </svg>
      </button>
      <ConfirmDialog
        open={confirmOpen}
        title="Supprimer le produit"
        message={`Supprimer « ${name} » ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        danger
        pending={pending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          startTransition(async () => {
            await deleteProduct(id);
            setConfirmOpen(false);
          });
        }}
      />
    </>
  );
}
