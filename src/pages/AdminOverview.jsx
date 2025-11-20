import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "../components/DashboardLayout";
import adminApi from "../api/adminApi";
import districtApi from "../api/districtApi";
import "../styles/adminOverview.css"; // external CSS
import { FaHome, FaUsers, FaBuilding, FaSchool, FaCog, FaCalendarPlus, FaBullhorn, FaClipboardList } from "react-icons/fa";

export default function AdminOverview() {
  const sidebarItems = [
    { key: "overview", label: "Dashboard", icon: <FaHome /> },
    { key: "users", label: "Users", icon: <FaUsers /> },
    { key: "districts", label: "Districts", icon: <FaBuilding /> },
    { key: "schools", label: "Schools", icon: <FaSchool /> },
    { key: "events", label: "Events", icon: <FaCalendarPlus /> },
    { key: "announcements", label: "Announcements", icon: <FaBullhorn /> },
    { key: "evaluation", label: "Evaluation Form", icon: <FaClipboardList /> },
    { key: "settings", label: "School Roles", icon: <FaCog /> },
  ];

  const roles = useMemo(
    () => ["admin", "district_coordinator", "it_admin", "event_coordinator", "school_user"],
    []
  );

  const [users, setUsers] = useState({});
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");
      const userLists = await Promise.all(roles.map((r) => adminApi.listUsers(r)));
      const mapped = {};
      roles.forEach((r, i) => {
        const arr = userLists[i] || [];
        // Attach role to each user item for later actions and display
        mapped[r] = arr.map((u) => ({ ...u, role: r }));
      });
      setUsers(mapped);

      const [d, s] = await Promise.all([districtApi.getAllDistricts(), districtApi.getAllSchools()]);
      setDistricts(d || []);
      setSchools(s || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const toggleApprove = async (role, id, approved) => {
    try {
      await adminApi.approveUser(role, id, { approved });
      await loadAll();
      toast.success(approved ? "User approved" : "User denied");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update approval");
    }
  };

  const pending = (users["district_coordinator"] || []).filter((u) => !u.approved)
    .concat((users["it_admin"] || []).filter((u) => !u.approved))
    .concat((users["event_coordinator"] || []).filter((u) => !u.approved))
    .concat((users["school_user"] || []).filter((u) => !u.approved));

  const roleLabels = {
    admin: "Admins",
    district_coordinator: "District Coordinators",
    it_admin: "IT Admins",
    event_coordinator: "Event Coordinators",
    school_user: "School Users",
  };

  const roleCounts = {
    district_coordinator: (users["district_coordinator"] || []).length,
    it_admin: (users["it_admin"] || []).length,
    event_coordinator: (users["event_coordinator"] || []).length,
    school_user: (users["school_user"] || []).length,
  };

  const sum = Object.values(roleCounts).reduce((a, b) => a + b, 0) || 1;
  const segments = Object.entries(roleCounts).map(([k, v]) => ({
    key: k,
    value: v,
    pct: Math.round((v / sum) * 100),
    color: {
      district_coordinator: "#22c55e",
      it_admin: "#06b6d4",
      event_coordinator: "#f59e0b",
      admin: "#8b5cf6",
      school_user: "#ef4444",
    }[k],
  }));

  const totalUsers = Object.values(users).reduce((acc, arr) => acc + (arr?.length || 0), 0);
  const activeDistricts = districts.length;
  const totalSchools = schools.length;

  return (
    <DashboardLayout
      title="Admin Dashboard"
      sidebarItems={sidebarItems}
      activeKey="overview"
      onSelectItem={(key) => window.location.assign(`/admin/${key}`)}
    >
      {loading && <p className="loading-text">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <>
          <div className="kpi-container">
            <KPICard title="Pending Approvals" value={pending.length} accent="#f59e0b" note="Requires attention" />
            <KPICard title="Total Users" value={totalUsers} accent="#06b6d4" />
            <KPICard title="Active Districts" value={activeDistricts} accent="#22c55e" />
            <KPICard title="Total Schools" value={totalSchools} accent="#8b5cf6" />
          </div>

          <div className="dashboard-grid">
            

            <div className="card">
              <h3>User Role Overview</h3>
              <Donut segments={segments} />
              <div className="legend-grid">
                {segments.map((s) => (
                  <div key={s.key} className="legend-item">
                    <span className="legend-color" style={{ background: s.color }}></span>
                    <span>{roleLabels[s.key]} ({s.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

function KPICard({ title, value, accent = "#0ea5e9", note }) {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-dot" style={{ background: accent }}></span>
        <span className="kpi-title">{title}</span>
      </div>
      <div className="kpi-value">{value}</div>
      {note && <div className="kpi-note">{note}</div>}
    </div>
  );
}

function Donut({ segments, size = 140, thickness = 18 }) {
  const radius = size / 2;
  const r = radius - thickness / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const total = segments.reduce((a, b) => a + b.value, 0) || 1;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-chart">
      <circle cx={radius} cy={radius} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
      {segments.map((s) => {
        const len = (s.value / total) * circumference;
        const el = (
          <circle
            key={s.key}
            cx={radius}
            cy={radius}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={`${len} ${circumference - len}`}
            strokeDashoffset={-offset}
          />
        );
        offset += len;
        return el;
      })}
    </svg>
  );
}
