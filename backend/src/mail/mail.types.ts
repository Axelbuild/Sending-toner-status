export type AlertEmailParams = {
  printerName: string;
  ip: string;
  brand: string;
  model: string;
  color: string;
  level: number;
};

export type SendMailParams = {
  subject: string;
  text: string;
};