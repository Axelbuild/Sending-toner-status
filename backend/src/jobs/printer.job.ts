import { getPrinterStatus } from "../snmp/printer.service";
import { prisma } from "../database";
import { processPrinterAlerts } from "../services/printer.alert.service";

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}

export async function checkPrinters() {
  const printers = await prisma.printers.findMany();

  const batches = chunkArray(printers, 5);

  for (const batch of batches) {
    await Promise.all(
      batch.map(async (printer) => {
        try {
          const status = await getPrinterStatus({
            ip: printer.ip,
            brand: printer.brand as "HP" | "Samsung",
            model: printer.model,
          });

          console.log("Printer status:", {
            name: printer.name,
            ip: printer.ip,
            brand: printer.brand,
            model: printer.model,
            status,
          });

          await prisma.printerStatusSnapshot.upsert({
            where: {
              printerId: printer.id,
            },
            update: {
              online: status.online,
              black: status.ink.black,
              cyan: status.ink.cyan,
              magenta: status.ink.magenta,
              yellow: status.ink.yellow,
            },
            create: {
              printerId: printer.id,
              online: status.online,
              black: status.ink.black,
              cyan: status.ink.cyan,
              magenta: status.ink.magenta,
              yellow: status.ink.yellow,
            },
          });

          if (!status.online) return;

          await processPrinterAlerts(
            {
              id: printer.id,
              name: printer.name,
              ip: printer.ip,
              brand: printer.brand,
              model: printer.model,
            },
            status.ink
          );
        } catch (error) {
          console.error(
            `Error checking printer ${printer.name} (${printer.ip})`,
            error
          );

          await prisma.printerStatusSnapshot.upsert({
            where: {
              printerId: printer.id,
            },
            update: {
              online: false,
              black: null,
              cyan: null,
              magenta: null,
              yellow: null,
            },
            create: {
              printerId: printer.id,
              online: false,
              black: null,
              cyan: null,
              magenta: null,
              yellow: null,
            },
          });
        }
      })
    );
  }
}