# Design system — Mahaleo rétro

## Direction

Boutique pensée comme la une d'un ancien journal musical malgache ou une pochette des années 1970 : papier crème, filets fins, titres condensés, photographie sépia et rouge du logo. La guitare acoustique incarne Mahaleo, tandis que les produits restent visibles dès l'arrivée.

## Couleurs

| Token | Valeur | Usage |
|---|---:|---|
| `--paper` | `#EEE6D1` | Fond général et fenêtres |
| `--ink` | `#332F26` | Texte et traits forts |
| `--red` | `#BD3020` | Logo, accent et action principale |
| `--line` | `#BDB299` | Filets et bordures |
| `--muted` | `#766E5B` | Texte secondaire |
| `--photo-bg` | `#E4D8BF` | Fond produit |
| `--photo-sepia` | `#BFA77F` | Panneau guitare |

Conserver un seul rouge, cohérent avec le logo. Utiliser `--ink` pour les petits textes si le contraste du rouge est insuffisant.

## Typographies

- Titres : Barlow Condensed 700, fournie dans `reference/assets/barlow-condensed.ttf`.
- Logo : image PNG fournie. Ne jamais retaper « mahaleo » avec une police.
- Texte courant : Arial / Helvetica.
- Notes éditoriales : Georgia / Times New Roman, souvent en italique.

Références desktop : masthead 72 px, produits 30 px, collection 25 px, corps 16 px, prix 12–14 px. Aucun texte interactif sous 12 px.

## Mise en page

- Marge desktop : 36 px, puis 50 px au-delà de 1600 px.
- Contenu : guitare environ 25 %, catalogue environ 75 %.
- Écart principal : 26 px ; grille produit : 3 colonnes avec 18 px.
- Filets de 1 px ; séparateurs majeurs en double ligne de 3 px.
- Angles droits, sans esthétique de cartes SaaS ni ombres épaisses.

## Logo et mouvement

Logo de 265 px sur ordinateur et 195 px sur mobile, proportions intactes, sans ombre ni recoloration. Zoom produit discret au survol (`scale(1.045)`, 500 ms). Respecter `prefers-reduced-motion`.
