export function BarList({ items }: { items: { label: string; value: number }[] }) {
  if (items.length === 0) {
    return <div style={{ fontSize: 14, color: "rgba(55,53,47,0.5)", padding: "12px 0" }}>Aucune donnée pour le moment.</div>;
  }

  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{ flex: "0 0 40%", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            title={item.label}
          >
            {item.label}
          </span>
          <div style={{ flex: 1, height: 8, borderRadius: 999, background: "rgba(55,53,47,0.08)" }}>
            <div style={{ width: `${Math.max(2, (item.value / max) * 100)}%`, height: 8, borderRadius: 999, background: "#1c6b3a" }} />
          </div>
          <span style={{ flex: "0 0 auto", fontSize: 13, fontWeight: 600, minWidth: 32, textAlign: "right" }}>
            {item.value.toLocaleString("fr-FR")}
          </span>
        </div>
      ))}
    </div>
  );
}

export function BarListCard({ title, items }: { title: string; items: { label: string; value: number }[] }) {
  return (
    <div
      style={{
        padding: "22px 24px 20px",
        borderRadius: 8,
        border: "1px solid rgba(55,53,47,0.09)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div style={{ fontSize: 17, fontWeight: 600 }}>{title}</div>
      <BarList items={items} />
    </div>
  );
}
