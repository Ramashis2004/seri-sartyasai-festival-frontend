import React, { useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import districtApi from "../api/districtApi";
import districtUserApi from "../api/districtUserApi";
import DashboardLayout from "../components/DashboardLayout";
import { getUser } from "../utils/auth";
import { FaHome, FaSchool, FaUserPlus, FaUserTie } from "react-icons/fa";

export default function DistrictDashboard() {
  const user = getUser();
  const [activeTab, setActiveTab] = useState("participants");

  // Per-user localStorage keys to avoid cross-user data leakage on shared devices/browsers
  const userKey = useMemo(() => {
    const id = user?._id || user?.districtId || user?.email || "anon";
    return String(id);
  }, [user]);
  const LS_PARTICIPANTS_KEY = useMemo(() => `district_participants_grid_${userKey}`, [userKey]);
  const LS_TEACHERS_KEY = useMemo(() => `district_teachers_grid_${userKey}`, [userKey]);

  const sidebarItems = [
    { key: "overview", label: "Dashboard", icon: <FaHome /> },
    { key: "participants", label: "Participants", icon: <FaUserPlus /> },
    { key: "teachers", label: "Accompanying Guru", icon: <FaUserTie /> },
    { key: "schools", label: "Schools", icon: <FaSchool /> },
  ];

  // Basic styles reused
  const S = {
    headerRow: { 
      display: "flex", 
      flexDirection: "column", 
      gap: 8, 
      marginBottom: 12,
      '@media (min-width: 768px)': {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }
    },
    card: { 
      background: "#fff", 
      border: "1px solid #e2e8f0", 
      borderRadius: 12, 
      padding: { xs: '12px', sm: '16px', md: '20px' }, 
      boxShadow: "0 4px 12px rgba(2,6,23,0.06)",
      overflow: 'hidden',
      width: '100%',
      boxSizing: 'border-box',
    },
    tableWrap: { 
      background: "#fff", 
      border: "1px solid #e2e8f0", 
      borderRadius: 12, 
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      msOverflowStyle: '-ms-autohiding-scrollbar',
      '&::-webkit-scrollbar': {
        height: '6px',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#c1c1c1',
        borderRadius: '3px',
      },
    },
    table: { 
      width: "100%", 
      minWidth: '600px',
      borderCollapse: "collapse", 
      borderSpacing: 0, 
      fontSize: { xs: '13px', sm: '14px' },
    },
    th: { 
      textAlign: "left", 
      background: "#f8fafc", 
      color: "#475569", 
      fontWeight: 700, 
      padding: { xs: '8px 10px', sm: '10px 12px', md: '12px 14px' }, 
      borderBottom: "1px solid #e2e8f0",
      whiteSpace: 'nowrap',
    },
    td: { 
      padding: { xs: '8px 10px', sm: '10px 12px', md: '12px 14px' }, 
      borderBottom: "1px solid #e2e8f0", 
      verticalAlign: "top",
      wordBreak: 'break-word',
    },
    input: { 
      width: "100%", 
      padding: { xs: '8px 10px', sm: '10px 12px' }, 
      borderRadius: 8, 
      border: "1px solid #e2e8f0", 
      outline: "none",
      fontSize: { xs: '14px', sm: '15px' },
      boxSizing: 'border-box',
      '&:focus': {
        borderColor: '#2563eb',
        boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.2)',
      },
    },
    actions: { 
      display: "flex", 
      flexDirection: 'column',
      gap: 8, 
      marginTop: 12,
      '@media (min-width: 480px)': {
        flexDirection: 'row',
        justifyContent: 'flex-end',
      }
    },
  };
  
  // Media query helper function
  const mq = (styles) => ({
    '@media (max-width: 767px)': styles
  });

  const Button = (props) => {
    const buttonStyle = {
      padding: "10px 14px",
      borderRadius: 8,
      border: "1px solid #e2e8f0",
      background: "#fff",
      color: "#0f172a",
      fontWeight: 600,
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      minHeight: '40px',
      ...(props.style || {})
    };

    return (
      <button
        {...props}
        style={buttonStyle}
        type={props.type || "button"}
      />
    );
  };

  const Input = (p) => (
    <input 
      {...p} 
      style={{ 
        width: "100%",
        padding: "8px 10px",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        outline: "none",
        fontSize: "14px",
        boxSizing: 'border-box',
        ...(p.style || {}) 
      }} 
    />
  );
  
  const Select = (p) => {
    const selectStyle = {
      width: "100%",
      padding: "8px 32px 8px 10px",
      borderRadius: 8,
      border: "1px solid #e2e8f0",
      outline: "none",
      fontSize: "14px",
      boxSizing: 'border-box',
      appearance: 'none',
      backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 10px center',
      backgroundSize: '16px',
      cursor: 'pointer',
      ...(p.style || {})
    };
    
    return <select {...p} style={selectStyle} />;
  };
  const Modal = ({ title, children, onClose, onClear, onApply }) => (
    <div style={{ 
      position: "fixed", 
      inset: 0, 
      background: "rgba(2,6,23,0.35)", 
      zIndex: 50, 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: 16,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{ 
        background: "#fff", 
        borderRadius: 16, 
        border: "1px solid #e2e8f0", 
        boxShadow: "0 24px 60px rgba(2,6,23,0.25)", 
        width: "min(720px, 96vw)", 
        maxHeight: "90vh", 
        overflow: "auto",
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#c1c1c1',
          borderRadius: '3px',
        },
      }}>
        <div style={{ 
          padding: { xs: '16px', sm: '20px' }, 
          borderBottom: "1px solid #e2e8f0", 
          display: "flex", 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: "space-between", 
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: '12px', sm: '16px' },
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: { xs: '18px', sm: '20px' },
            textAlign: { xs: 'center', sm: 'left' },
          }}>{title}</h3>
          <div style={{ 
            display: 'flex',
            justifyContent: { xs: 'center', sm: 'flex-end' },
            gap: '10px',
          }}>
            {onClear && (
              <Button 
                onClick={onClear}
                style={{
                  borderColor: '#e2e8f0',
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                  }
                }}
              >
                Clear
              </Button>
            )}
            <Button 
              onClick={onClose}
              style={{
                borderColor: '#e2e8f0',
                '&:hover': {
                  backgroundColor: '#f8fafc',
                }
              }}
            >
              Close
            </Button>
            {onApply && (
              <Button 
                style={{ 
                  backgroundColor: "#2563eb", 
                  color: "#fff", 
                  borderColor: "#2563eb",
                  '&:hover': {
                    backgroundColor: '#1d4ed8',
                    borderColor: '#1d4ed8',
                  }
                }} 
                onClick={onApply}
              >
                {savingParticipants ? "Saving..." :savingTeachers ? "Saving...": "Submit"}
              </Button>
            )}
          </div>
        </div>
        <div style={{ 
          padding: { xs: '16px', sm: '20px' },
          maxHeight: 'calc(90vh - 100px)',
          overflowY: 'auto',
        }}>
          {children}
        </div>
      </div>
    </div>
  );

  // Schools tab (unchanged) and district name lookup
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [errorSchools, setErrorSchools] = useState("");
  const [districtName, setDistrictName] = useState(user?.districtName || "");
  useEffect(() => {
    (async () => {
      try {
        setLoadingSchools(true);
        const districtId = user?.districtId;
        const params = districtId ? { districtId } : {};
        const data = await districtApi.getAllSchools(params);
        setSchools(Array.isArray(data) ? data : []);
        if (!districtName && districtId) {
          try {
            const all = await districtApi.getAllDistricts();
            const found = (Array.isArray(all) ? all : []).find((d) => String(d._id) === String(districtId));
            if (found && found.districtName) setDistrictName(found.districtName);
          } catch (_) {}
        }
      } catch (e) {
        setErrorSchools(e?.response?.data?.message || "Failed to load schools");
      } finally {
        setLoadingSchools(false);
      }
    })();
  }, []);

  // Events
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const loadEvents = async (retry = 1) => {
    try {
      setLoadingEvents(true);
      const data = await districtUserApi.duListEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (_) {
      if (retry > 0) {
        setTimeout(() => loadEvents(retry - 1), 500);
      } else {
        setEvents([]);
      }
    } finally {
      setLoadingEvents(false);
    }
  };
 
  // Participants editing freeze: per-event lock within 48 hours of its date (or past)
  const isWithin48HoursOrPast = (dateStr) => {
    const t = Date.parse(dateStr);
    if (Number.isNaN(t)) return false;
    const now = Date.now();
    const diff = t - now;
    return diff <= 48 * 60 * 60 * 1000; // 48 hours in ms; also true for past dates
  };
  const frozenEventIds = useMemo(() => {
    const ids = new Set();
    (events || []).forEach((ev) => {
      if (isWithin48HoursOrPast(ev?.date)) ids.add(String(ev._id));
    });
    return ids;
  }, [events]);
  const isEventFrozen = (eventId) => frozenEventIds.has(String(eventId));
  const participantsFrozen = useMemo(() => frozenEventIds.size > 0, [frozenEventIds]);

  // Participants
  const [participants, setParticipants] = useState([]);
  const [participantsGrid, setParticipantsGrid] = useState({}); // { [eventId]: { name, gender, className, _id? } }
  const [participantsDirty, setParticipantsDirty] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savingParticipants, setSavingParticipants] = useState(false);

  const refreshParticipants = async () => {
  try {
    const data = await districtUserApi.duListParticipants();
    const list = Array.isArray(data) ? data : [];
    setParticipants(list);

    // Check localStorage only if it contains actual unsaved edits
    const stored = localStorage.getItem(LS_PARTICIPANTS_KEY);
    const storedGrid = stored ? JSON.parse(stored) : null;
    const hasStored = storedGrid && typeof storedGrid === "object" && Object.keys(storedGrid).length > 0;

    // If user has unsaved edits → load from LS
    if (hasStored) {
      setParticipantsGrid(storedGrid);
      setParticipantsDirty(true);
      return;
    }

    // Otherwise → load from API
    const grid = {};
    list.forEach(p => {
      const evId = p.eventId;
      if (!evId) return;
      grid[evId] = {
        name: p.name || "",
        gender: (p.gender || "").toLowerCase(),
        className: p.className || "",
        _id: p._id,
      };
    });

    setParticipantsGrid(grid);
    setParticipantsDirty(false);

  } catch (err) {
    console.error("Participants load error:", err);
  }
};


  // Load events and participants on mount and hydrate participantsGrid from localStorage (if present)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_PARTICIPANTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          setParticipantsGrid(parsed);
          setParticipantsDirty(true);
        }
      }
    } catch (_) {}
    loadEvents(1);
    refreshParticipants();
  }, []);

  const setPGrid = (eventId, field, value) => {
    if (isEventFrozen(eventId)) return; // frozen: do not allow editing for this event
    setParticipantsGrid((prev) => {
      const next = { ...prev, [eventId]: { ...(prev[eventId] || {}), [field]: value } };
      try { localStorage.setItem(LS_PARTICIPANTS_KEY, JSON.stringify(next)); } catch (_) {}
      return next;
    });
    setParticipantsDirty(true);
  };

  const gatherPreviewList = () => {
    const list = [];
    (events || []).forEach((ev) => {
      const v = participantsGrid[ev._id] || {};
      if ((v.name || "").trim()) list.push({ eventId: ev._id, eventTitle: ev.title, name: v.name, gender: v.gender, className: v.className, _id: v._id });
    });
    return list;
  };

  const handlePreviewParticipants = () => {
    const hasAnyData = (events || []).some(ev => {
      const p = participantsGrid[ev._id] || {};
      return p.name || p.gender || p.className;
    });
    if (!hasAnyData) { alert("Please fill at least one participant"); return; }

    const invalidRows = (events || []).filter(ev => {
      const p = participantsGrid[ev._id] || {};
      const hasSome = p.name || p.gender || p.className;
      return hasSome && !(p.name && p.gender && p.className);
    });
    if (invalidRows.length > 0) {
      const eventNames = invalidRows.map(ev => ev.title).join(", ");
      alert(`Please fill all fields for: ${eventNames}`);
      return;
    }

    const list = gatherPreviewList();
    setParticipants(list);
    setShowPreview(true);
  };

  const gatherFullParticipants = () => {
  const list = [];

  (events || []).forEach((ev) => {
    const v = participantsGrid[ev._id] || {};

    list.push({
      _id: v._id,
      eventId: ev._id,
      eventTitle: ev.title,
      name: v.name || "",
      gender: v.gender || "",
      className: v.className || "",
    });
  });

  return list;
};

