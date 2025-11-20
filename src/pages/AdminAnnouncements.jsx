import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { FaHome, FaUsers, FaBuilding, FaSchool, FaCog, FaCalendarPlus, FaClipboardList } from "react-icons/fa";
import adminApi from "../api/adminApi";
import Swal from "sweetalert2";

export default function AdminAnnouncements() {
  const sidebarItems = [
    { key: "overview", label: "Dashboard", icon: <FaHome /> },
    { key: "users", label: "Users", icon: <FaUsers /> },
    { key: "districts", label: "Districts", icon: <FaBuilding /> },
    { key: "schools", label: "Schools", icon: <FaSchool /> },
    { key: "events", label: "Events", icon: <FaCalendarPlus /> },
    { key: "announcements", label: "Announcements", icon: <FaCalendarPlus /> },
    { key: "evaluation", label: "Evaluation Form", icon: <FaClipboardList /> },
    { key: "settings", label: "School Roles", icon: <FaCog /> },
  ];

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({ id: "", title: "", message: "", type: "update", audience: "all", isActive: true, expiresAt: "" });
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (items || []).filter((e) => !s || (e.title || "").toLowerCase().includes(s) || (e.message || "").toLowerCase().includes(s));
  }, [items, q]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await adminApi.adminListAnnouncements();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load announcements");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setIsEdit(false);
    setForm({ id: "", title: "", message: "", type: "update", audience: "all", isActive: true, expiresAt: "" });
    setShowModal(true);
  };

  const openEdit = (it) => {
    setIsEdit(true);
    setForm({
      id: it._id,
      title: it.title || "",
      message: it.message || "",
      type: it.type || "update",
      audience: it.audience || "all",
      isActive: !!it.isActive,
      expiresAt: it.expiresAt ? String(it.expiresAt).slice(0, 10) : "",
    });
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: (form.title || "").trim(),
        message: form.message || "",
        type: form.type || "update",
        audience: form.audience || "all",
        isActive: !!form.isActive,
        expiresAt: form.expiresAt ? form.expiresAt : null,
      };
      if (!payload.title) { await Swal.fire({ icon: 'warning', title: 'Title is required' }); return; }
      if (!payload.message) { await Swal.fire({ icon: 'warning', title: 'Message is required' }); return; }

      if (isEdit && form.id) {
        await adminApi.adminUpdateAnnouncement(form.id, payload);
        await Swal.fire({ icon: 'success', title: 'Updated successfully' });
      } else {
        await adminApi.adminCreateAnnouncement(payload);
        await Swal.fire({ icon: 'success', title: 'Created successfully' });
      }
      setShowModal(false);
      await load();
    } catch (er) {
      await Swal.fire({ icon: 'error', title: 'Save failed', text: er?.response?.data?.message || 'Failed to save announcement' });
    }
  };

  const del = async (id) => {
    const res = await Swal.fire({
      title: 'Delete this announcement?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });
    if (!res.isConfirmed) return;
    try {
      await adminApi.adminDeleteAnnouncement(id);
      await load();
      await Swal.fire({ icon: 'success', title: 'Deleted successfully' });
    } catch (er) {
      await Swal.fire({ icon: 'error', title: 'Delete failed', text: er?.response?.data?.message || 'Failed to delete announcement' });
    }
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"
      sidebarItems={sidebarItems}
      activeKey="announcements"
      onSelectItem={(key) => window.location.assign(`/admin/${key}`)}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Announcements</h2>
          <button className="btn primary" onClick={openCreate}>Add Announcement</button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : (
          <div className="table-wrapper">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Sl No</th>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Type</th>
                  <th>Audience</th>
                  <th>Active</th>
                  <th>Expires</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.map((it, i) => (
                    <tr key={it._id}>
                      <td>{i + 1}</td>
                      <td>{it.title}</td>
                      <td style={{ maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.message}</td>
                      <td>{it.type || '-'}</td>
                      <td>{it.audience || '-'}</td>
                      <td>{it.isActive ? 'Yes' : 'No'}</td>
                      <td>{it.expiresAt ? new Date(it.expiresAt).toLocaleDateString() : '-'}</td>
                      <td>
                        <button className="btn small primary" onClick={() => openEdit(it)}>Edit</button>
                        <button className="btn small danger" onClick={() => del(it._id)} style={{ marginLeft: 8 }}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-results">No announcements found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginTop: 0 }}>{isEdit ? "Edit Announcement" : "Add Announcement"}</h3>
              <form onSubmit={save} className="form" style={{ display: "grid", gap: 10 }}>
                <label>Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

                <label>Message</label>
                <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />

                <label>Type</label>
                <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />

                <label>Audience</label>
                <input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} />

                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={!!form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                  <span>Active</span>
                </label>

                <label>Expires At</label>
                <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn primary">{isEdit ? "Update" : "Create"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
