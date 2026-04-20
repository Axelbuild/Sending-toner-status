import { useState } from "react";
import { createGroup } from "../services/api";

type Props = {
  onCreated: () => void;
};

export function GroupForm({ onCreated }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      await createGroup({ name });
      setName("");
      setMessage("Grupo criado com sucesso.");
      onCreated();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao criar grupo.");
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
      <h3 style={{ margin: 0 }}>Criar grupo</h3>

      <input
        type="text"
        placeholder="Nome do grupo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid #334155",
          background: "#0f172a",
          color: "#fff",
        }}
      />

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "10px 14px",
          borderRadius: 12,
          border: "none",
          background: "#2563eb",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        {loading ? "Criando..." : "Criar grupo"}
      </button>

      {message ? (
        <span style={{ color: "#cbd5e1", fontSize: 14 }}>{message}</span>
      ) : null}
    </form>
  );
}