-- CreateTable
CREATE TABLE "PrinterIpHistory" (
    "id" SERIAL NOT NULL,
    "printerId" INTEGER NOT NULL,
    "oldIp" TEXT NOT NULL,
    "newIp" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrinterIpHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PrinterIpHistory" ADD CONSTRAINT "PrinterIpHistory_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
