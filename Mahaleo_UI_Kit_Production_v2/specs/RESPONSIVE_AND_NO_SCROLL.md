# Responsive et principe sans défilement

La collection doit être visible sans défilement sur les écrans courants. L'accessibilité reste prioritaire : autoriser le défilement sur écran très bas, au zoom 200 % et dans les fenêtres longues.

| Contexte | Comportement |
|---|---|
| `≥1600 px` | Panneau guitare large, 3 produits, marges 50 px |
| `1201–1599 px` | Guitare + 3 produits, marges 36 px |
| `901–1200 px` | Guitare réduite + 3 produits |
| `601–900 px` | Guitare masquée + 2 produits |
| `≤600 px` | 1 produit, filtres compacts, pagination |
| hauteur `≤700 px` | Espacements réduits, métadonnées secondaires masquées |
| hauteur `≤500 px` | Défilement autorisé |

Utiliser `100dvh`, `min-height: 0` dans les zones flexibles et des ratios d'image réservés. Ne pas bloquer le défilement des dialogues. Tester 360, 390, 768, 1024, 1366, 1440 et 1920 px, avec les hauteurs 650, 768, 900 et 1080 px.
