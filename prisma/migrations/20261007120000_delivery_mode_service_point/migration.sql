-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('HOME', 'SERVICE_POINT');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryMode" "DeliveryMode" NOT NULL DEFAULT 'HOME',
ADD COLUMN     "servicePointAddress" TEXT,
ADD COLUMN     "servicePointId" INTEGER,
ADD COLUMN     "servicePointName" TEXT,
ADD COLUMN     "servicePointPostNumber" TEXT,
ADD COLUMN     "shippingCarrier" TEXT,
ADD COLUMN     "shippingMethodId" INTEGER,
ADD COLUMN     "shippingMethodName" TEXT;
