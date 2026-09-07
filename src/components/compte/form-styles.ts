import type { CSSProperties } from "react";

/** Styles partagés par les formulaires de l'espace client, alignés sur l'admin. */
export const inputStyle: CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  padding: "9px 12px",
  borderRadius: 6,
  border: "1px solid rgba(55,53,47,0.15)",
  fontSize: 14,
  fontFamily: "inherit",
  color: "#37352f",
  outline: "none",
};

export const labelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(55,53,47,0.7)",
};

export const fieldErrorStyle: CSSProperties = {
  fontSize: 12,
  color: "#a82c2c",
  margin: 0,
};

export function noticeStyle(success?: boolean): CSSProperties {
  return {
    margin: 0,
    padding: "10px 14px",
    borderRadius: 6,
    background: success ? "#e3f0e8" : "#fbe4e4",
    color: success ? "var(--brand-green, #1c6b3a)" : "#a82c2c",
    fontSize: 13,
    fontWeight: 500,
  };
}

export function primaryButtonStyle(pending: boolean): CSSProperties {
  return {
    padding: "10px 18px",
    borderRadius: 6,
    border: "none",
    background: "var(--brand-green, #1c6b3a)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: pending ? "default" : "pointer",
    opacity: pending ? 0.7 : 1,
  };
}
