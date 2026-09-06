export function formatCents(cents: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(
    cents / 100
  );
}

/**
 * Comme `formatCents`, mais conserve les centimes quand le montant n'est pas
 * rond : les prix catalogue sont entiers, pas les paiements à montant libre.
 */
export function formatCentsExact(cents: number, currency = "EUR") {
  const digits = cents % 100 === 0 ? 0 : 2;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(cents / 100);
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

export function formatDuration(ms: number | null) {
  if (ms == null) return "—";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes} min ${seconds.toString().padStart(2, "0")}` : `${seconds} s`;
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
    date
  );
}
