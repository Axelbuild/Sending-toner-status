import { prisma } from "../database";
import { printerConfigs } from "../config/printers";
import { detectPrinterIdentity } from "../snmp/printer.identity.service";

export async function getPrinterCatalog() {
  const discovered = await prisma.discoveredPrinterModel.findMany({
    orderBy: [{ brand: "asc" }, { model: "asc" }],
  });
  const catalog: Record<string, Set<string>> = {};

  for (const [brand, config] of Object.entries(printerConfigs)) {
    catalog[brand] = new Set(Object.keys(config.models));
  }
  for (const item of discovered) {
    (catalog[item.brand] ??= new Set()).add(item.model);
  }

  return Object.fromEntries(
    Object.entries(catalog).map(([brand, models]) => [brand, [...models].sort()])
  );
}

export async function detectAndSavePrinterModel(ip: string) {
  const identity = await detectPrinterIdentity(ip);
  const alreadyBundled = Boolean(printerConfigs[identity.brand]?.models[identity.model]);
  const alreadyDiscovered = alreadyBundled ? null : await prisma.discoveredPrinterModel.findUnique({
    where: { brand_model: { brand: identity.brand, model: identity.model } },
  });

  if (!alreadyBundled) {
    await prisma.discoveredPrinterModel.upsert({
      where: { brand_model: { brand: identity.brand, model: identity.model } },
      create: { brand: identity.brand, model: identity.model, sysObjectId: identity.sysObjectId },
      update: { sysObjectId: identity.sysObjectId },
    });
  }

  return { ...identity, addedToCatalog: !alreadyBundled && !alreadyDiscovered };
}
