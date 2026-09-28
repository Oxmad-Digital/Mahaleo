# Composants et états

## Structure

- Bandeau éditorial : Antsirabe, Madagascar, depuis 1972.
- En-tête : contexte à gauche, logo centré, panier à droite ; logo à gauche sur mobile.
- Masthead : « LE VESTIAIRE DU GROUPE » avec notes éditoriales sur ordinateur.
- Panneau guitare : visible dès 901 px, photographie verticale et accès « Les origines ».
- Collection : compteur dynamique, filtres Tout/T-shirts/Sweats, pagination adaptative.

## Carte produit

Affiche numéro/type éditorial, photo, nom, prix en ariary, couleur et tailles. États : repos, survol, focus clavier, rupture, taille indisponible. Une rupture reste consultable mais non ajoutable.

## Fiche produit

Utiliser le composant Dialog ou Sheet déjà présent. Afficher image, nom, prix, description, couleur, tailles et ajout. Gérer : aucune taille, taille sélectionnée, indisponible, ajout en cours, ajouté et erreur stock. À la fermeture, rendre le focus au déclencheur.

## Panier

Chaque ligne contient image, produit, variante, taille, quantité, prix et suppression. Gérer panier vide, chargement, erreur de synchronisation, stock modifié et revalidation avant commande.

## Notifications

Afficher un retour bref après ajout, retrait ou erreur. Ne jamais communiquer un état uniquement par la couleur.
