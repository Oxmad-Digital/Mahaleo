# Prompt à donner à Codex

Je veux appliquer le UI kit Mahaleo fourni à mon projet e-commerce existant.

Commence par analyser le projet : framework, routeur, structure, composants UI, catalogue, panier, base de données, stockage des images, paiement, styles, conventions, tests et commandes de validation. Lis tous les fichiers AGENTS.md et instructions locales applicables.

La référence principale est `reference/index.html`. Les règles détaillées sont dans `specs/`. Le logo officiel est `reference/assets/logo-mahaleo.png` : ne le remplace jamais par du texte. Les vêtements et la guitare sont des maquettes visuelles à conserver comme placeholders seulement tant que les vrais assets ne sont pas disponibles.

Reproduis fidèlement la deuxième proposition rétro dans l'application réelle : papier crème, filets éditoriaux, titres condensés, logo rouge, panneau guitare et collection visible immédiatement.

Contraintes :

1. L'utilisateur arrive directement sur les produits ; aucun hero ne doit les repousser sous la ligne de flottaison.
2. La page tient sans défilement sur les écrans courants selon `specs/RESPONSIVE_AND_NO_SCROLL.md`. Le défilement reste possible lorsque la hauteur, le zoom ou l'accessibilité l'exigent.
3. Utilise les données réelles. `data/products.example.json` décrit le contrat souhaité, mais ses valeurs sont indicatives.
4. Réutilise le panier, le catalogue, les variantes, les fenêtres et les notifications existants.
5. Branche les filtres, tailles, quantités, suppressions et retours d'état. Revalide stock et prix côté serveur.
6. Assure clavier, focus, zoom 200 % et `prefers-reduced-motion`.
7. Optimise images et police sans dépendance lourde inutile.
8. Conserve les fonctionnalités e-commerce existantes compatibles avec le design.
9. Applique la refonte aux vraies routes ; ne crée ni deuxième application ni simple page de démo.
10. Centralise et signale toute donnée commerciale manquante.

Implémente la refonte complète, teste collection → fiche → taille → panier, vérifie les principaux viewports et corrige les problèmes. Termine avec les fichiers modifiés, le comportement, les validations exécutées et les données restant à confirmer. Ne déploie pas sans demande explicite dans cette conversation.
