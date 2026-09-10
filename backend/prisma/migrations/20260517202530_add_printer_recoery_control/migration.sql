-- AlterTable
ALTER TABLE "Printers" ADD COLUMN     "lastRecoveryAttemptAt" TIMESTAMP(3),
ADD COLUMN     "recoveryAttempts" INTEGER NOT NULL DEFAULT 0;
