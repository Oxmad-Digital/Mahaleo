# Catalogue Mahaleo — 11 octobre 2026

> Mise à jour du 21 octobre : les nouvelles photos, couleurs et broderies remplacent désormais ces visuels dans les dix fiches. Voir le [catalogue actuel](../catalogue-mahaleo-20261021/README.md). Ce dossier conserve l’historique de la première génération.

40 photos générées avec l’outil intégré `image_gen`, à partir des vraies photos du dossier `/home/antoine-ponthieu/Images/Mahaleo/Produits` : les 10 faces studio initiales et 30 vues complémentaires. Les versions grises sont des recolorations des vues bleues. Fond ivoire et lumière diffuse cohérents ; une même mannequin générée porte les cinq modèles. Les prompts complets et leurs références se trouvent dans `generation.json` (faces) et `gallery-generation.json` (autres vues).

Chaque galerie suit l’ordre demandé : **mannequin, face, dos, détail**. Les broderies documentées sont reprises sur le gilet, le demi-zip, le manteau et l’écharpe. Le bonnet n’ayant pas de broderie visible, son détail montre la maille et le revers. Faute de photos arrière, les dos sont des reconstitutions à partir des faces avant, avec une maille cohérente et sans motif supplémentaire ; ils ne constituent pas une documentation photographique de l’arrière réel.

## Fiches enregistrées en base

Chaque modèle existe en bleu chiné et gris chiné, avec une fiche indépendante par couleur. Les pages utilisent les tables `Product` et `ProductSize` via les lecteurs existants ; aucun produit n’est codé dans une page. `products.json` sert uniquement à l’import ponctuel.

| Modèle | Prix provisoire | Stock par couleur |
| --- | ---: | ---: |
| Bonnet à revers | 25 € | 10 |
| Écharpe à franges | 35 € | 10 |
| Gilet zippé | 75 € | 10 |
| Pull torsadé demi-zip | 80 € | 10 |
| Manteau long | 110 € | 10 |

Prix provisoires choisis avec l’autorisation du client. Répartition confirmée des vêtements : S 2, M 3, L 3, XL 2 ; accessoires : Unique 10. Composition en fibres et entretien non confirmés : aucune composition ni consigne inventée. Tous ces champs, les photos, les tailles et les stocks se modifient dans `/admin/produits`.

## Images et import

- Compression du 11 octobre 2026 : les 46 références d’images des 13 fiches (10 publiées et 3 brouillons) utilisent désormais les WebP du préfixe R2 `products/compressed/`. Les 3 PNG encore locaux ont été convertis ; les WebP existants ont été recompressés à qualité 78 sans redimensionnement, ou conservés s’ils étaient déjà plus petits. Poids cumulé : 23 879 675 → 10 985 534 octets (−54 %).
- État avant compression : `compressed-images/before.json`. Correspondance des anciennes/nouvelles URLs, tailles et empreintes : `compressed-images/manifest.json`. Contrôle de mise en ligne et de mise à jour des fiches : `compressed-images/verification.json`. Les anciennes sources sont conservées pour permettre un retour arrière.
- Script de compression : `node --dns-result-order=ipv4first scripts/compress-product-images.mjs` prépare les fichiers et le manifeste ; `--apply` les envoie sur R2 et remplace les références en base après vérification HTTP du type WebP et de l’empreinte de chaque image. Une galerie modifiée entre-temps annule la transaction ; l’ordre des vues reste identique. Le cache du catalogue se renouvelle sous 5 minutes.
- Les photos produit sont exclues de Git : seuls le code, les manifestes JSON et les rapports sont versionnés. Le site charge les URLs R2 enregistrées en base. Les copies de travail locales restent disponibles, sans être incluses dans les nouveaux commits.
- Copies de travail WebP, ignorées par Git : `public/images/products/*-studio-v1.webp` (faces) et `*-v2.webp` (mannequin, dos, détail).
- Originaux PNG locaux, ignorés par Git : `originaux/` et `galeries-originaux/`. Les scripts d’import historiques nécessitent ces copies de travail ; ils ne sont pas utilisés par le site en production.
- Images mises en ligne sur le bucket R2 du projet : URLs dans `import-result.json` (faces), `gallery-import-result.json` (galeries) et dans chaque fiche en base.
- Sauvegarde des fiches et tailles avant import : `before-import.json`.
- Sauvegarde avant ajout des galeries : `before-gallery-update.json`.
- Aperçu de l’import : `node scripts/import-mahaleo-products.mjs`.
- Import : `node --dns-result-order=ipv4first scripts/import-mahaleo-products.mjs --apply`.
- Aperçu des galeries : `node scripts/update-mahaleo-galleries.mjs`.
- Ajout des galeries : `node --dns-result-order=ipv4first scripts/update-mahaleo-galleries.mjs --apply`.

