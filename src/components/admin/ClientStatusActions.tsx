"use client";

import { setClientStatus } from "@/app/actions/clients";
import type { UserStatus } from "@/generated/prisma/client";

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
  tone,
  children,
}: {
  id: string;
  status: UserStatus;
  confirmMessage?: string;
  tone?: "danger" | "warning";
  children: React.ReactNode;
}) {
  const tonedStyle: React.CSSProperties = {
    ...buttonStyle,
    color: tone === "danger" ? "#a82c2c" : tone === "warning" ? "#8a6416" : "#37352f",
    borderColor: tone === "danger" ? "rgba(168,44,44,0.25)" : tone === "warning" ? "rgba(138,100,22,0.25)" : "rgba(55,53,47,0.09)",
  };

  return (
    <form
      action={setClientStatus.bind(null, id, status)}
      onSubmit={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" style={tonedStyle}>
        {children}
      </button>
    </form>
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
          confirmMessage="Suspendre ce client ? Il ne pourra plus se connecter tant qu'il est suspendu."
        >
          Suspendre
        </ActionButton>
      )}
      {status !== "BANNED" && (
        <ActionButton id={id} status="BANNED" tone="danger" confirmMessage="Bannir ce client ? Il ne pourra plus se connecter à son compte.">
          Bannir
        </ActionButton>
      )}
    </div>
  );
}
