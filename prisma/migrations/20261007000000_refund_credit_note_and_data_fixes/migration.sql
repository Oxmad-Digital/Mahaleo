-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "stripeRefundId" TEXT;

-- CreateTable
CREATE TABLE "CreditNote" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "sequence" INTEGER NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreditNote_orderId_key" ON "CreditNote"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditNote_number_key" ON "CreditNote"("number");

-- CreateIndex
CREATE UNIQUE INDEX "CreditNote_year_sequence_key" ON "CreditNote"("year", "sequence");

-- AddForeignKey
ALTER TABLE "CreditNote" ADD CONSTRAINT "CreditNote_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Data: le checkout enregistrait le pays en toutes lettres ("France") ; Sendcloud
-- et le reste de l'application attendent le code ISO à 2 lettres.
UPDATE "Order" SET "shippingCountry" = CASE lower(trim("shippingCountry"))
    WHEN 'france' THEN 'FR'
    WHEN 'belgique' THEN 'BE'
    WHEN 'luxembourg' THEN 'LU'
    WHEN 'monaco' THEN 'MC'
    WHEN 'suisse' THEN 'CH'
    WHEN 'allemagne' THEN 'DE'
    WHEN 'pays-bas' THEN 'NL'
    WHEN 'espagne' THEN 'ES'
    WHEN 'italie' THEN 'IT'
    WHEN 'portugal' THEN 'PT'
    WHEN 'autriche' THEN 'AT'
    WHEN 'irlande' THEN 'IE'
    WHEN 'royaume-uni' THEN 'GB'
    ELSE "shippingCountry"
  END
WHERE length(trim("shippingCountry")) <> 2;

UPDATE "Order" SET "shippingCountry" = upper(trim("shippingCountry"))
WHERE length(trim("shippingCountry")) = 2 AND "shippingCountry" <> upper(trim("shippingCountry"));

-- Data: les e-mails sont désormais enregistrés en minuscules. Une adresse
-- partagée, à la casse près, par plusieurs comptes est laissée telle quelle
-- (la connexion reste insensible à la casse) : ces doublons sont à fusionner à
-- la main.
UPDATE "User" u SET "email" = lower(u."email")
WHERE u."email" <> lower(u."email")
  AND (SELECT count(*) FROM "User" o WHERE lower(o."email") = lower(u."email")) = 1;