Une relance conserve les fiches déjà présentes et ne réinitialise pas leurs prix, stocks ou photos modifiés dans l’admin. Les 3 anciens « Pull crème » sont conservés en brouillon avec leurs IDs, prix, stocks et liens aux commandes.

L’import des galeries modifie uniquement `Product.images` et `updatedAt`. Il valide l’accès aux 30 nouvelles images R2 avant la transaction ; une galerie modifiée dans l’admin entre-temps annule l’import. Après import, une relance conserve l’ordre choisi dans l’admin. La galerie publique lit toujours le tableau d’images en base, quel que soit leur nombre ou leur ordre. Les vignettes sont à gauche sur ordinateur et sous la photo sur mobile ; le format portrait préserve les photos sans les recadrer.

## Publication

Le formulaire admin expose « Publié dans la boutique ». Un brouillon peut être enregistré sans prix ni tailles ; la publication exige un prix positif et au moins une taille. Les brouillons sont filtrés de la collection, des fiches publiques, de la remise à jour du panier et du paiement. Les modifications admin invalident le cache du catalogue comme auparavant.

Migration additive : `20261011160000_product_publication`. Elle est appliquée et enregistrée dans l’historique Prisma. La connexion SQL directe étant indisponible ici, `scripts/apply-product-publication.mjs` l’a appliquée via l’API HTTPS de Neon avec son checksum SHA-256. Pour les environnements qui accèdent au port PostgreSQL, utiliser `prisma migrate deploy --config prisma7.config.ts`.

Les données et les photos sont déjà enregistrées sur les services du projet. Le code de publication et le nouveau rendu de galerie doivent être déployés pour que le site hébergé utilise ces changements.

## Vérifications effectuées

- Lint et TypeScript sans erreur.
- Compilation de production réussie avec `npm run build -- --webpack` ; Turbopack ne peut pas créer son port interne dans cet environnement. `ws` est externalisé côté serveur pour éviter le remplacement de ses modules natifs optionnels par des stubs.
- 10 fiches et leurs photos R2 accessibles en HTTP ; nom et photo propres à chaque produit vérifiés dans le HTML rendu.
- Collection : 10 nouveaux produits présents, 3 anciens masqués ; ancienne fiche publique : HTTP 404.
- Lecteurs Prisma réels de l’admin : 13 fiches dont 10 publiées, recherche et détails des gilets vérifiés ; les 10 fiches publiées renvoient bien 4 photos et 10 unités après ajout des galeries.
- Validation du formulaire : brouillon sans prix/tailles accepté ; publication sans prix positif ou sans tailles refusée ; prix avec virgule accepté ; doublons de tailles refusés.
- Ajout des galeries : 10 fiches à 4 images, prix et tous les stocks par taille identiques à la sauvegarde. Résultat : `gallery-database-verification.json`.
- Navigation réelle dans Chromium : les 4 vignettes de chaque fiche, les flèches et le bouclage première/dernière image fonctionnent. Rendu portrait sans débordement horizontal aux largeurs 1600, 900 et 390 px ; captures `verification-gilet-*.png`, résultat `gallery-verification.json`.
