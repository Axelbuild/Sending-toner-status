export type InkLevels = {
  black?: number;
  cyan?: number;
  magenta?: number;
  yellow?: number;
};

export type PrinterStatus = {
  id: number;
  name: string;
  ip: string;
  brand: string;
  model: string;
  type: "mono" | "color";
  availableColors: string[];
  groupId: number;
  groupName?: string | null;
  online: boolean;
  ink: InkLevels;
};

export type PrinterInput = {
  name: string;
  ip: string;
  serialNumber?: string;
  groupId: number;
  brand: "HP" | "Samsung";
  model: string;
};