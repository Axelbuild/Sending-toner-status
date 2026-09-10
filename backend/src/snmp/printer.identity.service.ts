import snmp from "net-snmp";
import { createSession } from "./client";
import { PrinterIdentity } from "../types/printer";

function snmpGetString(
  session: snmp.Session,
  oid: string
): Promise<string | undefined> {
  return new Promise((resolve) => {
    session.get([oid], (error, varbinds) => {
      if (error || !varbinds?.length) {
        return resolve(undefined);
      }

      const value = varbinds[0]?.value;

      if (typeof value === "string") {
        return resolve(value.trim());
      }

      if (Buffer.isBuffer(value)) {
        return resolve(value.toString().trim());
      }

      if (value !== undefined && value !== null) {
        return resolve(String(value).trim());
      }

      return resolve(undefined);
    });
  });
}

export async function getPrinterSerialNumber(
  ip: string
): Promise<string | undefined> {
  const session = createSession(ip);

  try {
    const candidateOids = [
      "1.3.6.1.2.1.43.5.1.1.17.1", // Printer-MIB serial
      "1.3.6.1.2.1.1.5.0",         // sysName
      "1.3.6.1.2.1.1.1.0",         // sysDescr
    ];

    for (const oid of candidateOids) {
      const value = await snmpGetString(session, oid);

      if (value && value.length > 2) {
        return value;
      }
    }

    return undefined;
  } catch {
    return undefined;
  } finally {
    session.close();
  }
}

const IDENTITY_OIDS = {
  sysDescr: "1.3.6.1.2.1.1.1.0",
  sysObjectId: "1.3.6.1.2.1.1.2.0",
  printerName: "1.3.6.1.2.1.43.5.1.1.16.1",
};

function cleanIdentity(value: string) {
  return value.replace(/[\u0000\r\n]+/g, " ").replace(/\s+/g, " ").trim();
}

function identifyBrand(text: string): "HP" | "Samsung" | undefined {
  if (/\b(samsung|sec)\b/i.test(text)) return "Samsung";
  if (/\b(hp|hewlett[ -]packard)\b/i.test(text)) return "HP";
  return undefined;
}

function identifyModel(text: string, brand: "HP" | "Samsung") {
  const normalized = cleanIdentity(text);
  const candidates = normalized.toUpperCase().match(/[A-Z]{0,4}-?[A-Z]{0,3}\d{3,6}[A-Z0-9-]*/g) ?? [];
  const ignored = new Set(["SNMPV1", "SNMPV2", "IPV4", "IPV6"]);
  const candidate = candidates.find((value) => !ignored.has(value));
  if (!candidate) return undefined;

  return `${brand} ${candidate.replace(/^(?:SL|SCX)-/, "")}`;
}

export async function detectPrinterIdentity(ip: string): Promise<PrinterIdentity> {
  const session = createSession(ip);
  try {
    const [sysDescr, printerName, sysObjectId] = await Promise.all([
      snmpGetString(session, IDENTITY_OIDS.sysDescr),
      snmpGetString(session, IDENTITY_OIDS.printerName),
      snmpGetString(session, IDENTITY_OIDS.sysObjectId),
    ]);
    const source = cleanIdentity([printerName, sysDescr].filter(Boolean).join(" "));
    if (!source) throw new Error("A impressora não respondeu à consulta SNMP.");

    const brand = identifyBrand(source);
    if (!brand) throw new Error(`Fabricante não reconhecido. Resposta SNMP: ${source}`);
    const model = identifyModel(source, brand);
    if (!model) throw new Error(`Modelo ${brand} não reconhecido. Resposta SNMP: ${source}`);

    return { brand, model, sysDescr: cleanIdentity(sysDescr ?? source), sysObjectId };
  } finally {
    session.close();
  }
}
