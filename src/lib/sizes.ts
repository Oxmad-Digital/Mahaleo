// Ordre naturel des tailles de vêtement ; les tailles numériques (38, 40…) sont
// triées par valeur et les tailles inconnues gardent l'ordre alphabétique.
const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "XXXL", "3XL", "4XL", "TU"];

function rank(size: string) {
  const index = SIZE_ORDER.indexOf(size.trim().toUpperCase());
  if (index !== -1) return index;
  const numeric = Number.parseFloat(size.replace(",", "."));
  return Number.isNaN(numeric) ? Number.POSITIVE_INFINITY : SIZE_ORDER.length + numeric;
}

export function compareSizes(a: string, b: string) {
  return rank(a) - rank(b) || a.localeCompare(b, "fr");
}

export function sortBySize<T extends { size: string }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => compareSizes(a.size, b.size));
}
