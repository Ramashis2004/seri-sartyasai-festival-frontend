import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import adminApi, { adminListEvents, adminListDistrictEvents, getEvaluationFormat, saveEvaluationFormat } from "../api/adminApi";
import { FaHome, FaUsers, FaBuilding, FaSchool, FaCog, FaCalendarPlus, FaBullhorn, FaClipboardList } from "react-icons/fa";
import Swal from "sweetalert2";

export default function AdminEvaluation() {
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

  const [scope, setScope] = useState("school"); // 'school' | 'district'
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [criteria, setCriteria] = useState([{ label: "", maxMarks: 0 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalMarks = useMemo(() => (criteria || []).reduce((s, c) => s + (Number(c.maxMarks) || 0), 0), [criteria]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const list = scope === "district" ? await adminListDistrictEvents() : await adminListEvents();
      setEvents(Array.isArray(list) ? list : []);
      setSelectedEventId("");
      setCriteria([{ label: "", maxMarks: 0 }]);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, [scope]);

  const loadFormat = async (eventId) => {
    try {
      setLoading(true);
      const fmt = await getEvaluationFormat(scope, eventId);
      setCriteria((fmt?.criteria && fmt.criteria.length) ? fmt.criteria.map(c => ({ label: c.label || "", maxMarks: Number(c.maxMarks)||0 })) : [{ label: "", maxMarks: 0 }]);
    } catch {
      setCriteria([{ label: "", maxMarks: 0 }]);
    } finally {
      setLoading(false);
    }
  };

  const addRow = () => setCriteria([...(criteria || []), { label: "", maxMarks: 0 }]);
  const removeRow = async (idx) => {
    const res = await Swal.fire({
      title: 'Remove this criterion?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel'
    });
    if (!res.isConfirmed) return;
    setCriteria((criteria || []).filter((_, i) => i !== idx));
  };

  const updateRow = (idx, field, value) => {
    setCriteria((criteria || []).map((c, i) => i === idx ? { ...c, [field]: field === 'maxMarks' ? Number(value) : value } : c));
  };

  const save = async () => {
    if (!selectedEventId) { await Swal.fire({ icon: 'warning', title: 'Please select an event' }); return; }
    const clean = (criteria || []).filter(c => (c.label||"").trim() && Number(c.maxMarks) >= 0);
    if (!clean.length) { await Swal.fire({ icon: 'warning', title: 'Please add at least one criterion with marks' }); return; }
    try {
      setLoading(true);
      await saveEvaluationFormat({ scope, eventId: selectedEventId, criteria: clean });
      await Swal.fire({ icon: 'success', title: 'Saved successfully' });
    } catch (e) {
      await Swal.fire({ icon: 'error', title: 'Save failed', text: e?.response?.data?.message || 'Failed to save' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"
      sidebarItems={sidebarItems}
      activeKey="evaluation"
      onSelectItem={(key) => window.location.assign(`/admin/${key}`)}
    >
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className={`btn ${scope === 'school' ? 'primary' : ''}`} onClick={() => setScope('school')}>Schools</button>
          <button className={`btn ${scope === 'district' ? 'primary' : ''}`} onClick={() => setScope('district')}>Districts</button>
        </div>

        <div className="card" style={{ padding: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
            <div>
              <h3 style={{ marginTop: 0 }}>Events</h3>
              {loading && <div>Loading events...</div>}
              {!loading && (
                <div style={{ display: 'grid', gap: 6, maxHeight: 380, overflow: 'auto' }}>
                  {(events || []).map((e) => (
                    <button
                      key={e._id}
                      className="btn"
                      style={{ justifyContent: 'flex-start', borderColor: selectedEventId === e._id ? '#2563eb' : '#e5e7eb', background: selectedEventId === e._id ? '#eff6ff' : '#fff' }}
                      onClick={() => { setSelectedEventId(e._id); loadFormat(e._id); }}
                    >
                      {e.title}
                    </button>
                  ))}
                  {(!events || events.length === 0) && <div>No events available.</div>}
                </div>
              )}
            </div>

            <div>
              <h3 style={{ marginTop: 0 }}>Evaluation Format</h3>
              {!selectedEventId && <div className="card">Select an event to configure evaluation criteria.</div>}
              {selectedEventId && (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="styled-table">
                      <thead>
                        <tr>
                          <th style={{ width: '70%' }}>Criterion</th>
                          <th style={{ width: '20%' }}>Max Marks</th>
                          <th style={{ width: '10%' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(criteria || []).map((c, idx) => (
                          <tr key={idx}>
                            <td>
                              <input value={c.label} onChange={(e) => updateRow(idx, 'label', e.target.value)} placeholder="e.g., Creativity" />
                            </td>
                            <td>
                              <input type="number" min={0} value={c.maxMarks} onChange={(e) => updateRow(idx, 'maxMarks', e.target.value)} />
                            </td>
                            <td>
                              <button className="btn small danger" onClick={() => removeRow(idx)}>Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                    <div style={{ color: '#64748b' }}>Total Marks: <b>{totalMarks}</b></div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn" onClick={addRow}>+ Add Criterion</button>
                      <button className="btn primary" onClick={save}>Save</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
