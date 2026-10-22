# Bonnet olive — correction du 22 octobre 2026

Les quatre vues du bonnet olive ont été retouchées avec **image_gen intégré**, à partir de chaque image existante et de la photo réelle `WhatsApp Image 2026-10-21 at 11.17.07.jpeg` dans `/home/antoine-ponthieu/Images/Mahaleo/Produits-2`.

Consigne : corriger uniquement le fil olive vers la teinte observée sur la photo source, plus claire et grisée, en conservant cadrage, maille, broderie, fond et identité du mannequin. Les prompts exacts et les chemins de chaque génération sont consignés dans [generation.json](generation.json). La fidélité est appréciée visuellement à partir de la photo fournie ; il ne s’agit pas d’une mesure colorimétrique du textile réel.

Les PNG sélectionnés sont conservés dans `originals/mahaleo-bonnet-olive-{mannequin,face,dos,detail}-couleur-v2.png`. Les quatre fichiers destinés au site sont dans `webp/mahaleo-bonnet-vert-olive-{mannequin,face,dos,detail}-couleur-v2.webp`. Ces images de travail sont ignorées par Git comme les précédentes galeries.

Les quatre WebP ont été publiés sur R2 avec de nouvelles clés immuables sous `products/mahaleo-20261022/`. Leurs URLs, empreintes, poids et dimensions figurent dans [manifest.json](manifest.json). Les quatre téléchargements publics sont vérifiés par SHA-256 avant le remplacement de la galerie.

Seuls `Product.images` et `updatedAt` de la fiche `bonnet-a-revers-bleu-chine` (nom actuel : bonnet vert olive) ont été mis à jour. La galerie précédente reste disponible sur R2 et la fiche avant écriture est sauvegardée dans `before-apply.json`. Les autres champs du produit ont été comparés après l’écriture ; voir [verification.json](verification.json).

Préparation : `node scripts/correct-bonnet-color-20261022.mjs`.

Publication effectuée : `node --dns-result-order=ipv4first scripts/correct-bonnet-color-20261022.mjs --apply`.

Vérification distante : `node --dns-result-order=ipv4first scripts/correct-bonnet-color-20261022.mjs --verify`.

Le script passe `node --check` et ESLint. Aucun code applicatif n’a été modifié. Après renouvellement du cache, la fiche de préproduction `https://mahaleo.vercel.app/produit/bonnet-a-revers-bleu-chine` répond HTTP 200 et contient les quatre nouvelles images ; voir `render-verification.json`. Aucun navigateur n’était connecté pour un contrôle interactif.
