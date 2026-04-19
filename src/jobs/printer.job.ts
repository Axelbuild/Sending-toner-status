import { getPrinterStatus } from "../snmp/printer.service";
import { prisma } from "../database";
import { processPrinterAlerts } from "../services/printer.alert.service";

export async function checkPrinters() {
  const printers = await prisma.printers.findMany();

  for (const printer of printers) {
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

      await prisma.printerStatusSnapshot.create({
        data: {
          printerId: printer.id,
          online: status.online,
          black: status.ink.black,
          cyan: status.ink.cyan,
          magenta: status.ink.magenta,
          yellow: status.ink.yellow,
        }
      });

      if (!status.online) continue;

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
      console.error(`Error checking printer ${printer.name} (${printer.ip})`, error);
    }
  }
}