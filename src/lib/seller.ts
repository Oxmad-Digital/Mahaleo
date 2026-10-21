/**
 * Identité du vendeur, reprise des mentions légales (extrait INPI du
 * 4 octobre 2024) : elle figure sur les factures, les avoirs et les CGV.
 * À tenir à jour avec les mentions légales.
 */
export const SELLER = {
  name: "RED ISLAND",
  legalForm: "SAS au capital de 5 000 €",
  siren: "530 363 621",
  siret: "530 363 621 00026",
  ape: "4616Z",
  president: "Frédéric Wybo",
  addressLines: ["Apt 25, Résidence La Citronnelle", "1 rue de la République", "97420 Le Port, La Réunion, France"],
  email: "tom.wybo@yahoo.fr",
  /**
   * Identifiants légaux affichés sur les factures. Le n° de TVA
   * intracommunautaire est à ajouter dès qu'il est communiqué.
   */
  legalIds: ["SAS au capital de 5 000 €", "SIRET 530 363 621 00026", "APE 4616Z"] as string[],
} as const;
