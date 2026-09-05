import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Scene } from "@/components/scene/Scene";
import { TopBar } from "@/components/scene/TopBar";
import { LogoPill } from "@/components/scene/LogoPill";
import { Breadcrumb } from "@/components/scene/Breadcrumb";
import { Footer } from "@/components/scene/Footer";
import { ClearCartOnMount } from "@/components/checkout/ClearCartOnMount";
import { capped, vmin } from "@/lib/fluid";
import { formatCents } from "@/lib/format";

export default async function CommandeConfirmationPage(props: PageProps<"/commande/confirmation">) {
  const searchParams = await props.searchParams;
  const orderId = typeof searchParams.order === "string" ? searchParams.order : "";

  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: { select: { name: true } } } } },
      })
    : null;

  if (!order) notFound();

  const reference = `#${order.id.slice(-5).toUpperCase()}`;
  const isPaid = order.status !== "PENDING";

  return (
    <Scene>
      <ClearCartOnMount />
      <TopBar left={<LogoPill />} right={<Breadcrumb items={["Boutique", "Confirmation"]} />} />

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: capped(560),
          boxSizing: "border-box",
          padding: vmin(36),
          borderRadius: "var(--radius-2xl)",
          background: "linear-gradient(180deg, var(--glass-fill-strong-top), var(--glass-fill-bottom))",
          border: "1px solid var(--glass-border-strong)",
          backdropFilter: "blur(var(--blur-strong))",
          WebkitBackdropFilter: "blur(var(--blur-strong))",
          boxShadow: "0 30px 70px rgba(0,0,0,0.3)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: vmin(20),
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: vmin(8), textAlign: "center" }}>
          <div style={{ fontSize: vmin(26), fontWeight: 700 }}>Merci pour votre commande !</div>
          <div style={{ fontSize: vmin(14), fontWeight: 500, color: "var(--text-on-scene-tertiary)" }}>
            Commande {reference} · {isPaid ? "Paiement confirmé" : "En attente de confirmation du paiement"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: vmin(10) }}>
          {order.items.map((item) => (
            <div
              key={item.id}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: vmin(14) }}
            >
              <span style={{ color: "var(--text-on-scene-secondary)" }}>
                {item.product.name} <span style={{ color: "var(--text-on-scene-tertiary)" }}>× {item.quantity}</span>
              </span>
              <span style={{ fontWeight: 600 }}>{formatCents(item.priceCents * item.quantity, order.currency)}</span>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: "var(--glass-border-strong)" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: vmin(16), fontWeight: 600 }}>Total</span>
          <span style={{ fontSize: vmin(22), fontWeight: 700 }}>{formatCents(order.totalCents, order.currency)}</span>
        </div>

        <div style={{ fontSize: vmin(13), color: "var(--text-on-scene-tertiary)" }}>
          Livraison à {order.shippingAddress}, {order.shippingPostalCode} {order.shippingCity}
        </div>

        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: `${vmin(16)} 0`,
            borderRadius: "var(--radius-base)",
            background: "var(--surface-light)",
            border: "1px solid var(--surface-light-border)",
            color: "var(--ink)",
            fontSize: vmin(15),
            fontWeight: 700,
          }}
        >
          Continuer mes achats
        </Link>
      </div>

      <Footer />
    </Scene>
  );
}
