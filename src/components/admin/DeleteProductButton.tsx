"use client";

import { deleteProduct } from "@/app/actions/products";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteProduct.bind(null, id)}
      onSubmit={(event) => {
        if (!window.confirm(`Supprimer « ${name} » ? Cette action est irréversible.`)) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        title="Supprimer"
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
    </form>
  );
}
