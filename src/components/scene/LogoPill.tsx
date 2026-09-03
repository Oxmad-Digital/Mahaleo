import { vmin } from "@/lib/fluid";

export function LogoPill() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: `${vmin(10)} ${vmin(22)}`,
        borderRadius: "var(--radius-pill)",
        background: "var(--surface-logo-pill)",
        border: "1px solid var(--surface-logo-pill-border)",
        boxShadow: "var(--shadow-logo-pill)",
      }}
    >
      <img
        src="/images/logo-mahaleo.webp"
        alt="Mahaleo"
        style={{ height: vmin(26), width: "auto", display: "block" }}
      />
    </div>
  );
}
