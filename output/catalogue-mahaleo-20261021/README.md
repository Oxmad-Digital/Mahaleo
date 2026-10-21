# Catalogue Mahaleo — 21 octobre 2026

Les 20 photos de `/home/antoine-ponthieu/Images/Mahaleo/Produits-2` servent de références aux **40 nouveaux visuels studio**, soit quatre vues par fiche : mannequin, face, dos, détail. Les poses, angles et fonds ivoire reprennent la logique des anciennes galeries.

Les dix mannequins générés sont différents, avec une origine malgache demandée dans les prompts : **cinq hommes et cinq femmes**. Répartition : gilet olive homme / taupe femme ; pull olive femme / taupe homme ; manteau olive homme / taupe femme ; écharpe olive femme / taupe homme ; bonnet olive homme / gris femme.

Les noms, couleurs, descriptions, mailles et coupes ont été adaptés en base : vert olive avec broderies écrues, taupe chiné avec broderies rouges, bonnet gris chiné avec broderies rouges. Les guitares des vêtements sont placées au bas de la manche droite et les dos des pulls présentent les torsades réelles. Le bonnet porte un emblème guitare avec le nom sur son revers. Aucune composition en fibres ni consigne d’entretien n’est déduite des photos.

## Livrables

- Outil utilisé : **image_gen intégré**, avec les anciennes vues comme références de composition et les nouvelles photos comme références produit.
- Prompts finaux, références, description de chaque mannequin et chemins des images retenues : `generation.json`. Ce fichier fait foi pour les prompts et retouches ; `plan.json` conserve le plan de travail initial.
- PNG de travail : `originals/mahaleo-*.png`, ignorés par Git.
- WebP livrés : `webp/mahaleo-{nom-du-produit}-{couleur}-{vue}.webp`, ignorés par Git.
- WebP qualité 80, effort 6, limités à 1200 × 1600 pixels sans agrandissement ni recadrage : **116 950 154 → 8 730 816 octets (−92,5 %)**. Les deux faces de bonnets sont carrées ; la galerie existante les contient sans rogner le produit.
- Les 40 fichiers sont publiés sur R2 sous `products/mahaleo-20261021/`, avec noms descriptifs et suffixe SHA-256 pour le cache immuable. URLs, dimensions, poids et empreintes : `manifest.json`.

## Import et contrôles

Préparation : `node scripts/refresh-mahaleo-20261021.mjs`.

Publication effectuée : `node --dns-result-order=ipv4first scripts/refresh-mahaleo-20261021.mjs --apply`.

Contrôle distant : `node --dns-result-order=ipv4first scripts/refresh-mahaleo-20261021.mjs --verify`.

Les 40 URLs ont été téléchargées et contrôlées (HTTP, type WebP et empreinte) avant et après l’import. Les dix galeries et les champs descriptifs sont vérifiés en base : `verification.json`.

L’import ne modifie que les images, nom, description, couleur, libellé couleur, maille et coupe. Une transaction verrouille les fiches et annule l’écriture si ces champs ont été édités depuis la sauvegarde. Prix, promotions, stocks, tailles, publication, identifiants et liens de commandes sont préservés. Les anciennes URLs de fiche sont conservées pour préserver les liens existants. Les trois anciens brouillons restent inchangés.

Sauvegardes : `before.json` et `before-apply.json`. Les anciennes images R2 restent disponibles pour un retour arrière.

Aucune image ni fiche n’a été ajoutée en dur aux pages. La boutique et l’administration lisent toujours `Product.images` et les champs en base. Aucun déploiement applicatif n’est nécessaire pour ces données ; le cache catalogue existant se renouvelle sous cinq minutes.

Le script passe le contrôle de syntaxe Node et ESLint. Le contrôle HTTP des fiches et de la collection est consigné dans `render-verification.json`. Aucun navigateur n’était connecté pour un contrôle interactif ; le contrôle visuel porte sur les 40 fichiers et le contrôle applicatif sur le HTML réellement rendu depuis la base.
