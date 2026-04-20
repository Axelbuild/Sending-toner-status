import { useEffect, useMemo, useState } from "react";
import {
  fetchGroups,
  fetchPrinterStatus,
  updateGroup,
  deleteGroup,
  updatePrinter,
  deletePrinter,
} from "./services/api";
import type { Group } from "./types/group";
import type { PrinterStatus } from "./types/printer";
import { GroupForm } from "./components/GroupForm";
import { PrinterForm } from "./components/PrinterForm";
import { PrinterCard } from "./components/PrinterCard";
import { TopNav } from "./components/TopNav";

type Tab = "dashboard" | "groups" | "printers";

const brandModels = {
  HP: ["HP E57540DN", "HP PRO4103FDW", "HP M428FDW", "HP M432FDN"],
  Samsung: ["Samsung M4070FR", "Samsung M4020", "Samsung M4080FX"],
} as const;

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [printers, setPrinters] = useState<PrinterStatus[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editingGroupName, setEditingGroupName] = useState("");

  const [editingPrinterId, setEditingPrinterId] = useState<number | null>(null);
  const [editingPrinterName, setEditingPrinterName] = useState("");
  const [editingPrinterIp, setEditingPrinterIp] = useState("");
  const [editingPrinterGroupId, setEditingPrinterGroupId] = useState<number | "">("");
  const [editingPrinterBrand, setEditingPrinterBrand] = useState<"HP" | "Samsung">("HP");
  const [editingPrinterModel, setEditingPrinterModel] = useState<string>("HP E57540DN");

  async function loadData(showLoading = true) {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const [printerData, groupData] = await Promise.all([
        fetchPrinterStatus(),
        fetchGroups(),
      ]);

      setPrinters(printerData);
      setGroups(groupData);
      setLastUpdated(new Date().toLocaleTimeString("pt-BR"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData(false);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const filteredPrinters = useMemo(() => {
    const term = query.toLowerCase().trim();

    return printers.filter((printer) => {
      const matchesQuery =
        !term ||
        printer.name.toLowerCase().includes(term) ||
        printer.ip.toLowerCase().includes(term);

      const matchesGroup =
        groupFilter === "all" || String(printer.groupId) === groupFilter;

      return matchesQuery && matchesGroup;
    });
  }, [printers, query, groupFilter]);

  const total = printers.length;
  const online = printers.filter((p) => p.online).length;
  const offline = total - online;
  const warning = printers.filter((p) =>
    Object.values(p.ink).some((v) => typeof v === "number" && v > 2 && v <= 10)
  ).length;
  const critical = printers.filter((p) =>
    Object.values(p.ink).some((v) => typeof v === "number" && v <= 2)
  ).length;

  function startEditGroup(group: Group) {
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
  }

  async function handleUpdateGroup() {
    if (!editingGroupId) return;

    try {
      await updateGroup(editingGroupId, { name: editingGroupName });
      setEditingGroupId(null);
      setEditingGroupName("");
      await loadData(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao atualizar grupo.");
    }
  }

  async function handleDeleteGroup(id: number) {
    const confirmed = window.confirm("Deseja excluir este grupo?");
    if (!confirmed) return;

    try {
      await deleteGroup(id);
      await loadData(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir grupo.");
    }
  }

  function startEditPrinter(printer: PrinterStatus) {
    setEditingPrinterId(printer.id);
    setEditingPrinterName(printer.name);
    setEditingPrinterIp(printer.ip);
    setEditingPrinterGroupId(printer.groupId);
    setEditingPrinterBrand(printer.brand as "HP" | "Samsung");
    setEditingPrinterModel(printer.model);
  }

  async function handleUpdatePrinter() {
    if (!editingPrinterId || editingPrinterGroupId === "") return;

    try {
      await updatePrinter(editingPrinterId, {
        name: editingPrinterName,
        ip: editingPrinterIp,
        groupId: Number(editingPrinterGroupId),
        brand: editingPrinterBrand,
        model: editingPrinterModel,
      });

      setEditingPrinterId(null);
      setEditingPrinterName("");
      setEditingPrinterIp("");
      setEditingPrinterGroupId("");
      await loadData(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao atualizar impressora.");
    }
  }

  async function handleDeletePrinter(id: number) {
    const confirmed = window.confirm("Deseja excluir esta impressora?");
    if (!confirmed) return;

    try {
      await deletePrinter(id);
      await loadData(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir impressora.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        padding: 24,
        fontFamily: "Arial, sans-serif",
        color: "#e2e8f0",
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gap: 24 }}>
        <div>
          <h1 style={{ margin: 0, color: "#f8fafc" }}>Monitoramento de Impressoras</h1>
          <p style={{ marginTop: 8, color: "#94a3b8" }}>
            Dashboard de status e níveis de toner
          </p>
        </div>

        <TopNav current={tab} onChange={setTab} />

        {tab === "dashboard" && (
          <>
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="Buscar por nome ou IP"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={inputStyle}
                />

                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  style={inputStyle}
                >
                  <option value="all">Todos os grupos</option>
                  {groups.map((group) => (
                    <option key={group.id} value={String(group.id)}>
                      {group.name}
                    </option>
                  ))}
                </select>

                <button onClick={() => loadData()} style={buttonStyle}>
                  Atualizar agora
                </button>
              </div>

              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "#1e293b",
                  border: "1px solid #334155",
                  color: "#94a3b8",
                  fontSize: 14,
                }}
              >
                Última atualização:{" "}
                <span style={{ color: "#f8fafc", fontWeight: 600 }}>
                  {lastUpdated ?? "--:--:--"}
                </span>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 16,
              }}
            >
              <SummaryCard title="Total" value={total} />
              <SummaryCard title="Online" value={online} />
              <SummaryCard title="Alerta 10%" value={warning} />
              <SummaryCard title="Crítico 2%" value={critical} />
              <SummaryCard title="Offline" value={offline} />
            </div>

            {loading && <div style={{ color: "#cbd5e1" }}>Carregando...</div>}
            {error && <div style={{ color: "#f87171" }}>{error}</div>}

            <div style={scrollWrapperStyle}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: 16,
                }}
              >
                {filteredPrinters.map((printer) => (
                  <PrinterCard key={printer.id} printer={printer} />
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "groups" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "420px 1fr",
              gap: 16,
              alignItems: "start",
            }}
          >
            <GroupForm onCreated={() => loadData()} />

            <div
              style={{
                background: "#1e293b",
                borderRadius: 16,
                padding: 16,
                border: "1px solid #334155",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 16 }}>Grupos cadastrados</h3>

              <div style={scrollListStyle}>
                {groups.map((group) => (
                  <div
                    key={group.id}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "#0f172a",
                      border: "1px solid #334155",
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    {editingGroupId === group.id ? (
                      <>
                        <input
                          value={editingGroupName}
                          onChange={(e) => setEditingGroupName(e.target.value)}
                          style={inputStyle}
                        />
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={handleUpdateGroup} style={buttonStyle}>
                            Salvar
                          </button>
                          <button
                            onClick={() => {
                              setEditingGroupId(null);
                              setEditingGroupName("");
                            }}
                            style={secondaryButtonStyle}
                          >
                            Cancelar
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>#{group.id} - {group.name}</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => startEditGroup(group)} style={buttonStyle}>
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            style={dangerButtonStyle}
                          >
                            Excluir
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "printers" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "480px 1fr",
              gap: 16,
              alignItems: "start",
            }}
          >
            <PrinterForm groups={groups} onCreated={() => loadData()} />

            <div
              style={{
                background: "#1e293b",
                borderRadius: 16,
                padding: 16,
                border: "1px solid #334155",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 16 }}>Impressoras cadastradas</h3>

              <div style={scrollListStyle}>
                {printers.map((printer) => (
                  <div
                    key={printer.id}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "#0f172a",
                      border: "1px solid #334155",
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    {editingPrinterId === printer.id ? (
                      <>
                        <input
                          value={editingPrinterName}
                          onChange={(e) => setEditingPrinterName(e.target.value)}
                          style={inputStyle}
                          placeholder="Nome"
                        />
                        <input
                          value={editingPrinterIp}
                          onChange={(e) => setEditingPrinterIp(e.target.value)}
                          style={inputStyle}
                          placeholder="IP"
                        />
                        <select
                          value={editingPrinterGroupId}
                          onChange={(e) =>
                            setEditingPrinterGroupId(
                              e.target.value ? Number(e.target.value) : ""
                            )
                          }
                          style={inputStyle}
                        >
                          <option value="">Selecione um grupo</option>
                          {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.name}
                            </option>
                          ))}
                        </select>

                        <select
                          value={editingPrinterBrand}
                          onChange={(e) => {
                            const value = e.target.value as "HP" | "Samsung";
                            setEditingPrinterBrand(value);
                            setEditingPrinterModel(brandModels[value][0]);
                          }}
                          style={inputStyle}
                        >
                          <option value="HP">HP</option>
                          <option value="Samsung">Samsung</option>
                        </select>

                        <select
                          value={editingPrinterModel}
                          onChange={(e) => setEditingPrinterModel(e.target.value)}
                          style={inputStyle}
                        >
                          {brandModels[editingPrinterBrand].map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>

                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={handleUpdatePrinter} style={buttonStyle}>
                            Salvar
                          </button>
                          <button
                            onClick={() => {
                              setEditingPrinterId(null);
                              setEditingPrinterName("");
                              setEditingPrinterIp("");
                              setEditingPrinterGroupId("");
                            }}
                            style={secondaryButtonStyle}
                          >
                            Cancelar
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontWeight: 700 }}>{printer.name}</div>
                        <div style={{ color: "#94a3b8" }}>{printer.ip}</div>
                        <div style={{ color: "#64748b", fontSize: 14 }}>
                          {printer.brand} • {printer.model} • {printer.groupName ?? "Sem grupo"}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => startEditPrinter(printer)}
                            style={buttonStyle}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeletePrinter(printer.id)}
                            style={dangerButtonStyle}
                          >
                            Excluir
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <div
      style={{
        background: "#1e293b",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
        border: "1px solid #334155",
      }}
    >
      <div style={{ color: "#94a3b8", fontSize: 14 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8, color: "#f8fafc" }}>
        {value}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #334155",
  background: "#1e293b",
  color: "#fff",
  minWidth: 220,
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #334155",
  background: "#334155",
  color: "#fff",
  cursor: "pointer",
};

const dangerButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "none",
  background: "#dc2626",
  color: "#fff",
  cursor: "pointer",
};

const scrollWrapperStyle: React.CSSProperties = {
  maxHeight: "560px",
  overflowY: "auto",
  paddingRight: 8,
  borderRadius: 16,
};

const scrollListStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  maxHeight: "560px",
  overflowY: "auto",
  paddingRight: 8,
};