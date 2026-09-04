export function formatCents(cents: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(
    cents / 100
  );
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function formatPercent(value: number, { signed = false } = {}) {
  const formatted = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(Math.abs(value));
  const sign = signed ? (value > 0 ? "+" : value < 0 ? "−" : "") : "";
  return `${sign}${formatted} %`;
}

export function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(date);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    date
  );
}
