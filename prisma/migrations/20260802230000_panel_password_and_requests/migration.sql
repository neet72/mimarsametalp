-- AlterTable
ALTER TABLE "ClientUser" ADD COLUMN IF NOT EXISTS "adminVisiblePassword" TEXT;
ALTER TABLE "ClientUser" ALTER COLUMN "mustChangePassword" SET DEFAULT false;

-- AlterTable ClientDeliveryRequest: subject + optional address
ALTER TABLE "ClientDeliveryRequest" ADD COLUMN IF NOT EXISTS "subject" TEXT NOT NULL DEFAULT 'İstek';
ALTER TABLE "ClientDeliveryRequest" ALTER COLUMN "address" DROP NOT NULL;
