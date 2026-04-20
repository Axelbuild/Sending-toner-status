import { FastifyRequest, FastifyReply } from "fastify";
import { PrinterService } from "../services/printer.service";
import { PrinterInput } from "../types/printer";
import { getPrinterStatus } from "../snmp/printer.service";
import { printerConfigs } from "../config/printers";
import { prisma } from "../database";


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

export async function getPrinterStatusController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const printers = await prisma.printers.findMany();

    const result = await Promise.all(
      printers.map(async (printer) => {
        try {
          const status = await getPrinterStatus({
            ip: printer.ip,
            brand: printer.brand as "HP" | "Samsung",
            model: printer.model,
          });

          return {
            id: printer.id,
            name: printer.name,
            ip: printer.ip,
            groupId: printer.groupId,
            online: status.online,
            ink: status.ink,
          };
        } catch (error) {
          console.error(`Erro ao buscar status da impressora ${printer.name}`, error);

          return {
            id: printer.id,
            name: printer.name,
            ip: printer.ip,
            groupId: printer.groupId,
            online: false,
            ink: {},
          };
        }
      })
    );

    return reply.send(result);
  } catch (error) {
    console.error("Erro em /printer/status:", error);
    return reply.status(500).send({ message: "Erro ao carregar status das impressoras" });
  }
}

export async function getLastPrinterStatusController(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const printers = await prisma.printers.findMany({
      include: {
        group: true,
        snapshots: true,
      },
    });

    const result = printers.map((printer) => {
      const snapshot = printer.snapshots[0];

      const brandConfig = printerConfigs[printer.brand as "HP" | "Samsung"];
      const modelConfig = brandConfig?.models?.[printer.model];

      const availableColors = modelConfig
        ? Object.keys(modelConfig.toners)
        : ["black"];

      return {
        id: printer.id,
        name: printer.name,
        ip: printer.ip,
        brand: printer.brand,
        model: printer.model,
        type: modelConfig?.type ?? "mono",
        availableColors,
        groupId: printer.groupId,
        groupName: printer.group?.name ?? null,
        online: snapshot?.online ?? false,
        ink: {
          black: snapshot?.black ?? undefined,
          cyan: snapshot?.cyan ?? undefined,
          magenta: snapshot?.magenta ?? undefined,
          yellow: snapshot?.yellow ?? undefined,
        },
      };
    });

    return reply.send(result);
  } catch (error) {
    console.error("Error loading last printer status:", error);
    return reply.status(500).send({
      message: "Error loading last printer status",
    });
  }
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