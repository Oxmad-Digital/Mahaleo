"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { sendContactMessage } from "@/app/actions/contact";
import { LocationDotIcon } from "../icons";
import { capped, vmin } from "@/lib/fluid";

export function ContactButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Nous contacter"
        title="Nous contacter"
        onClick={() => setOpen(true)}
        style={{
          width: vmin(40),
          height: vmin(40),
          flex: "none",
          borderRadius: "var(--radius-pill)",
          background: "var(--glass-pill-bg)",
          border: "1px solid var(--glass-pill-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <LocationDotIcon />
      </button>
      {open && <ContactModal onClose={() => setOpen(false)} />}
    </>
  );
}

function ContactModal({ onClose }: { onClose: () => void }) {
  const [state, formAction, pending] = useActionState(sendContactMessage, undefined);

  const handleClose = useCallback(() => {
    if (!pending) onClose();
  }, [pending, onClose]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleClose]);

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,15,15,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Nous contacter"
        style={{
          position: "relative",
          width: capped(460),
          boxSizing: "border-box",
          padding: vmin(40),
          borderRadius: "var(--radius-2xl)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.92))",
          border: "1px solid var(--surface-light-border)",
          boxShadow: "0 30px 70px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: vmin(22),
          color: "var(--ink)",
        }}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fermer"
          disabled={pending}
          style={{
            position: "absolute",
            top: vmin(16),
            right: vmin(16),
            width: vmin(28),
            height: vmin(28),
            borderRadius: "50%",
            border: "1px solid var(--ink-border)",
            background: "transparent",
            color: "var(--ink-tertiary)",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: pending ? "default" : "pointer",
          }}
        >
          <svg width={vmin(12)} height={vmin(12)} viewBox="0 0 12 12" fill="none">
            <path
              d="M1 1L11 11M11 1L1 11"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: vmin(6) }}>
          <div style={{ fontSize: vmin(24), fontWeight: 700 }}>Nous contacter</div>
          <div style={{ fontSize: vmin(14), fontWeight: 500, color: "var(--ink-tertiary)" }}>
            Une question, une remarque ? Envoyez-nous un message, nous vous répondrons par e-mail.
          </div>
        </div>

        {state?.success ? (
          <p style={{ fontSize: vmin(14), fontWeight: 500, color: "var(--ink)", margin: 0 }}>
            Merci, votre message a bien été envoyé.
          </p>
        ) : (
          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: vmin(18) }}>
            <div style={{ display: "flex", flexDirection: "column", gap: vmin(8) }}>
              <label htmlFor="contact-name" style={{ fontSize: vmin(13), fontWeight: 600, color: "var(--ink-secondary)" }}>
                Nom
              </label>
              <input id="contact-name" name="name" type="text" placeholder="Votre nom" style={inputStyle} />
              {state?.errors?.name && <FieldError message={state.errors.name[0]} />}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: vmin(8) }}>
              <label htmlFor="contact-email" style={{ fontSize: vmin(13), fontWeight: 600, color: "var(--ink-secondary)" }}>
                Adresse e-mail
              </label>
              <input id="contact-email" name="email" type="email" placeholder="vous@exemple.com" style={inputStyle} />
              {state?.errors?.email && <FieldError message={state.errors.email[0]} />}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: vmin(8) }}>
              <label htmlFor="contact-message" style={{ fontSize: vmin(13), fontWeight: 600, color: "var(--ink-secondary)" }}>
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                placeholder="Votre message"
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              />
              {state?.errors?.message && <FieldError message={state.errors.message[0]} />}
            </div>

            <button
              type="submit"
              disabled={pending}
              style={{
                padding: vmin(14),
                borderRadius: "var(--radius-xs)",
                background: "var(--surface-dark-solid)",
                color: "#fff",
                fontSize: vmin(15),
                fontWeight: 600,
                textAlign: "center",
                cursor: pending ? "default" : "pointer",
                opacity: pending ? 0.7 : 1,
                border: "none",
                boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
                fontFamily: "inherit",
              }}
            >
              {pending ? "Envoi..." : "Envoyer"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p style={{ fontSize: vmin(12), color: "var(--brand-red, #c0392b)", margin: 0 }}>{message}</p>
  );
}

const inputStyle: React.CSSProperties = {
  boxSizing: "border-box",
  padding: `${vmin(13)} ${vmin(16)}`,
  borderRadius: "var(--radius-xs)",
  border: "1px solid var(--ink-border)",
  background: "#ffffff",
  fontSize: vmin(15),
  fontFamily: "inherit",
  color: "var(--ink)",
  outline: "none",
};
