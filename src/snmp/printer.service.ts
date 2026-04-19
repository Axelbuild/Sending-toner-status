import snmp from "net-snmp";
import { createSession } from "./client";
import { printerConfigs } from "../config/printers";
import { PrinterStatus, PrinterSNMPTarget } from "../types/printer";

type TonerColor = "black" | "cyan" | "magenta" | "yellow";

function getNumberValue(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string" && !isNaN(Number(value))) return Number(value);
  return undefined;
}

function calculatePercentage(current?: number, max?: number): number | undefined {
  if (current === undefined || max === undefined || max <= 0) return undefined;

  const percentage = Math.round((current / max) * 100);

  if (percentage < 0) return 0;
  if (percentage > 100) return 100;

  return percentage;
}

function snmpGet(session: snmp.Session, oid: string): Promise<number | undefined> {
  return new Promise((resolve) => {
    session.get([oid], (error, varbinds) => {
      if (error || !varbinds?.length) {
        return resolve(undefined);
      }

      const value = varbinds[0]?.value;
      resolve(getNumberValue(value));
    });
  });
}

export const getPrinterStatus = async (
  printer: PrinterSNMPTarget
): Promise<PrinterStatus> => {
  const { ip, brand, model } = printer;

  const brandConfig = printerConfigs[brand];
const modelConfig = brandConfig.models[model];

  if (!brandConfig || !modelConfig) {
    return {
      ip,
      online: false,
      ink: {},
    };
  }

  const session = createSession(ip);
  const ink: PrinterStatus["ink"] = {};

  try {
    const tonerEntries = Object.entries(modelConfig.toners) as [
      TonerColor,
      { index: number; max_oid: string; current_oid: string }
    ][];

    for (const [color, toner] of tonerEntries) {
      const maxOid = `${brandConfig.base_oid}${toner.max_oid}`;
      const currentOid = `${brandConfig.base_oid}${toner.current_oid}`;

      const [maxValue, currentValue] = await Promise.all([
        snmpGet(session, maxOid),
        snmpGet(session, currentOid),
      ]);

      ink[color] = calculatePercentage(currentValue, maxValue);
    }

    return {
      ip,
      online: true,
      ink,
    };
  } catch {
    return {
      ip,
      online: false,
      ink: {},
    };
  } finally {
    session.close();
  }
};

