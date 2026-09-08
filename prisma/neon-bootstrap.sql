-- Bootstrap de la base Neon pour Mahaleo.
-- Genere le 2026-09-07 a partir des 11 migrations de prisma/migrations.
-- A coller dans Neon > SQL Editor (branche production, base neondb).
-- Equivalent de `prisma migrate deploy`, mais en HTTPS au lieu du port 5432.

BEGIN;

-- Registre des migrations Prisma (normalement cree par le CLI).
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                    VARCHAR(36)  PRIMARY KEY NOT NULL,
    "checksum"              VARCHAR(64)  NOT NULL,
    "finished_at"           TIMESTAMPTZ,
    "migration_name"        VARCHAR(255) NOT NULL,
    "logs"                  TEXT,
    "rolled_back_at"        TIMESTAMPTZ,
    "started_at"            TIMESTAMPTZ  NOT NULL DEFAULT now(),
    "applied_steps_count"   INTEGER      NOT NULL DEFAULT 0
);

-- ========================================================================
-- 20260904080649_init
-- ========================================================================

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "images" TEXT[],
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_userId_productId_key" ON "CartItem"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_productId_key" ON "Favorite"("userId", "productId");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ========================================================================
-- 20260904092806_add_user_role
-- ========================================================================

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- ========================================================================
-- 20260904121305_add_user_status
-- ========================================================================

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- ========================================================================
-- 20260904142134_add_product_size
-- ========================================================================

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "size" TEXT;

-- ========================================================================
-- 20260904144148_add_product_sizes
-- ========================================================================

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

-- ========================================================================
-- 20260904153013_add_product_sale
-- ========================================================================

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "onSale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "salePriceCents" INTEGER;

-- ========================================================================
-- 20260904154239_add_page_view
-- ========================================================================

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT NOT NULL DEFAULT '',
    "deviceType" TEXT NOT NULL DEFAULT 'desktop',
    "country" TEXT NOT NULL DEFAULT '',
    "duration" INTEGER,
    "visitorHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_day_idx" ON "PageView"("day");

-- CreateIndex
CREATE INDEX "PageView_day_path_idx" ON "PageView"("day", "path");

-- ========================================================================
-- 20260904160420_add_password_reset_token
-- ========================================================================

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ========================================================================
-- 20260905000000_add_guest_checkout_to_order
-- ========================================================================

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerEmail" TEXT NOT NULL,
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "shippingAddress" TEXT NOT NULL,
ADD COLUMN     "shippingCity" TEXT NOT NULL,
ADD COLUMN     "shippingCountry" TEXT NOT NULL DEFAULT 'FR',
ADD COLUMN     "shippingPostalCode" TEXT NOT NULL,
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "stripeSessionId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ========================================================================
-- 20260905163606_add_site_settings
-- ========================================================================

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- ========================================================================
-- 20260906202258_add_shipment_invoice_extra_payment
-- ========================================================================

-- CreateEnum
CREATE TYPE "ExtraPaymentStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'PREPARING';

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "parcelId" TEXT,
    "trackingNumber" TEXT,
    "trackingUrl" TEXT,
    "carrier" TEXT,
    "methodId" INTEGER,
    "methodName" TEXT,
    "weightGrams" INTEGER NOT NULL,
    "labelPrinted" BOOLEAN NOT NULL DEFAULT false,
    "statusId" INTEGER,
    "statusMessage" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "sequence" INTEGER NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtraPayment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" "ExtraPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "stripeSessionId" TEXT,
    "checkoutUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExtraPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_orderId_key" ON "Shipment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_orderId_key" ON "Invoice"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_number_key" ON "Invoice"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_year_sequence_key" ON "Invoice"("year", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "ExtraPayment_stripeSessionId_key" ON "ExtraPayment"("stripeSessionId");

-- CreateIndex
CREATE INDEX "ExtraPayment_orderId_idx" ON "ExtraPayment"("orderId");

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraPayment" ADD CONSTRAINT "ExtraPayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ========================================================================
-- Marque les 11 migrations comme appliquees.
-- ========================================================================

INSERT INTO "_prisma_migrations"
  ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
VALUES
  ('69de2007-9cc5-4c43-a51d-a79c58d2aee6', 'b5f792f84301520547c18534fb8cfef194a6a33964d6b90d8857509dbc56af9f', now(), '20260904080649_init', NULL, NULL, now(), 1),
  ('e164f2f9-b2d1-4cac-8b04-0ff7b969e88e', '802f29aaa4a40f58f02b8d7e7ff51f0d3d200901059efe04cd425787d26c0598', now(), '20260904092806_add_user_role', NULL, NULL, now(), 1),
  ('f1664705-dd11-42cf-8705-3d2650619799', '26732023a86275e9caa4d183e0d72ad510eadece50acdedd3fccef1ab4b01b0d', now(), '20260904121305_add_user_status', NULL, NULL, now(), 1),
  ('b7b87386-829d-4fa3-98ca-9288e7dd35f2', 'a846da572943f78a081e2586f8414d21c52c072eba15f436e0fd6b224946728b', now(), '20260904142134_add_product_size', NULL, NULL, now(), 1),
  ('90e7cc72-9654-42a8-a4b3-ea16c5e52083', 'c9a0fc737ebffc0f9d2d5755792c201bb8a503972c049067c5236cd7593f993b', now(), '20260904144148_add_product_sizes', NULL, NULL, now(), 1),
  ('0fb39c6d-b736-4295-9165-84849673a443', '92bfe7c57a6ed49b59ec111b8e98b3e1eb2e9874aa84cb0bde412fb421aec167', now(), '20260904153013_add_product_sale', NULL, NULL, now(), 1),
  ('9df1f767-78a3-4f5e-8a7b-d693c8e9b967', '406dc77c6bdeec6c2d0347c48e4a9b7ddbadf2e7aa50992f2841a73a3d11d684', now(), '20260904154239_add_page_view', NULL, NULL, now(), 1),
  ('650e762e-0c62-4144-a519-dcf6c0b01be6', '66987d210de64fc0318d1d9aa076eda40788cfefe9b0ddce51211c70789aac42', now(), '20260904160420_add_password_reset_token', NULL, NULL, now(), 1),
  ('24d318e3-248e-4de5-bc4d-13e6861d49cc', '8ee79ba9085859284300e9d20a59d0e0d88befd914919f2545ba8e101bf8db37', now(), '20260905000000_add_guest_checkout_to_order', NULL, NULL, now(), 1),
  ('8aeba798-4a84-4972-b824-da8dc4b434c5', '15857deada812dec55b095a23e2fb9ac4222e690c74a9b717a1dafefe5d303e9', now(), '20260905163606_add_site_settings', NULL, NULL, now(), 1),
  ('11973e7a-b792-444a-b25a-69f44075260b', '8fdcb3eb4cde7594a863c4e49b15ae791e96cfb7e219fd93997db3207ecd0745', now(), '20260906202258_add_shipment_invoice_extra_payment', NULL, NULL, now(), 1);

COMMIT;
