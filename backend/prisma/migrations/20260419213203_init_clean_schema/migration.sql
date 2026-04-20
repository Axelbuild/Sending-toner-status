/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Group` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "PrinterStatusSnapshot" (
    "id" SERIAL NOT NULL,
    "printerId" INTEGER NOT NULL,
    "online" BOOLEAN NOT NULL,
    "black" INTEGER,
    "cyan" INTEGER,
    "magenta" INTEGER,
    "yellow" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrinterStatusSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrinterStatusSnapshot_printerId_key" ON "PrinterStatusSnapshot"("printerId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_name_key" ON "Group"("name");

-- AddForeignKey
ALTER TABLE "PrinterStatusSnapshot" ADD CONSTRAINT "PrinterStatusSnapshot_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
