import { FastifyRequest, FastifyReply } from "fastify";
import { PrinterService } from "../services/printer.service";
import { PrinterInput } from "../types/printer";
import { prisma } from "../database";
import { getPrinterStatus } from "../snmp/printer.service";

const service = new PrinterService();

export async function getPrinterController(req: FastifyRequest, reply: FastifyReply) {
    const data = await service.findAll();
    return reply.send(data);
}

export async function postCreatePrinterController(req: FastifyRequest<{ Body: PrinterInput }>, reply: FastifyReply) {
    try {
        await service.create(req.body);
        return reply.status(201).send({ message: "created" });
    } catch (err: any) {
        return reply.status(400).send({ message: err.message });
    }
}

export async function getPrinterByIdController(req: any, reply: FastifyReply) {
    const data = await service.findById(Number(req.params.id));

    if (!data) {
        return reply.status(404).send({ message: "Not found" });
    }

    return reply.send(data);
}

export async function getPrinterStatusController(req: FastifyRequest, reply: FastifyReply) {
  const printers = await prisma.printers.findMany();

  const result = await Promise.all(
    printers.map(async (printer) => {
      const status = await getPrinterStatus({
        ip: printer.ip,
        brand: printer.brand as "HP" | "Samsung",
        model: printer.model,
      });

      return {
        name: printer.name,
        ip: printer.ip,
        online: status.online,
        ink: status.ink,
      };
    })
  );

  return reply.send(result);
}

export async function updatePrinterController(req: any, reply: FastifyReply) {
    try {
        const data = await service.update(Number(req.params.id), req.body);
        return reply.send(data);
    } catch {
        return reply.status(404).send({ message: "Error updating" });
    }
}

export async function deletePrinterController(req: any, reply: FastifyReply) {
    try {
        await service.delete(Number(req.params.id));
        return reply.send({ message: "Deleted" });
    } catch {
        return reply.status(404).send({ message: "Not found" });
    }
}