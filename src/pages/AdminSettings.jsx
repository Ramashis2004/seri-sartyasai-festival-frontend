import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "../components/DashboardLayout";
import districtApi from "../api/districtApi";
import adminApi from "../api/adminApi";
import "../styles/AdminSettings.css"; // External CSS


export default function AdminSettings() {
  const sidebarItems = [
    { key: "overview", label: "Dashboard", icon: "🏠" },
    { key: "users", label: "Users", icon: "👥" },
    { key: "districts", label: "Districts", icon: "🏢" },
    { key: "schools", label: "Schools", icon: "🏫" },
    { key: "events", label: "Events", icon: "📅" },
    { key: "announcements", label: "Announcements", icon: "📣" },
    { key: "settings", label: "School Roles", icon: "⚙️" },
  ];

  const [schoolRoles, setSchoolRoles] = useState([]);
  const [roleForm, setRoleForm] = useState({ id: "", name: "" });
  const [roleEditing, setRoleEditing] = useState(false);

  const loadRoles = async () => {
    try {
      const r = await districtApi.getSchoolRoles();
      setSchoolRoles(r || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const saveRole = async (e) => {
    e.preventDefault();
    try {
      if (!roleForm.name.trim()) return;
      if (roleEditing && roleForm.id) {
        await adminApi.updateSchoolRole(roleForm.id, roleForm.name.trim());
        toast.success("✅ Role updated");
      } else {
        await adminApi.createSchoolRole(roleForm.name.trim());
        toast.success("✅ Role created");
      }
      setRoleForm({ id: "", name: "" });
      setRoleEditing(false);
      await loadRoles();
    } catch (e2) {
      toast.error(e2?.response?.data?.message || "❌ Failed to save role");
    }
  };

  const onEditRole = (r) => {
    setRoleEditing(true);
    setRoleForm({ id: r._id, name: r.name });
  };

  const onDeleteRole = async (id) => {
    try {
      await adminApi.deleteSchoolRole(id);
      toast.success("✅ Role deleted");
      await loadRoles();
    } catch (e3) {
      toast.error(e3?.response?.data?.message || "❌ Failed to delete role");
    }
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"
      sidebarItems={sidebarItems}
      activeKey="settings"
      onSelectItem={(key) => window.location.assign(`/admin/${key}`)}
    >
      <section className="admin-settings">
        <h2 className="page-title">⚙️ School Role Manage </h2>

        <div className="settings-card">
          <h3 className="section-title">School Roles</h3>

          {/* Role Form */}
          <form onSubmit={saveRole} className="form" style={{ gap: 8 }}>
            <input
  type="text"
  placeholder="Role name (e.g., Teacher, Principal)"
  value={roleForm.name}
  onChange={(e) => {
    const value = e.target.value;
    // ✅ Allow only letters, spaces, dots, apostrophes & hyphens
    if (/^[A-Za-z\s.'-]*$/.test(value)) {
      setRoleForm({ ...roleForm, name: value });
    }
  }}
  required
/>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="btn primary-btn">
                {roleEditing ? "Update Role" : "Add Role"}
              </button>
              {roleEditing && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setRoleEditing(false);
                    setRoleForm({ id: "", name: "" });
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Role List */}
          <div style={{ marginTop: 12 }}>
            {schoolRoles.length ? (
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Role Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schoolRoles.map((r, i) => (
                    <tr key={r._id}>
                      <td>{i + 1}</td>
                      <td>{r.name}</td>
                      <td>
                        <button className="btn small" onClick={() => onEditRole(r)}>
                          Edit
                        </button>
                        <button
                          className="btn small danger"
                          onClick={() => onDeleteRole(r._id)}
                          style={{ marginLeft: 8 }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-results">No roles found</div>
            )}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}