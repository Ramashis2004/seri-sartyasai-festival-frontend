import React from "react";

export default function Sidebar({ items = [], activeKey, onSelectItem, title = "Sri Sathya Sai Festivals", collapsed = false }) {
  return (
    <aside
    style={{
  width: collapsed ? 0 : 200,
  minWidth: collapsed ? 0 : 200,
  maxWidth: collapsed ? 0 : 200,
  transition: "width 200ms ease",
  background: "#0f172a",
  color: "#fff",
  padding: collapsed ? 0 : 16,
  overflow: "hidden",
}}

    >
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}> {title}</div>
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>MAIN MENU</div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {items.map((it) => {
          const isActive = activeKey === it.key;
          return (
            <button
              key={it.key}
              onClick={() => onSelectItem && onSelectItem(it.key)}
              style={{
                textAlign: "left",
                background: isActive ? "#1d4ed8" : "transparent",
                border: 0,
                color: isActive ? "#ffffff" : "#e2e8f0",
                padding: "10px 10px",
                borderRadius: 6,
                fontWeight: isActive ? 700 : 500,
                cursor: onSelectItem ? "pointer" : "default",
              }}
            >
              <span style={{ marginRight: 8 }}>{it.icon || "•"}</span>
              {it.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
