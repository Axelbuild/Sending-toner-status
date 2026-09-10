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
  serialNumber?: string | null;
  brand: string;
  model: string;
  type: "mono" | "color";
  availableColors: string[];
  groupId: number;
  groupName?: string | null;
  online: boolean;
  status?: "ONLINE" | "SUSPECT" | "OFFLINE" | "UNKNOWN";
  consecutiveFailures?: number;
  lastSeenOnlineAt?: string | null;
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

export type PrinterCatalog = Record<"HP" | "Samsung", string[]>;

export type DetectedPrinter = {
  brand: "HP" | "Samsung";
  model: string;
  sysDescr: string;
  sysObjectId?: string;
  addedToCatalog: boolean;
};
