import { useState } from "react";
import { runPrinterRecovery, cancelPrinterRecovery } from "../services/api";

type Props = {
  onFinished?: () => void;
};

export function PrinterRecoveryButton({ onFinished }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRunRecovery() {
    try {
      setLoading(true);
      setMessage("");

      const response = await runPrinterRecovery();

      setMessage(
        `Busca finalizada. Verificadas: ${response.result.checked}, encontradas: ${response.result.found}, atualizadas: ${response.result.updated}.`
      );

      onFinished?.();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Erro ao executar busca de impressoras."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelRecovery() {
    try {
      await cancelPrinterRecovery();
      setMessage("Cancelamento solicitado...");
    } catch {
      setMessage("Erro ao cancelar busca.");
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 8,
        background: "#1e293b",
        padding: 16,
        borderRadius: 16,
        border: "1px solid #334155",
      }}
    >
      <button
        type="button"
        onClick={handleRunRecovery}
        disabled={loading}
        style={{
          padding: "10px 14px",
          borderRadius: 12,
          border: "none",
          background: loading ? "#475569" : "#16a34a",
          color: "#fff",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 600,
        }}
      >
        {loading ? "Buscando impressoras..." : "Buscar impressoras perdidas"}
      </button>

      {loading && (
        <button
          type="button"
          onClick={handleCancelRecovery}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "none",
            background: "#dc2626",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Cancelar busca
        </button>
      )}

      {message ? (
        <span style={{ color: "#cbd5e1", fontSize: 14 }}>{message}</span>
      ) : null}
    </div>
  );
}