-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "onSale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "salePriceCents" INTEGER;