const confirmSaveParticipants = async () => {
  if (savingParticipants) return; // ⛔ Prevent double click

  const fullList = gatherFullParticipants();

  const result = await Swal.fire({
    title: "Confirm Save",
    text: `Do you want to save ${fullList.length} participant(s)?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, save",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#2563eb",
  });

  if (!result.isConfirmed) return;

  try {
    setSavingParticipants(true);

    const apiCalls = fullList.map(async (p) => {
      if (isEventFrozen(p.eventId)) return;

      const hasAll = p.name && p.gender && p.className;

      // DELETE
      if (p._id && !hasAll) {
        return districtUserApi.duDeleteParticipant(p._id);
      }

      // UPDATE
      if (p._id && hasAll) {
        return districtUserApi.duUpdateParticipant(p._id, {
          name: p.name,
          gender: p.gender,
          className: p.className,
        });
      }

      // CREATE
      if (!p._id && hasAll) {
        return districtUserApi.duCreateParticipant({
          eventId: p.eventId,
          name: p.name,
          gender: p.gender,
          className: p.className,
        });
      }

      return;
    });

    // Run all calls in parallel 🚀
    await Promise.all(apiCalls);

    // Clear local saved edits
    try { localStorage.removeItem(LS_PARTICIPANTS_KEY); } catch (_) {}

    await refreshParticipants();

    // 🔥 Close preview BEFORE showing Swal success
    setShowPreview(false);
    setParticipantsDirty(false);

    await Swal.fire({
      icon: "success",
      title: "Saved!",
      text: "Participants saved successfully.",
    });

  } catch (err) {
    console.error("Save error:", err);
  } finally {
    setSavingParticipants(false);
  }
};


  // Teachers (Accompanying Guru)
  const [teachers, setTeachers] = useState([]);
  const [teachersGrid, setTeachersGrid] = useState([{ member: "secretary_manager", name: "", mobile: "", gender: "" }]);
  const [teachersDirty, setTeachersDirty] = useState(false);
  const [tFormKey, setTFormKey] = useState(0);
  const [showTeacherPreview, setShowTeacherPreview] = useState(false);
  const [savingTeachers, setSavingTeachers] = useState(false);

  const presetMembers = [
    "secretary_manager",
    "mc_member",
    "principal",
    "teacher",
    "guru",
    "parents",
    "dist_president",
    "dist_edu_coordinator_gents",
    "dist_edu_coordinator_ladies",
    "dist_monitoring_committee",
  ];

  const refreshTeachers = async () => {
  try {
    const data = await districtUserApi.duListTeachers();
    const list = Array.isArray(data) ? data : [];
    setTeachers(list);

    // Check localStorage only if it has REAL unsaved values
    const stored = localStorage.getItem(LS_TEACHERS_KEY);
    const storedList = stored ? JSON.parse(stored) : null;
    const hasStored = Array.isArray(storedList) && storedList.length > 0;

    // If user has unsaved edits, use stored data
    if (hasStored) {
      setTeachersGrid(storedList);
      setTeachersDirty(true);
      setTFormKey((k) => k + 1);
      return;
    }

    // Otherwise → Load fresh data from API
    const rows = [];

    // Insert secretary_manager first (if exists)
    const sec = list.find(t => (t.member || "").toLowerCase() === "secretary_manager");
    if (sec) {
      rows.push({
        member: "secretary_manager",
        name: sec.name || "",
        mobile: sec.mobile || "",
        gender: (sec.gender || "").toLowerCase(),
        _id: sec._id
      });
    }

    // Others
    list
      .filter(t => (t.member || "").toLowerCase() !== "secretary_manager")
      .forEach(t => {
        const rawMember = t.member || "mc_member";
        const code = rawMember.toLowerCase();
        const isKnown = presetMembers.includes(code);

        rows.push({
          member: isKnown ? code : "other",
          memberOther: isKnown ? "" : rawMember,
          name: t.name || "",
          mobile: t.mobile || "",
          gender: (t.gender || "").toLowerCase(),
          _id: t._id,
        });
      });

    // Ensure at least one row exists
    if (!rows.length) {
      rows.push({ member: "secretary_manager", name: "", mobile: "", gender: "" });
    }

    setTeachersGrid(rows);
    setTeachersDirty(false);
    setTFormKey(k => k + 1);

  } catch (err) {
    console.error("Teacher load error:", err);
  }
};

  useEffect(() => { refreshTeachers(); }, []);

  const setTGrid = (index, field, value) => {
    setTeachersGrid((prev) => {
      const copy = [...prev];
      copy[index] = { ...(copy[index] || {}), [field]: value };
      try { localStorage.setItem(LS_TEACHERS_KEY, JSON.stringify(copy)); } catch (_) {}
      return copy;
    });
    setTeachersDirty(true);
  };

  const addTeacherRow = () => {
    setTeachersGrid((prev) => [...prev, { member: "mc_member", name: "", mobile: "", gender: "" }]);
    setTeachersDirty(true);
  };
  const removeTeacherRow = async(idx) => {
    const teacherToDelete = teachersGrid[idx];
    if (teacherToDelete?._id) {
      await districtUserApi.duDeleteTeacher(teacherToDelete._id);
    }
    setTeachersGrid((prev) => prev.filter((_, i) => i !== idx));
    setTeachersDirty(true);
  };

  const gatherTeachersPayload = () => {
    return (teachersGrid || [])
      .filter((t) => (t.name || "").trim())
      .map((t) => ({ _id: t._id, member: t.member === "other" ? (t.memberOther || "other") : t.member, name: t.name, mobile: t.mobile, gender: t.gender }));
  };

  const handlePreviewTeachers = () => {
    const payloads = gatherTeachersPayload();
    const hasAnyData = teachersGrid.some(t => t.name || t.mobile || t.gender || t.member);
    if (!hasAnyData) { alert("Please fill at least one guru"); return; }
    const invalidRows = teachersGrid.filter(t => {
      const hasSome = t.name || t.mobile || t.gender || t.member;
      return hasSome && !(t.name && t.mobile && t.gender && (t.member !== "other" || t.memberOther));
    });
    if (invalidRows.length > 0) { alert("Please fill all required fields for all gurus"); return; }
    if (payloads.length === 0) { alert("Please fill at least one guru"); return; }
    setShowTeacherPreview(true);
  };

  const confirmSaveTeachers = async () => {
  if (savingTeachers) return; // ⛔ Prevent double save

  const payloads = gatherTeachersPayload();
  if (!payloads.length) {
    alert("Please fill at least one guru");
    return;
  }

  const result = await Swal.fire({
    title: "Confirm Save",
    text: `Do you want to save ${payloads.length} item(s)?`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, save",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#2563eb",
  });

  if (!result.isConfirmed) return;

  try {
    setSavingTeachers(true);

    const apiCalls = payloads.map((row) => {
      const body = {
        member: row.member,
        name: row.name,
        mobile: row.mobile,
        gender: row.gender,
      };

      return row._id
        ? districtUserApi.duUpdateTeacher(row._id, body)
        : districtUserApi.duCreateTeacher(body);
    });

    await Promise.all(apiCalls);

    try { localStorage.removeItem(LS_TEACHERS_KEY); } catch (_) {}

    await refreshTeachers();

    // 🔥 Close preview BEFORE success popup
    setShowTeacherPreview(false);
    setTeachersDirty(false);

    await Swal.fire({
      icon: "success",
      title: "Saved!",
      text: "Teachers saved successfully.",
    });

  } catch (_) {
    // ignore
  } finally {
    setSavingTeachers(false);
  }
};

  const renderParticipants = () => (
    <div style={{ marginTop: 8 }}>
      <div style={S.card}>
        <p style={{color:"#dc2626", margin: '0 0 16px 0', fontSize: '15px', lineHeight: 1.4}}>
          Please ensure to submit the data along with the accompanying Guru.
        </p>
        {participantsFrozen && (
          <p style={{color:"#991b1b", background:'#fee2e2', border:'1px solid #fecaca', padding:'10px 12px', borderRadius:8, marginTop:0, marginBottom:16, fontWeight:600}}>
            Events starting within 48 hours are frozen. Those rows are view-only.
          </p>
        )}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}
        >
          {[
            { label: "District Name", value: districtName || user?.districtName || user?.district || "-" },
            { label: "Contact Person", value: user?.name || "-" },
            { label: "Mobile Number", value: user?.mobile || "-" },
          ].map((item, index) => (
            <div key={index} style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderRadius: "10px", background: "#f8fafc", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
              <div style={{ fontWeight: 600, color: "#475569", minWidth: "140px" }}>{item.label}</div>
              <div style={{ color: "#1e293b", fontWeight: 500, flex: 1, textAlign: "right", wordBreak: "break-word" }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                <th  style={{...S.th, minWidth: '10px'}}>Sl No</th>
                <th style={{...S.th, minWidth: '120px'}}>Event(s)</th>
                <th style={{...S.th, minWidth: '180px'}}>Name of Participant</th>
                <th style={{...S.th, minWidth: '120px'}}>Boy/Girl</th>
                <th style={{...S.th, minWidth: '100px'}}>Class</th>
              </tr>
            </thead>
            <tbody>
              {loadingEvents ? (
                <tr><td style={{ ...S.td, textAlign: "center", color: "#64748b" }} colSpan={4}>Loading events...</td></tr>
              ) : (events || []).length === 0 ? (
                <tr><td style={{ ...S.td, textAlign: "center", color: "#64748b" }} colSpan={4}>No events available</td></tr>
              ) : (
                events.map((ev,i) => {
                  const v = participantsGrid[ev._id] || {};
                  const frozen = isEventFrozen(ev._id);
                  return (
                    <tr key={ev._id}>
                      <td>{i+1}</td>
                      <td style={S.td}>
                        {ev.title}
                        {frozen && (<span style={{ marginLeft: 8, color: '#b91c1c', fontWeight: 700 }}>(Frozen)</span>)}
                      </td>
                      <td style={S.td}>
                        <Input type="text" placeholder="Enter full name" defaultValue={v.name || ""} onBlur={(e) => setPGrid(ev._id, "name", e.target.value)} disabled={frozen} />
                      </td>
                      <td style={S.td}>
                        {(() => {
                          const allowed = (ev.gender || "both").toLowerCase();
                          const current = (v.gender || "").toLowerCase();
                          const safe = allowed === "boy" ? (current === "boy" ? "boy" : "") : allowed === "girl" ? (current === "girl" ? "girl" : "") : current;
                          return (
                            <Select value={safe} onChange={(e) => setPGrid(ev._id, "gender", e.target.value)} disabled={frozen}>
                              <option value="">Select gender</option>
                              {allowed !== "girl" && <option value="boy">Boy</option>}
                              {allowed !== "boy" && <option value="girl">Girl</option>}
                            </Select>
                          );
                        })()}
                      </td>
                      <td style={S.td}>
                        <Select defaultValue={v.className || ""} onChange={(e) => setPGrid(ev._id, "className", e.target.value)} disabled={frozen}>
                          <option value="">Select Class</option>
                          <option value="6">6</option>
                          <option value="7">7</option>
                          <option value="8">8</option>
                          <option value="9">9</option>
                        </Select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, justifyContent: "space-between", alignItems: { xs: 'stretch', sm: 'center' }, gap: 12, marginTop: 16 }}>
          <div style={{ color: "#dc2626", fontWeight: 600, fontSize: { xs: '13px', sm: '14px' } }}>
            {participantsDirty ? "Don't Forget To Click The Submit Button" : ""}
          </div>
          <div style={{ display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 12 }}>
            <Button
              onClick={() => {
                // Reset the form but do NOT touch localStorage
                setParticipantsGrid((prev) => {
                  const next = {};
                  Object.keys(prev || {}).forEach((k) => {
                    if (isEventFrozen(k)) next[k] = prev[k];   // keep frozen rows
                    else next[k] = {};                         // clear editable rows
                  });
                  return next;
                });

                // Do NOT write to localStorage here
              }}
              style={{ borderColor: '#e2e8f0' }}
            >
              Reset
            </Button>
            <Button 
              onClick={handlePreviewParticipants} 
              style={{ backgroundColor: "#2563eb", color: "#fff", borderColor: "#2563eb", '&:hover': { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' } }}
            >
              Preview & Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeachers = () => (
    <div key={tFormKey} style={{ marginTop: 8 }}>
      <div style={S.card}>
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{...S.th, minWidth: '50px'}}>Sl No</th>
                <th style={{...S.th, minWidth: '150px'}}>Designation</th>
                <th style={{...S.th, minWidth: '180px'}}>Name of Participant</th>
                <th style={{...S.th, minWidth: '130px'}}>Mobile No</th>
                <th style={{...S.th, minWidth: '120px'}}>Gents/Ladies</th>
                <th style={{...S.th, width: '100px'}}></th>
              </tr>
            </thead>
            <tbody>
              {(teachersGrid || []).map((row, idx) => (
                <tr key={idx}>
                  <td>{idx+1}</td>
                  <td style={S.td}>
                    <div style={{ minWidth: '150px' }}>
                      <Select 
                        value={presetMembers.includes((row.member || "").toLowerCase()) ? (row.member || "").toLowerCase() : "other"} 
                        onChange={(e) => setTGrid(idx, "member", e.target.value)}
                        style={{ width: '100%', minWidth: '100%' }}
                      >
                        <option value="dist_president">Dist President</option>
                        <option value="dist_edu_coordinator_gents">Edu-Coord (Gents)</option>
                        <option value="dist_edu_coordinator_ladies">Edu-Coord (Ladies)</option>
                        <option value="dist_monitoring_committee">Monitoring Committee</option>
                        <option value="guru">Guru</option>
                        <option value="parents">Parents</option>
                        <option value="other">Other</option>
                      </Select>
                    </div>
                    {((row.member || "") === "other" || !presetMembers.includes((row.member || "").toLowerCase())) && (
                      <div style={{ marginTop: 8 }}>
                        <Input type="text" placeholder="Specify designation" defaultValue={row.memberOther || (!presetMembers.includes((row.member || "").toLowerCase()) ? (row.member || "") : "")} onBlur={(e) => setTGrid(idx, "memberOther", e.target.value)} style={{ width: '100%', marginTop: '6px' }} />
                      </div>
                    )}
                  </td>
                  <td style={S.td}>
                    <Input type="text" placeholder="Full name" defaultValue={row.name || ""} onBlur={(e) => setTGrid(idx, "name", e.target.value)} style={{ minWidth: '150px' }} />
                  </td>
                  <td style={S.td}>
                    <Input type="tel" placeholder="Mobile number" defaultValue={row.mobile || ""} maxLength={10} onInput={(e) => { e.target.value = e.target.value.replace(/\D/g, ""); }} onBlur={(e) => { const value = e.target.value.trim(); if (value && value.length !== 10) { alert("Mobile number must be exactly 10 digits"); return; } setTGrid(idx, "mobile", value); }} style={{ minWidth: '120px' }} />
                  </td>
                  <td style={S.td}>
                    <Select value={row.gender || ""} onChange={(e) => setTGrid(idx, "gender", e.target.value)}>
                      <option value="">Select gender</option>
                      <option value="boy">Gents</option>
                      <option value="girl">Ladies</option>
                    </Select>
                  </td>
                  <td style={S.td}>
                    {idx > 0 && (
                      <Button onClick={() => removeTeacherRow(idx)} style={{ backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca', '&:hover': { backgroundColor: '#fee2e2' }, padding: '6px 10px', fontSize: '13px' }}>Remove</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", flexDirection: { xs: 'column-reverse', sm: 'row' }, justifyContent: "space-between", alignItems: { xs: 'stretch', sm: 'center' }, marginTop: 16, gap: 12 }}>
          <div>
            <Button onClick={addTeacherRow} style={{ backgroundColor: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0', '&:hover': { backgroundColor: '#dcfce7' }, width: { xs: '100%', sm: 'auto' } }}>+ Add New Guru</Button>
          </div>
          <div style={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 10 }}>
            <Button onClick={() => { setTeachersGrid([{ member: "secretary_manager", name: "", mobile: "", gender: "" }]); setTFormKey(prev => prev + 1); try { localStorage.removeItem(LS_TEACHERS_KEY); } catch(_) {} }} style={{ borderColor: '#e2e8f0', '&:hover': { backgroundColor: '#f8fafc' } }}>Reset All</Button>
            <Button onClick={handlePreviewTeachers} style={{ backgroundColor: "#2563eb", color: "#fff", borderColor: "#2563eb", '&:hover': { backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' } }}>Preview & Submit</Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSchools = () => (
    <div style={{ marginTop: 8 }}>
      {loadingSchools ? (
        <p>Loading...</p>
      ) : errorSchools ? (
        <p className="error-text">{errorSchools}</p>
      ) : (
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead><tr><th style={S.th}>#</th><th style={S.th}>School Name</th></tr></thead>
            <tbody>
              {(schools || []).map((s, i) => (
                <tr key={s._id}><td style={S.td}>{i + 1}</td><td style={S.td}>{s.schoolName}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "participants":
        return renderParticipants();
      case "teachers":
        return renderTeachers();
      case "schools":
        return renderSchools();
      default:
        return (
          <div style={{ marginTop: 8 }}>
            <div style={S.card}>Welcome to the District Dashboard – {districtName}</div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout title="District Dashboard" sidebarItems={sidebarItems} activeKey={activeTab} onSelectItem={setActiveTab}>
      {renderContent()}
      {showPreview && (
        <Modal title="Preview Participants" onClose={() => setShowPreview(false)} onApply={confirmSaveParticipants} onClear={() => setShowPreview(false)}>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead><tr><th style={S.th}>#</th><th style={S.th}>Name</th><th style={S.th}>Event</th><th style={S.th}>Gender</th><th style={S.th}>Class</th></tr></thead>
              <tbody>
                {(participants || []).map((p, idx) => (
                  <tr key={idx}>
                    <td style={S.td}>{idx + 1}</td>
                    <td style={S.td}>{p.name}</td>
                    <td style={S.td}>{p.eventTitle || (events.find((e) => e._id === p.eventId)?.title) || "-"}{isEventFrozen(p.eventId) && (<span style={{ marginLeft: 8, color: '#b91c1c', fontWeight: 700 }}>(Frozen)</span>)}</td>
                    <td style={S.td}>{p.gender || "-"}</td>
                    <td style={S.td}>{p.className || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
      {showTeacherPreview && (
        <Modal title="Preview Accompanying Guru" onClose={() => setShowTeacherPreview(false)} onApply={confirmSaveTeachers} onClear={() => setShowTeacherPreview(false)}>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>#</th>
                  <th style={S.th}>Designation</th>
                  <th style={S.th}>Name</th>
                  <th style={S.th}>Mobile</th>
                  <th style={S.th}>G/L</th>
                </tr>
              </thead>
              <tbody>
                {gatherTeachersPayload().map((t, idx) => (
                  <tr key={idx}>
                    <td style={S.td}>{idx + 1}</td>
                    <td style={S.td}>{t.member}</td>
                    <td style={S.td}>{t.name}</td>
                    <td style={S.td}>{t.mobile}</td>
                    <td style={S.td}>{t.gender==="boy"?"Gents":"Ladies"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
