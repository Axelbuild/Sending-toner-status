import { useState } from "react";
import { createPrinter } from "../services/api";
import type { Group } from "../types/group";

type Props = {
  groups: Group[];
  onCreated: () => void;
};

const brandModels = {
  HP: ["HP E57540DN", "HP PRO4103FDW", "HP M428FDW", "HP M432FDN"],
  Samsung: ["Samsung M4070FR", "Samsung M4020", "Samsung M4080FX"],
} as const;

export function PrinterForm({ groups, onCreated }: Props) {
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [groupId, setGroupId] = useState<number | "">("");
  const [brand, setBrand] = useState<"HP" | "Samsung">("HP");
  const [model, setModel] = useState<string>("HP E57540DN");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleBrandChange(value: "HP" | "Samsung") {
    setBrand(value);
    setModel(brandModels[value][0]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (groupId === "") {
      setMessage("Selecione um grupo.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await createPrinter({
        name,
        ip,
        groupId: Number(groupId),
        brand,
        model,
      });

      setName("");
      setIp("");
      setGroupId("");
      setBrand("HP");
      setModel("HP E57540DN");
      setMessage("Impressora criada com sucesso.");
      onCreated();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao criar impressora.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "grid",
        gap: 12,
        background: "#1e293b",
        padding: 16,
        borderRadius: 16,
        border: "1px solid #334155",
      }}
    >
      <h3 style={{ margin: 0 }}>Criar impressora</h3>

      <input
        type="text"
        placeholder="Nome da impressora"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
      />

      <input
        type="text"
        placeholder="IP da impressora"
        value={ip}
        onChange={(e) => setIp(e.target.value)}
        style={inputStyle}
      />

      <select
        value={groupId}
        onChange={(e) => setGroupId(e.target.value ? Number(e.target.value) : "")}
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
        value={brand}
        onChange={(e) => handleBrandChange(e.target.value as "HP" | "Samsung")}
        style={inputStyle}
      >
        <option value="HP">HP</option>
        <option value="Samsung">Samsung</option>
      </select>

      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        style={inputStyle}
      >
        {brandModels[brand].map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <button type="submit" disabled={loading} style={buttonStyle}>
        {loading ? "Criando..." : "Criar impressora"}
      </button>

      {message ? (
        <span style={{ color: "#cbd5e1", fontSize: 14 }}>{message}</span>
      ) : null}
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#fff",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
};