"use client";

import { revokeAdmin } from "@/app/actions/settings";

export function RevokeAdminButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={revokeAdmin.bind(null, id)}
      onSubmit={(event) => {
        if (!window.confirm(`Retirer les droits administrateur de « ${name} » ?`)) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
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
    </form>
  );
}
