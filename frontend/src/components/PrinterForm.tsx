import { useEffect, useState } from "react";
import { createPrinter, detectPrinter, fetchPrinterCatalog } from "../services/api";
import type { Group } from "../types/group";
import type { PrinterCatalog } from "../types/printer";

type Props = { groups: Group[]; onCreated: () => void };
type BrandChoice = "auto" | "HP" | "Samsung";
const emptyCatalog: PrinterCatalog = { HP: [], Samsung: [] };

export function PrinterForm({ groups, onCreated }: Props) {
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [groupId, setGroupId] = useState<number | "">("");
  const [brandChoice, setBrandChoice] = useState<BrandChoice>("auto");
  const [brand, setBrand] = useState<"HP" | "Samsung">("HP");
  const [model, setModel] = useState("");
  const [catalog, setCatalog] = useState<PrinterCatalog>(emptyCatalog);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);

  async function loadCatalog() {
    const data = await fetchPrinterCatalog();
    setCatalog(data);
    return data;
  }

  useEffect(() => {
    loadCatalog().catch((error) => setMessage(
      error instanceof Error ? error.message : "Erro ao carregar modelos."
    ));
  }, []);

  function handleBrandChange(value: BrandChoice) {
    setBrandChoice(value);
    setMessage("");
    if (value === "auto") return setModel("");
    setBrand(value);
    setModel(catalog[value][0] ?? "");
  }

  async function handleDetection() {
    if (!ip.trim()) return setMessage("Informe o IP antes de identificar.");
    try {
      setDetecting(true);
      setMessage("Consultando a impressora via SNMP...");
      const detected = await detectPrinter(ip.trim());
      const updatedCatalog = await loadCatalog();
      setCatalog(updatedCatalog);
      setBrand(detected.brand);
      setModel(detected.model);
      setMessage(`${detected.model} identificado${detected.addedToCatalog ? " e adicionado ao catálogo" : ""}.`);
    } catch (error) {
      setModel("");
      setMessage(error instanceof Error ? `${error.message} Selecione manualmente para continuar.` : "Falha na identificação.");
    } finally {
      setDetecting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (groupId === "") return setMessage("Selecione um grupo.");
    if (brandChoice === "auto" && !model) return setMessage("Identifique a impressora antes de criar.");
    if (!model) return setMessage("Selecione um modelo.");
    try {
      setLoading(true);
      setMessage("");
      await createPrinter({ name, ip, groupId: Number(groupId), brand, model });
      setName(""); setIp(""); setGroupId(""); setBrandChoice("auto"); setModel("");
      setMessage("Impressora criada com sucesso.");
      onCreated();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao criar impressora.");
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h3 style={{ margin: 0 }}>Criar impressora</h3>
      <input required placeholder="Nome da impressora" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
      <input required placeholder="IP da impressora" value={ip} onChange={(e) => { setIp(e.target.value); if (brandChoice === "auto") setModel(""); }} style={inputStyle} />
      <select required value={groupId} onChange={(e) => setGroupId(e.target.value ? Number(e.target.value) : "")} style={inputStyle}>
        <option value="">Selecione um grupo</option>
        {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
      </select>
      <select value={brandChoice} onChange={(e) => handleBrandChange(e.target.value as BrandChoice)} style={inputStyle}>
        <option value="auto">Identificar automaticamente</option>
        <option value="HP">HP</option>
        <option value="Samsung">Samsung</option>
      </select>
      {brandChoice === "auto" ? (
        <button type="button" onClick={handleDetection} disabled={detecting || loading} style={secondaryButtonStyle}>
          {detecting ? "Identificando..." : model ? `Identificado: ${model}` : "Identificar pelo IP"}
        </button>
      ) : (
        <select value={model} onChange={(e) => setModel(e.target.value)} style={inputStyle}>
          {catalog[brand].map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      )}
      <button type="submit" disabled={loading || detecting} style={buttonStyle}>{loading ? "Criando..." : "Criar impressora"}</button>
      {message ? <span role="status" style={{ color: "#cbd5e1", fontSize: 14 }}>{message}</span> : null}
    </form>
  );
}

const formStyle: React.CSSProperties = { display: "grid", gap: 12, background: "#1e293b", padding: 16, borderRadius: 16, border: "1px solid #334155" };
const inputStyle: React.CSSProperties = { padding: "10px 12px", borderRadius: 12, border: "1px solid #334155", background: "#0f172a", color: "#fff" };
const buttonStyle: React.CSSProperties = { padding: "10px 14px", borderRadius: 12, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" };
const secondaryButtonStyle: React.CSSProperties = { ...buttonStyle, background: "#334155", border: "1px solid #475569" };
