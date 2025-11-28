import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { FaHome, FaUsers, FaBuilding, FaSchool, FaCog, FaCalendarPlus, FaEdit, FaTrash, FaBullhorn, FaClipboardList } from "react-icons/fa";
import adminApi from "../api/adminApi";
import districtApi from "../api/districtApi";

export default function AdminEvents() {
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

  const [tab, setTab] = useState("school"); // 'school' | 'district'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({ id: "", title: "", date: "", gender: "both", audience: "both", isGroupEvent: false, participantCount: 2 });
  const [q, setQ] = useState("");

  // district/school selectors
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (events || []).filter((e) => !s || (e.title || "").toLowerCase().includes(s));
  }, [events, q]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = tab === "district" ? await adminApi.adminListDistrictEvents() : await adminApi.adminListEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tab]);

  // load districts once
  useEffect(() => {
    (async () => {
      try {
        const d = await districtApi.getAllDistricts();
        setDistricts(d || []);
      } catch { setDistricts([]); }
    })();
  }, []);

  // load schools when district changes in form
  useEffect(() => {
    (async () => {
      if (!form.districtId) { setSchools([]); return; }
      try {
        const s = await districtApi.getAllSchools({ districtId: form.districtId });
        setSchools(s || []);
      } catch { setSchools([]); }
    })();
  }, [form.districtId]);

  const openCreate = () => {
    setIsEdit(false);
    setForm(
      tab === "district"
        ? { id: "", title: "", date: "", gender: "both" }
        : { id: "", title: "", date: "", gender: "both", audience: "both", isGroupEvent: false, participantCount: 2 }
    );
    setShowModal(true);
  };

  const openEdit = (ev) => {
    setIsEdit(true);
    setForm(
      tab === "district"
        ? {
            id: ev._id,
            title: ev.title || "",
            date: ev.date ? String(ev.date).slice(0, 10) : "",
            gender: ev.gender || "both",
          }
        : {
            id: ev._id,
            title: ev.title || "",
            date: ev.date ? String(ev.date).slice(0, 10) : "",
            gender: ev.gender || "both",
            audience: ev.audience || "both",
            isGroupEvent: !!ev.isGroupEvent,
            participantCount: ev.participantCount || 2,
          }
    );
    setShowModal(true);
  };

  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    // Title validation
    if (!form.title || !form.title.trim()) {
      errors.title = 'Title is required';
    }
    
    // Date validation
    if (!form.date) {
      errors.date = 'Date is required';
    }
    
    // Gender validation (required for both)
    if (!form.gender) {
      errors.gender = 'Please select gender';
    }

    // Audience validation (only for school events)
    if (tab === 'school' && !form.audience) {
      errors.audience = 'Please select an audience';
    }

    // Group event validation
    if (tab === 'school' && form.isGroupEvent) {
      const n = Number(form.participantCount);
      if (!n || isNaN(n) || n < 2) {
        errors.participantCount = 'Minimum 2 participants required for group event';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const save = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return; // Don't proceed if validation fails
    }
    
    try {
      const title = (form.title || "").trim();

      // Enforce unique event title (case-insensitive), excluding current editing id
      const normalized = title.toLowerCase();
      const dup = events.some((ev) => ev && (ev._id !== form.id) && String(ev.title || "").toLowerCase() === normalized);
      if (dup) {
        alert("An event with the same name already exists.");
        return;
      }

      const payload =
        tab === "district"
          ? {
              title,
              date: form.date || null,
              gender: form.gender || "both",
            }
          : {
              title,
              date: form.date || null,
              gender: form.gender || "both",
              audience: form.audience || "both",
              isGroupEvent: !!form.isGroupEvent,
              participantCount: form.isGroupEvent ? Number(form.participantCount) || 2 : null,
            };
      if (tab === "district") {
        if (isEdit && form.id) await adminApi.adminUpdateDistrictEvent(form.id, payload);
        else await adminApi.adminCreateDistrictEvent(payload);
      } else {
        if (isEdit && form.id) await adminApi.adminUpdateEvent(form.id, payload);
        else await adminApi.adminCreateEvent(payload);
      }
      setShowModal(false);
      await load();
    } catch (er) {
      alert(er?.response?.data?.message || "Failed to save event");
    }
  };

  const del = async (id) => {
    const ok = window.confirm("Delete this event?");
    if (!ok) return;
    try {
      if (tab === "district") await adminApi.adminDeleteDistrictEvent(id);
      else await adminApi.adminDeleteEvent(id);
      await load();
    } catch (er) {
      alert(er?.response?.data?.message || "Failed to delete event");
    }
  };

  return (
    <>
      <style jsx>{`
      .required {
        color: #ff4d4f;
        margin-left: 4px;
      }
      .error {
        border-color: #ff4d4f !important;
      }
      .error-message {
        color: #ff4d4f;
        font-size: 12px;
        margin-top: 4px;
      }
      .form input[type="text"],
      .form input[type="date"],
      .form select {
        width: 100%;
        padding: 8px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
      }
      .form input[type="text"].error,
      .form input[type="date"].error,
      .form select.error {
        border-color: #ff4d4f;
      }
    `}</style>
    <DashboardLayout
      title="Admin Dashboard"
      sidebarItems={sidebarItems}
      activeKey="events"
      onSelectItem={(key) => window.location.assign(`/admin/${key}`)}
    >
      <div className="admin-events-page">
        <div className="header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h2 style={{ margin: 0 }}>Events Management</h2>
            <div style={{ display: "inline-flex", gap: 8, marginLeft: 8 }}>
              <button className={`btn ${tab === "school" ? "primary" : ""}`} onClick={() => setTab("school")}>School Events</button>
              <button className={`btn ${tab === "district" ? "primary" : ""}`} onClick={() => setTab("district")}>District Events</button>
            </div>
          </div>
          <button className="btn primary" onClick={openCreate} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <FaCalendarPlus /> Add Event
          </button>
        </div>

        <div className="search-bar" style={{ marginBottom: 12 }}>
          <input placeholder="Search by title..." value={q} onChange={(e) => setQ(e.target.value)} />
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
                  <th>Date</th>
                  <th>Gender</th>
                  {tab === "school" && <th>Audience</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? (
                  filtered.map((ev, i) => (
                    <tr key={ev._id}>
                      <td>{i + 1}</td>
                      <td>{ev.title}</td>
                      <td>{ev.date ? new Date(ev.date).toLocaleDateString() : "-"}</td>
                      <td>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: (ev.gender || 'both') === 'boy' ? '#e6f7ff' : (ev.gender || 'both') === 'girl' ? '#fff0f6' : '#f6ffed',
                          color: (ev.gender || 'both') === 'boy' ? '#1890ff' : (ev.gender || 'both') === 'girl' ? '#c41d7f' : '#389e0d',
                          textTransform: 'capitalize',
                          fontWeight: 500
                        }}>
                          {(() => {
                            const g = (ev.gender || 'both');
                            if (g === 'boy') return 'Boys';
                            if (g === 'girl') return 'Girls';
                            return 'Both';
                          })()}
                        </span>
                      </td>
                      {tab === "school" && (
                        <td>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: ev.audience === 'junior' ? '#e6f7ff' : '#fff2f0',
                            color: ev.audience === 'junior' ? '#1890ff' : '#f5222d',
                            textTransform: 'capitalize',
                            fontWeight: 500
                          }}>
                            {ev.audience || 'N/A'}
                          </span>
                        </td>
                      )}
                      <td>
                        <button className="btn small primary" onClick={() => openEdit(ev)}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><FaEdit /> Edit</span>
                        </button>
                        <button className="btn small danger" onClick={() => del(ev._id)} style={{ marginLeft: 8 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><FaTrash /> Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={tab === "school" ? "6" : "5"} className="no-results">No events found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginTop: 0 }}>{isEdit ? "Edit Event" : "Add Event"}</h3>
              <form onSubmit={save} className="form" style={{ display: "grid", gap: 10 }}>
                <label>Gender <span className="required">*</span></label>
                <select
                  value={form.gender || ""}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className={formErrors.gender ? 'error' : ''}
                >
                  <option value="">Select Gender</option>
                  <option value="both">Both</option>
                  <option value="boy">Only Boys</option>
                  <option value="girl">Only Girls</option>
                </select>
                {formErrors.gender && <div className="error-message">{formErrors.gender}</div>}

                {tab === "school" && (
                  <>
                    <label>Audience <span className="required">*</span></label>
                    <select 
                      value={form.audience || ""} 
                      onChange={(e) => setForm({ ...form, audience: e.target.value, audienceError: '' })}
                      className={formErrors.audience ? 'error' : ''}
                    >
                      <option value="">Select Audience</option>
                      {/* <option value="both">Both</option> */}
                      <option value="junior">Junior</option>
                      <option value="senior">Senior</option>
                    </select>
                    {formErrors.audience && <div className="error-message">{formErrors.audience}</div>}

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={!!form.isGroupEvent}
                        onChange={(e) => setForm({ ...form, isGroupEvent: e.target.checked })}
                      />
                      <span>Group event</span>
                    </label>

                    {form.isGroupEvent && (
                      <>
                        <label>Number of participants <span className="required">*</span></label>
                        <input
                          type="number"
                          min={2}
                          value={form.participantCount}
                          onChange={(e) => setForm({ ...form, participantCount: e.target.value })}
                          className={formErrors.participantCount ? 'error' : ''}
                        />
                        {formErrors.participantCount && <div className="error-message">{formErrors.participantCount}</div>}
                      </>
                    )}
                  </>
                )}

                <label>Title <span className="required">*</span></label>
                <input 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value, titleError: '' })} 
                  className={formErrors.title ? 'error' : ''}
                />
                {formErrors.title && <div className="error-message">{formErrors.title}</div>}

                <label>Date <span className="required">*</span></label>
                <input 
                  type="date" 
                  value={form.date} 
                  onChange={(e) => setForm({ ...form, date: e.target.value, dateError: '' })}
                  className={formErrors.date ? 'error' : ''}
                />
                {formErrors.date && <div className="error-message">{formErrors.date}</div>}

                <div className="modal-actions" style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn primary">{isEdit ? "Update" : "Create"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      </DashboardLayout>
    </>
  );
}
