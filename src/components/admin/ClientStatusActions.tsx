"use client";

import { useState, useTransition } from "react";
import { setClientStatus } from "@/app/actions/clients";
import type { UserStatus } from "@/generated/prisma/client";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const buttonStyle: React.CSSProperties = {
  padding: "9px 16px",
  borderRadius: 6,
  border: "1px solid rgba(55,53,47,0.09)",
  background: "transparent",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

function ActionButton({
  id,
  status,
  confirmMessage,
  confirmTitle,
  tone,
  children,
}: {
  id: string;
  status: UserStatus;
  confirmMessage?: string;
  confirmTitle?: string;
  tone?: "danger" | "warning";
  children: React.ReactNode;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const tonedStyle: React.CSSProperties = {
    ...buttonStyle,
    color: tone === "danger" ? "#a82c2c" : tone === "warning" ? "#8a6416" : "#37352f",
    borderColor: tone === "danger" ? "rgba(168,44,44,0.25)" : tone === "warning" ? "rgba(138,100,22,0.25)" : "rgba(55,53,47,0.09)",
  };

  const run = () => {
    startTransition(async () => {
      await setClientStatus(id, status);
      setConfirmOpen(false);
    });
  };

  return (
    <>
      <button
        type="button"
        style={tonedStyle}
        onClick={() => (confirmMessage ? setConfirmOpen(true) : run())}
      >
        {children}
      </button>
      {confirmMessage && (
        <ConfirmDialog
          open={confirmOpen}
          title={confirmTitle}
          message={confirmMessage}
          danger={tone === "danger"}
          pending={pending}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={run}
        />
      )}
    </>
  );
}

export function ClientStatusActions({ id, status }: { id: string; status: UserStatus }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {status !== "ACTIVE" && (
        <ActionButton id={id} status="ACTIVE">
          Réactiver
        </ActionButton>
      )}
      {status !== "SUSPENDED" && (
        <ActionButton
          id={id}
          status="SUSPENDED"
          tone="warning"
          confirmTitle="Suspendre le client"
          confirmMessage="Suspendre ce client ? Il ne pourra plus se connecter tant qu'il est suspendu."
        >
          Suspendre
        </ActionButton>
      )}
      {status !== "BANNED" && (
        <ActionButton
          id={id}
          status="BANNED"
          tone="danger"
          confirmTitle="Bannir le client"
          confirmMessage="Bannir ce client ? Il ne pourra plus se connecter à son compte."
        >
          Bannir
        </ActionButton>
      )}
    </div>
  );
}
