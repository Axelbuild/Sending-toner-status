-- AlterTable
ALTER TABLE "PrinterStatusSnapshot" ADD COLUMN     "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastSeenOnlineAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'UNKNOWN';
