"use client";

import { deleteClient } from "@/app/actions/clients";

export function DeleteClientButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteClient.bind(null, id)}
      onSubmit={(event) => {
        if (!window.confirm(`Supprimer définitivement le compte de « ${name} » ? Cette action est irréversible.`)) {
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
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Supprimer le compte
      </button>
    </form>
  );
}
