import { AlertEmailParams } from "./mail.types";

export function buildLowToner10Email(params: AlertEmailParams) {
  const subject = `Alerta de toner baixo (10%) - ${params.printerName} - ${params.color}`;

  const text = `
Atenção: toner baixo detectado.

Impressora: ${params.printerName}
IP: ${params.ip}
Marca: ${params.brand}
Modelo: ${params.model}
Cor: ${params.color}
Nível atual: ${params.level}%
`;

  return { subject, text };
}

export function buildCriticalTonerEmail(params: AlertEmailParams) {
  const subject = `Alerta crítico de toner (2% ou menos) - ${params.printerName} - ${params.color}`;

  const text = `
Alerta crítico: toner em nível muito baixo.

Impressora: ${params.printerName}
IP: ${params.ip}
Marca: ${params.brand}
Modelo: ${params.model}
Cor: ${params.color}
Nível atual: ${params.level}%
`;

  return { subject, text };
}