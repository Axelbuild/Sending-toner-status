CREATE TABLE "DiscoveredPrinterModel" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "sysObjectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiscoveredPrinterModel_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DiscoveredPrinterModel_brand_model_key"
ON "DiscoveredPrinterModel"("brand", "model");
