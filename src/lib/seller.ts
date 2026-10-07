/**
 * Identité du vendeur, reprise des mentions légales : elle figure sur les
 * factures, les avoirs et les CGV. À tenir à jour avec les mentions légales.
 */
export const SELLER = {
  name: "ULTRAMAILLE S.A",
  addressLines: ["Lot II G 55 ter NBA Ambatomaro", "BP 3298, Antananarivo (101)", "Madagascar"],
  email: "contact@ultramaille.com",
  phone: "+261 34 11 855 10",
  /**
   * Identifiants fiscaux (NIF, STAT…) et éventuel n° de TVA, affichés sur les
   * factures dès qu'ils sont renseignés. À compléter avec la comptabilité.
   */
  legalIds: [] as string[],
} as const;
