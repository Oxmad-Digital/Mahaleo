-- Les produits existants restent publiés ; les nouveaux brouillons sont créés
-- explicitement avec isPublished = false depuis l'administration ou l'import.
ALTER TABLE "Product" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;
