import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getUser, clearAuth } from "../utils/auth";

export default function DashboardLayout({ title = "Dashboard", sidebarItems = [], activeKey, onSelectItem, children }) {
  const user = getUser();
  const navigate = useNavigate();
  const logout = () => { clearAuth(); navigate("/"); };
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const initials = (user?.name || user?.schoolName || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const role = user?.role || "user";

  const defaultItemsByRole = {
    admin: [
      { key: "overview", label: "Overview" },
      { key: "districts", label: "Districts" },
      { key: "schools", label: "Schools" },
      { key: "users", label: "Users" },
      { key: "create-district", label: "Create District" },
      { key: "create-school", label: "Create School" },
    ],
    district_coordinator: [
      { key: "overview", label: "Overview" },
      { key: "schools", label: "Schools" },
    ],
    default: [
      { key: "overview", label: "Overview" },
    ],
  };

  const items = sidebarItems.length ? sidebarItems : (defaultItemsByRole[role] || defaultItemsByRole.default);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f6f8fa" }}>
      <Sidebar items={items} activeKey={activeKey} onSelectItem={onSelectItem} title="DEMS" collapsed={!sidebarOpen} />

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar
          title={title}
          user={user}
          role={role}
          initials={initials}
          onLogout={logout}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          sidebarOpen={sidebarOpen}
        />

        <section style={{ padding: 16 }}>
          {activeKey === "overview" && (
            <h2 style={{ marginTop: 0 }}>{title}</h2>
          )}
          {children}
        </section>
      </main>
    </div>
  );
}

function Navbar({ title, user, role, initials, onLogout, onToggleSidebar, sidebarOpen }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const avatarRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        avatarRef.current && !avatarRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 10,
      background: "#f6f8fa",
      padding: "12px 16px",
      borderBottom: "1px solid #e5e7eb",
    }}>
      <div style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 8,
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
      }}>
        <button
          onClick={onToggleSidebar}
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#2664eb",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          ☰
        </button>
        <div style={{ flex: 1 }} />
        <button
          ref={avatarRef}
          onClick={() => setOpen((v) => !v)}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#2563eb",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            border: 0,
            cursor: "pointer",
          }}
        >
          {initials}
        </button>
        {open && (
          <div
            ref={menuRef}
            style={{
              position: "absolute",
              right: 16,
              top: 64,
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
              width: 240,
              padding: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#2563eb",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}>{initials}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{user?.name || user?.schoolName || "User"}</div>
               
              </div>
            </div>
            <div style={{ borderTop: "1px solid #e5e7eb", margin: "8px 0" }} />
            <div style={{ borderTop: "1px solid #e5e7eb", margin: "8px 0" }} />
            <button onClick={onLogout} style={{
              width: "100%",
              background: "#ef4444",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              padding: "10px 12px",
              fontWeight: 600,
              cursor: "pointer",
            }}>Logout </button>
          </div>
        )}
      </div>
    </div>
  );
}

const iconBtnStyle = {
  border: 0,
  background: "transparent",
  fontSize: 18,
  cursor: "pointer",
};

const menuItemStyle = {
  width: "100%",
  textAlign: "left",
  background: "transparent",
  border: 0,
  padding: "8px 6px",
  borderRadius: 6,
  cursor: "pointer",
};
