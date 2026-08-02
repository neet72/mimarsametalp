-- AlterTable
ALTER TABLE "ClientUser" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);
