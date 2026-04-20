import type { PrinterStatus } from "../types/printer";

type Props = {
  printer: PrinterStatus;
};

function getLevelColor(value?: number) {
  if (value === undefined) return "#64748b";
  if (value <= 2) return "#dc2626";
  if (value <= 10) return "#f59e0b";
  return "#22c55e";
}

export function PrinterCard({ printer }: Props) {
  return (
    <div
      style={{
        background: "#1e293b",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        border: "1px solid #334155",
      }}
    >
      <div>
        <h3 style={{ margin: 0, color: "#f8fafc" }}>{printer.name}</h3>
        <p style={{ margin: "4px 0 0", color: "#94a3b8" }}>{printer.ip}</p>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
          Grupo: {printer.groupName ?? "Sem grupo"}
        </p>
      </div>

      <div
        style={{
          fontWeight: 600,
          color: printer.online ? "#22c55e" : "#ef4444",
        }}
      >
        {printer.online ? "Online" : "Offline"}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {printer.availableColors.map((color) => {
          const inkValue = printer.ink[color as keyof typeof printer.ink];

          return (
            <div
              key={color}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: 12,
                background: "#0f172a",
                borderLeft: `6px solid ${getLevelColor(inkValue)}`,
                color: "#e2e8f0",
              }}
            >
              <span style={{ textTransform: "capitalize" }}>{color}</span>
              <span>{inkValue ?? "--"}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}