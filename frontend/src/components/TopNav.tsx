type Tab = "dashboard" | "groups" | "printers";

type Props = {
  current: Tab;
  onChange: (tab: Tab) => void;
};

export function TopNav({ current, onChange }: Props) {
  const tabs: { key: Tab; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "groups", label: "Grupos" },
    { key: "printers", label: "Impressoras" },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        marginBottom: 24,
        flexWrap: "wrap",
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            border: "1px solid #334155",
            background: current === tab.key ? "#2563eb" : "#1e293b",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}