# Exigences de production

Codex doit conserver le framework, le routeur, le gestionnaire de paquets, les composants et les conventions du projet cible. La maquette est une référence visuelle, pas une architecture à importer telle quelle.

## Données et commerce

Chaque produit doit fournir identifiant, slug, catégorie, prix entier en MGA, description, image, couleur et variantes avec stock. Formater avec `Intl.NumberFormat('fr-FR')` et le suffixe `Ar`. Calculer avec les entiers, jamais avec les chaînes formatées.

Brancher le panier existant. Conserver les identifiants de variante et les quantités. Revalider prix et stock côté serveur avant toute commande. Centraliser les données non validées comme configuration.

## Images, SEO et accessibilité

Utiliser le composant image du projet, des dimensions réservées, WebP/AVIF et un chargement prioritaire limité au premier écran. Police locale et une seule graisse. Définir titre, description, langue et métadonnées sociales validées. Les données structurées Product ne doivent contenir que des informations réelles.

Assurer clavier complet, focus visible, Échap, piège et retour de focus, labels des icônes, annonces d'erreurs, zones tactiles suffisantes et utilisation à 200 % de zoom.

## À valider avant lancement

Catalogue, coloris, tailles, matières, stocks, prix, livraison, paiement, retours, mentions légales, confidentialité, droits d'usage du logo et des archives, accord Mahaleo sur chaque marquage textile.
