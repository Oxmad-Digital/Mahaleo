import { ORDER_FLOW, ORDER_STATUS_LABELS } from "@/lib/order-status";
import type { OrderStatus } from "@/generated/prisma/client";

const GREEN = "var(--brand-green, #1c6b3a)";
const LINE = "rgba(55,53,47,0.12)";
const CIRCLE = 30;

/**
 * Version en lecture seule du fil de statuts de l'espace admin : le client suit
 * l'avancement de sa commande mais ne peut pas le modifier.
 */
export function AccountOrderTimeline({ status }: { status: OrderStatus }) {
  const cancelled = status === "CANCELLED";
  const currentIndex = cancelled ? -1 : ORDER_FLOW.indexOf(status as (typeof ORDER_FLOW)[number]);

  const progress = ORDER_FLOW.length > 1 ? Math.max(0, currentIndex) / (ORDER_FLOW.length - 1) : 0;
  const trackInset = 100 / (ORDER_FLOW.length * 2);

  return (
    <div
      style={{
        padding: "22px 24px 18px",
        borderRadius: 8,
        border: "1px solid rgba(55,53,47,0.09)",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Suivi de la commande</div>
        {!cancelled && (
          <div className="admin-order-stepper-hint" style={{ fontSize: 13, color: "rgba(55,53,47,0.45)" }}>
            Vous recevez un e-mail à chaque étape
          </div>
        )}
      </div>

      {cancelled ? (
        <div style={{ padding: "14px 16px", borderRadius: 6, background: "#fbe4e4" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#a82c2c" }}>
            {"Cette commande a été annulée. Contactez-nous si vous pensez qu'il s'agit d'une erreur."}
          </span>
        </div>
      ) : (
        <div style={{ position: "relative", padding: "4px 0 2px" }}>
          <div
            style={{
              position: "absolute",
              top: CIRCLE / 2 + 4,
              left: `${trackInset}%`,
              right: `${trackInset}%`,
              height: 2,
              background: LINE,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: CIRCLE / 2 + 4,
              left: `${trackInset}%`,
              width: `calc((100% - ${trackInset * 2}%) * ${progress})`,
              height: 2,
              background: GREEN,
            }}
          />
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: `repeat(${ORDER_FLOW.length}, 1fr)` }}>
            {ORDER_FLOW.map((step, index) => {
              const done = index < currentIndex;
              const current = index === currentIndex;

              return (
                <div key={step} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      width: CIRCLE,
                      height: CIRCLE,
                      borderRadius: 999,
                      boxSizing: "border-box",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: done ? GREEN : "#fff",
                      border: done || current ? `2px solid ${GREEN}` : `2px solid ${LINE}`,
                    }}
                  >
                    {done ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12.5l5.5 5.5L20 6.5" />
                      </svg>
                    ) : current ? (
                      <span style={{ width: 10, height: 10, borderRadius: 999, background: GREEN }} />
                    ) : null}
                  </span>
                  <span
                    className="admin-order-step-label"
                    style={{
                      fontSize: 13,
                      fontWeight: current ? 600 : 500,
                      color: current ? "#37352f" : "rgba(55,53,47,0.55)",
                      textAlign: "center",
                    }}
                  >
                    {ORDER_STATUS_LABELS[step]}
                  </span>
                  {current && <span style={{ fontSize: 11, fontWeight: 600, color: GREEN, marginTop: -4 }}>Étape actuelle</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
