"use client";

import { useState, useTransition } from "react";
import { generateInvoice } from "@/app/actions/orders";

export function GenerateInvoiceButton({ orderId, disabled }: { orderId: string; disabled?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button
        type="button"
        disabled={pending || disabled}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const result = await generateInvoice(orderId);
            if (result.message) setMessage(result.message);
          });
        }}
        style={{
          padding: "9px 16px",
          borderRadius: 6,
          border: "1px solid rgba(55,53,47,0.09)",
          background: "transparent",
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "inherit",
          color: "#37352f",
          cursor: pending || disabled ? "default" : "pointer",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {pending ? "Émission..." : "Émettre la facture"}
      </button>
      {message && <p style={{ fontSize: 12, color: "#a82c2c", margin: 0 }}>{message}</p>}
    </div>
  );
}
