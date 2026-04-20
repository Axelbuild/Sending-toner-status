import { prisma } from "../database";
import { PrinterModel } from "../models/printer.models";
import { isValidNumber, isValidBrand } from "../utils/validators";
import { isValidIP } from "../utils/ip";
import { PrinterInput } from "../types/printer";
import { getPrinterSerialNumber } from "../snmp/printer.identity.service";

export class PrinterService {
  async create(data: PrinterInput) {
    const { name, ip, serialNumber, groupId, brand, model } = data;

    if (!name) {
      throw new Error("name is required");
    }

    if (!isValidNumber(groupId)) {
      throw new Error("groupId must be a valid number");
    }

    if (!isValidIP(ip)) {
      throw new Error("Invalid IP");
    }

    if (!isValidBrand(brand)) {
      throw new Error("Invalid brand");
    }

    if (!model) {
      throw new Error("model is required");
    }

    const detectedSerial = serialNumber || (await getPrinterSerialNumber(ip));

    const printer = new PrinterModel(
      name,
      ip,
      detectedSerial,
      Number(groupId),
      brand,
      model,
      new Date()
    );

    return prisma.printers.create({
      data: {
        name: printer.name,
        ip: printer.ip,
        serialNumber: printer.serialNumber,
        groupId: printer.groupId,
        brand: printer.brand,
        model: printer.model,
      },
    });
  }

  async findAll() {
    return prisma.printers.findMany({
      include: { group: true },
    });
  }

  async findById(id: number) {
    return prisma.printers.findUnique({
      where: { id },
      include: { group: true },
    });
  }

  async update(id: number, data: Partial<PrinterInput>) {
    if (data.ip && !isValidIP(data.ip)) {
      throw new Error("Invalid IP");
    }

    if (data.groupId !== undefined && !isValidNumber(data.groupId)) {
      throw new Error("groupId must be a valid number");
    }

    if (data.brand && !isValidBrand(data.brand)) {
      throw new Error("Invalid brand");
    }

    return prisma.printers.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return prisma.printers.delete({
      where: { id },
    });
  }
}