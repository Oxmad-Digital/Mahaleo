/**
 * Hôte public du bucket R2 des images produit, autorisé pour l'optimiseur
 * d'images dans next.config.ts. À mettre à jour si le bucket passe sur un
 * domaine personnalisé.
 */
export const PRODUCT_IMAGE_HOST = "pub-a76a4f2627064f018ee45b30ccc516e6.r2.dev";

/**
 * Les URLs d'images sont saisies dans l'admin et peuvent viser un autre hôte :
 * celles-là sont servies telles quelles (`unoptimized`), plutôt que d'ouvrir
 * l'optimiseur à n'importe quelle URL du web.
 */
export function isOptimizableImage(src: string) {
  if (src.startsWith("/")) return !src.startsWith("//");
  try {
    const url = new URL(src);
    return url.protocol === "https:" && url.hostname === PRODUCT_IMAGE_HOST;
  } catch {
    return false;
  }
}
