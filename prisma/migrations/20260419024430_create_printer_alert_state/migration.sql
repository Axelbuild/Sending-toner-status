-- CreateTable
CREATE TABLE "PrinterAlertState" (
    "id" SERIAL NOT NULL,
    "printerId" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "warnedAt10" BOOLEAN NOT NULL DEFAULT false,
    "lastCriticalLevel" INTEGER,
    "currentLevel" INTEGER,
    "lastNotifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrinterAlertState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrinterAlertState_printerId_color_key" ON "PrinterAlertState"("printerId", "color");

-- AddForeignKey
ALTER TABLE "PrinterAlertState" ADD CONSTRAINT "PrinterAlertState_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
