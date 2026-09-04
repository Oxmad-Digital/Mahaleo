-- CreateTable
CREATE TABLE "ProductSize" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductSize_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductSize" ADD CONSTRAINT "ProductSize_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing size/stock data into ProductSize (one row per product)
INSERT INTO "ProductSize" ("id", "productId", "size", "stock")
SELECT md5(random()::text || clock_timestamp()::text || "id"), "id", COALESCE(NULLIF("size", ''), 'Unique'), "stock"
FROM "Product";

-- CreateIndex
CREATE UNIQUE INDEX "ProductSize_productId_size_key" ON "ProductSize"("productId", "size");

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "size",
DROP COLUMN "stock";
