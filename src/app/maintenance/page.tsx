import Link from "next/link";

export const metadata = {
  title: "Site en maintenance — Mahaleo",
};

export default function MaintenancePage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: 24,
        textAlign: "center",
        background: "#ffffff",
        fontFamily: "var(--font-family)",
        color: "#37352f",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          background: "var(--brand-green, #1c6b3a)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>M</span>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>Site en maintenance</h1>
      <p style={{ fontSize: 15, color: "rgba(55,53,47,0.6)", margin: 0, maxWidth: 420 }}>
        Nous effectuons actuellement une opération de maintenance. Le site sera de nouveau disponible très prochainement. Merci de votre
        patience.
      </p>
      <Link href="/connexion" style={{ fontSize: 13, color: "rgba(55,53,47,0.4)", textDecoration: "none" }}>
        Connexion administrateur
      </Link>
    </div>
  );
}
