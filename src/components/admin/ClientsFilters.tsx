export function ClientSearchForm({ query }: { query?: string }) {
  return (
    <form action="/admin/clients" method="get" className="admin-client-search-form" style={{ display: "flex" }}>
      <input
        type="text"
        name="q"
        defaultValue={query}
        placeholder="Rechercher un client, un email…"
        className="admin-client-search-input"
        style={{
          width: 260,
          padding: "8px 12px",
          borderRadius: 6,
          border: "1px solid rgba(55,53,47,0.15)",
          fontSize: 14,
          color: "#37352f",
          outline: "none",
        }}
      />
    </form>
  );
}
