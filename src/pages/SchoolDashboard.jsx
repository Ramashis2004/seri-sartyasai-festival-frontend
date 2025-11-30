import React, { useEffect, useMemo, useRef, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";
import { getUser } from "../utils/auth";
import { FaHome, FaUserPlus, FaUserTie } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  listEvents,
  listParticipants,
  createParticipant,
  updateParticipant,
  deleteParticipant,
  listTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../api/schoolApi";

export default function SchoolDashboard() {
  // ---------- THEME & REUSABLE UI ----------
  const palette = {
    bg: "#f8fafc",
    card: "#ffffff",
    text: "#0f172a",
    textMuted: "#475569",
    border: "#e2e8f0",
    borderStrong: "#cbd5e1",
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    danger: "#ef4444",
    dangerHover: "#dc2626",
    success: "#16a34a",
    warning: "#f59e0b",
    shadow: "0 10px 30px rgba(2, 6, 23, 0.08)",
    shadowStrong: "0 20px 40px rgba(2, 6, 23, 0.12)",
    chipJuniorBg: "#fef9c3",
    chipJuniorBorder: "#facc15",
    chipJuniorText: "#854d0e",
    chipSeniorBg: "#ede9fe",
    chipSeniorBorder: "#c4b5fd",
    chipSeniorText: "#3b0764",
  };

  const radius = 12;

  // Responsive styles
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const S = {
    page: {
      background: palette.bg,
    },
    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    subHeaderRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      gap: 12,
    },
    h3: {
      margin: 0,
      color: palette.text,
      fontWeight: 700,
      letterSpacing: 0.2,
    },
    muted: {
      color: palette.textMuted,
    },
    card: {
      background: palette.card,
      borderRadius: radius,
      border: `1px solid ${palette.border}`,
      boxShadow: palette.shadow,
      padding: 20,
    },
    strongCard: {
      background: palette.card,
      borderRadius: radius,
      border: `1px solid ${palette.border}`,
      boxShadow: palette.shadowStrong,
      padding: 24,
    },
    btnBase: {
      border: `1px solid ${palette.border}`,
      background: "#fff",
      color: palette.text,
      padding: isMobile ? "10px 12px" : "10px 14px",
      borderRadius: 8,
      fontWeight: 600,
      cursor: "pointer",
      boxShadow: "0 2px 8px rgba(2,6,23,0.06)",
      transition: "all .18s ease",
      outline: "none",
      display: "inline-flex",
      alignItems: "center",
      fontSize: isMobile ? '14px' : 'inherit',
      justifyContent: 'center',
      gap: 10,
    },
    btnPrimary: {
      background: palette.primary,
      color: "#fff",
      border: `1px solid ${palette.primary}`,
    },
    btnPrimaryHover: {
      background: palette.primaryHover,
      borderColor: palette.primaryHover,
      transform: "translateY(-1px)",
    },
    btnDanger: {
      background: "#fff",
      color: palette.danger,
      border: `1px solid ${palette.danger}`,
    },
    btnDangerFill: {
      background: palette.danger,
      color: "#fff",
      border: `1px solid ${palette.danger}`,
    },
    input: {
      width: "100%",
      padding: isMobile ? "8px 10px" : "10px 12px",
      borderRadius: 8,
      border: `1px solid ${palette.border}`,
      outline: "none",
      background: "#fff",
      color: palette.text,
      boxShadow: "inset 0 1px 0 rgba(2,6,23,0.02)",
      fontSize: isMobile ? '14px' : 'inherit',
      '&:focus': {
        borderColor: palette.primary,
        boxShadow: `0 0 0 2px ${palette.primary}20`
      }
    },
    inputRow: {
      display: "grid",
      gap: 8,
    },
    label: {
      fontSize: 13,
      fontWeight: 600,
      color: palette.textMuted,
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
      gap: 16,
    },
    formRowSpan2: {
      gridColumn: "1 / -1",
    },
    actionsRow: {
      display: "flex",
      gap: 12,
      marginTop: 8,
      flexWrap: "wrap",
    },
    tableWrap: {
      background: "#fff",
      border: `1px solid ${palette.border}`,
      borderRadius: radius,
      boxShadow: "0 8px 20px rgba(2,6,23,0.06)",
      overflow: "hidden",
    },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0,
      fontSize: 14,
    },
    th: {
      textAlign: "left",
      background: "#f8fafc",
      color: palette.textMuted,
      fontWeight: 700,
      padding: "12px 14px",
      borderBottom: `1px solid ${palette.border}`,
    },
    td: {
      padding: "8px 10px",
      borderBottom: `1px solid ${palette.border}`,
      color: palette.text,
      verticalAlign: "middle",
      fontSize: isMobile ? '14px' : 'inherit',
      '& input, & select': {
        width: '100%',
        boxSizing: 'border-box',
        fontSize: isMobile ? '14px' : 'inherit'
      }
    },
    badgeWarn: {
      color: palette.danger,
      fontWeight: 700,
      marginLeft: 8,
    },
    chip: {
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 9999,
      fontSize: 12,
      fontWeight: 700,
      textTransform: "capitalize",
    },
    modalOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(2,6,23,0.35)",
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    },
    modalCard: {
      background: "#fff",
      borderRadius: 16,
      border: `1px solid ${palette.border}`,
      boxShadow: "0 24px 60px rgba(2,6,23,0.25)",
      width: isMobile ? "95vw" : "min(720px, 96vw)",
      maxHeight: "90vh",
      overflow: "auto",
    },
    modalHead: {
      padding: 20,
      borderBottom: `1px solid ${palette.border}`,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    modalBody: {
      padding: 20,
    },
    pill: {
      display: "inline-flex",
      padding: "2px 8px",
      borderRadius: 999,
      background: "#eff6ff",
      color: "#1e3a8a",
      border: "1px solid #bfdbfe",
      fontSize: 12,
      fontWeight: 700,
    },
  };

  // Primitive UI
  const Button = ({ children, variant = "default", danger = false, fill = false, style, ...rest }) => {
    let base = { ...S.btnBase };
    if (variant === "primary") base = { ...base, ...S.btnPrimary };
    if (variant === "primary-hover") base = { ...base, ...S.btnPrimaryHover };
    if (danger && fill) base = { ...base, ...S.btnDangerFill };
    else if (danger) base = { ...base, ...S.btnDanger };
    return (
      <button
        {...rest}
        style={{
          ...base,
          ...(rest.disabled ? { opacity: 0.6, cursor: "not-allowed" } : {}),
          ...style,
        }}
        onMouseEnter={(e) => {
          if (rest.disabled) return;
          if (variant === "primary") Object.assign(e.currentTarget.style, S.btnPrimaryHover);
          if (danger && !fill)
            Object.assign(e.currentTarget.style, { background: "#fff5f5", transform: "translateY(-1px)" });
          if (!variant && !danger)
            Object.assign(e.currentTarget.style, { background: "#f8fafc", transform: "translateY(-1px)" });
        }}
        onMouseLeave={(e) => {
          if (rest.disabled) return;
          // reset to base
          Object.assign(e.currentTarget.style, {
            ...(variant === "primary" ? S.btnPrimary : danger ? (fill ? S.btnDangerFill : S.btnDanger) : S.btnBase),
          });
        }}
      >
        {children}
      </button>
    );
  };

  const Input = (props) => <input {...props} style={{ ...S.input, ...(props.style || {}) }} />;
  const Textarea = (props) => <textarea {...props} style={{ ...S.input, height: 96, ...(props.style || {}) }} />;
  const Select = (props) => <select {...props} style={{ ...S.input, ...(props.style || {}) }} />;

  const Card = ({ title, right, children, strong = false, style }) => (
    <div style={{ ...(strong ? S.strongCard : S.card), ...(style || {}) }}>
      {(title || right) && (
        <div style={{ ...S.headerRow, marginBottom: 16 }}>
          <h3 style={S.h3}>{title}</h3>
          {right}
        </div>
      )}
      {children}
    </div>
  );

  const TableShell = ({ columns = [], children, isResponsive = true }) => (
    <div style={{ ...S.tableWrap, overflowX: isMobile ? 'auto' : 'visible' }}>
      <div style={{ minWidth: isMobile ? '600px' : 'auto' }}>
        <table style={{ ...S.table, width: isMobile ? '100%' : S.table.width }}>
          <thead>
            <tr>
              {columns.map((c, idx) => (
                <th key={idx} style={{ 
                  ...S.th, 
                  ...(c.style || {}),
                  whiteSpace: 'nowrap',
                  padding: isMobile ? '8px 6px' : '12px 14px'
                }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );

  const Modal = ({ title, children, onClose, onClear, onApply }) => (
    <div style={S.modalOverlay}>
      <div style={S.modalCard}>
        <div style={S.modalHead}>
          <h3 style={{ ...S.h3, margin: 0 }}>{title}</h3>
          <Button onClick={onClose}>Close</Button>
        </div>
        <div style={S.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );

  // ---------- STATE ----------
  const user = getUser();
  const [activeTab, setActiveTab] = useState("participants");

  // Participants
  const [participants, setParticipants] = useState([]);
  const [participantsGrid, setParticipantsGrid] = useState({}); // { [eventId]: { junior: [ { name, gender, className } ], senior: [ ... ] } }
  const [participantsDirty, setParticipantsDirty] = useState(false);
  const [showParticipantPreview, setShowParticipantPreview] = useState(false);
  const [savingParticipants, setSavingParticipants] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const nameInputRef = useRef(null);

  // Events / Teachers
  const [events, setEvents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const isEventLocked = (ev) => {
    try {
      if (!ev || !ev.date) return false;
      const start = new Date(ev.date).getTime();
      if (!isFinite(start)) return false;
      const now = Date.now();
      const freezeAt = start - 48 * 60 * 60 * 1000;
      return now >= freezeAt;
    } catch (_) {
      return false;
    }
  };

  // (Events tab removed) Still loading events for participant/teacher dropdowns

  // Filters: Participants
  const [showParticipantFilter, setShowParticipantFilter] = useState(false);
  const [pfEvent, setPfEvent] = useState("");
  const [pfGroup, setPfGroup] = useState("");
  const [pfGender, setPfGender] = useState("");
  const [pfQuery, setPfQuery] = useState("");

  const filteredParticipants = useMemo(() => {
    const q = pfQuery.trim().toLowerCase();
    return (participants || []).filter((p) => {
      const byEvent = !pfEvent || String(p.eventId || p.event || "") === String(pfEvent);
      const byGroup = !pfGroup || String(p.group || "").toLowerCase() === pfGroup;
      const byGender = !pfGender || String(p.gender || "").toLowerCase() === pfGender;
      const byQuery =
        !q ||
        String(p.name || "").toLowerCase().includes(q) ||
        String(p.className || "").toLowerCase().includes(q);
      return byEvent && byGroup && byGender && byQuery;
    });
  }, [participants, pfEvent, pfGroup, pfGender, pfQuery]);

  // Filters: Teachers
  const [showTeacherFilter, setShowTeacherFilter] = useState(false);
  const [tfEvent, setTfEvent] = useState("");
  const [tfMember, setTfMember] = useState("");
  const [tfGender, setTfGender] = useState("");
  const [tfQuery, setTfQuery] = useState("");

  const filteredTeachers = useMemo(() => {
    const q = tfQuery.trim().toLowerCase();
    return (teachers || []).filter((t) => {
      const byEvent = !tfEvent || String(t.eventId || "") === String(tfEvent);
      const byMember = !tfMember || String(t.member || "").toLowerCase() === tfMember;
      const byGender = !tfGender || String(t.gender || "").toLowerCase() === tfGender;
      const byQuery =
        !q ||
        String(t.name || "").toLowerCase().includes(q) ||
        String(t.mobile || "").toLowerCase().includes(q);
      return byEvent && byMember && byGender && byQuery;
    });
  }, [teachers, tfEvent, tfMember, tfGender, tfQuery]);

  // ---------- LOADERS ----------
  const refreshEvents = async () => {
    try {
      setLoadingEvents(true);
      const data = await listEvents();
      setEvents(data || []);
      // toast.success("Events refreshed");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to refresh events");
    } finally {
      setLoadingEvents(false);
    }
  };

  const refreshParticipants = async (eventId) => {
    try {
      setLoadingParticipants(true);
      const data = await listParticipants(eventId);
      const arr = Array.isArray(data) ? data : [];
      setParticipants(arr);
      // Build server grid (arrays per eventId+group)
      const serverGrid = {};
      arr.forEach((p) => {
        const evId = p.eventId || p.event;
        if (!evId) return;
        serverGrid[evId] = serverGrid[evId] || {};
        const grp = (p.group || "").toLowerCase();
        const list = Array.isArray(serverGrid[evId][grp]) ? serverGrid[evId][grp] : [];
        list.push({
          name: p.name || "",
          gender: (p.gender || "").toLowerCase(),
          className: p.className || "",
          _id: p._id,
        });
        serverGrid[evId][grp] = list;
      });

      // Load draft (migrated to arrays)
      let draftGrid = {};
      let hadDraft = false;
      try {
        const raw = localStorage.getItem("school_participants_grid");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            hadDraft = true;
            const migrated = {};
            Object.keys(parsed || {}).forEach((evId) => {
              const byEvent = parsed[evId] || {};
              const next = {};
              ["junior", "senior"].forEach((grp) => {
                const v = byEvent[grp];
                if (Array.isArray(v)) next[grp] = v;
                else if (v && typeof v === "object") next[grp] = [v];
              });
              migrated[evId] = next;
            });
            draftGrid = migrated;
          }
        }
      } catch (_) {
        // ignore
      }

      // Merge: start with server, overlay matching _id from draft, then append draft-only rows (without _id only)
      const merged = {};
      const evIds = new Set([...Object.keys(serverGrid), ...Object.keys(draftGrid)]);
      evIds.forEach((evId) => {
        const sByEvent = serverGrid[evId] || {};
        const dByEvent = draftGrid[evId] || {};
        const next = {};
        ["junior", "senior"].forEach((grp) => {
          const sArr = Array.isArray(sByEvent[grp]) ? [...sByEvent[grp]] : [];
          const dArr = Array.isArray(dByEvent[grp]) ? dByEvent[grp] : [];
          // Overlay draft onto server by _id
          const byId = new Map((sArr || []).filter(x => x && x._id).map(x => [x._id, { ...x }]));
          const used = new Set();
          dArr.forEach((row) => {
            if (row && row._id && byId.has(row._id)) {
              // Overlay fields (draft may have unsaved edits)
              byId.set(row._id, { ...byId.get(row._id), ...row });
              used.add(row._id);
            }
          });
          // Build merged starting with server order (with overlays applied)
          const mergedArr = (sArr || []).map(x => (x && x._id && byId.has(x._id)) ? byId.get(x._id) : x);
          // Append any draft-only rows WITHOUT _id (new unsaved rows only). If a draft has an _id that
          // no longer exists on the server (deleted in DB), DO NOT re-add it.
          dArr.forEach((row) => {
            if (!row) return;
            const id = row._id;
            if (!id) mergedArr.push(row);
          });
          next[grp] = mergedArr;
        });
        merged[evId] = next;
      });

      setParticipantsGrid(merged);
      setFormKey((k) => k + 1);
      setParticipantsDirty(hadDraft);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to refresh participants");
    } finally {
      setLoadingParticipants(false);
    }
  };

  const refreshTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const data = await listTeachers();
      setTeachers(Array.isArray(data) ? data : []);
      // toast.success("Teachers refreshed");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to refresh teachers");
    } finally {
      setLoadingTeachers(false);
    }
  };

  useEffect(() => {
    refreshEvents();
    refreshTeachers();
    refreshParticipants();
  }, []);

  // Re-fetch participants whenever user navigates to the Participants tab
  useEffect(() => {
    if (activeTab === "participants") {
      refreshParticipants();
    }
  }, [activeTab]);

  // Load saved participant grid from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("school_participants_grid");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          // migrate legacy shape: { [eventId]: { junior: {..}, senior: {..} } }
          const migrated = {};
          Object.keys(parsed || {}).forEach((evId) => {
            const byEvent = parsed[evId] || {};
            const next = {};
            ["junior", "senior"].forEach((grp) => {
              const v = byEvent[grp];
              if (Array.isArray(v)) next[grp] = v;
              else if (v && typeof v === "object") next[grp] = [v];
            });
            migrated[evId] = next;
          });
          setParticipantsGrid(migrated);
          setParticipantsDirty(true);
          setFormKey((k) => k + 1); // force inputs with defaultValue to refresh
        }
      }
    } catch (_) {
      // ignore
    }
  }, []);

  // ---------- EVENTS (view-only for school users) ----------

  // ---------- PARTICIPANTS ----------
  const resetParticipantForm = () => {
    setParticipantsGrid((prev) => {
      const lockedIds = new Set((Array.isArray(events) ? events : []).filter((e) => isEventLocked(e)).map((e) => String(e._id)));
      const next = {};
      Object.keys(prev || {}).forEach((evId) => {
        if (lockedIds.has(String(evId))) next[evId] = prev[evId];
      });
      try {
        if (Object.keys(next).length === 0) localStorage.removeItem("school_participants_grid");
        else localStorage.setItem("school_participants_grid", JSON.stringify(next));
      } catch (_) {}
      const hasAny = Object.values(next || {}).some((byEvent) => {
        const j = Array.isArray(byEvent?.junior) ? byEvent.junior : [];
        const s = Array.isArray(byEvent?.senior) ? byEvent.senior : [];
        return j.length > 0 || s.length > 0;
      });
      setParticipantsDirty(hasAny);
      return next;
    });
    if (nameInputRef.current) nameInputRef.current.value = "";
    setFormKey((k) => k + 1);
  };

  const setGridValue = (eventId, group, index, field, value) => {
    const ev = (events || []).find((e) => String(e._id) === String(eventId));
    if (ev && isEventLocked(ev)) return;
    setParticipantsGrid((prev) => {
      const byEvent = { ...(prev[eventId] || {}) };
      const arr = Array.isArray(byEvent[group]) ? [...byEvent[group]] : [];
      const row = { ...(arr[index] || {}) };
      row[field] = value;
      arr[index] = row;
      const next = { ...prev, [eventId]: { ...byEvent, [group]: arr } };
      try {
        localStorage.setItem("school_participants_grid", JSON.stringify(next));
      } catch (_) {
        // ignore
      }
      return next;
    });
    setParticipantsDirty(true);
  };

  const handleSubmitParticipant = async (e) => {
    e.preventDefault();
    const list = [];
    let hasPartialRow = false;
    (events || []).forEach((ev) => {
      if (isEventLocked(ev)) return; // skip locked events
      const byEvent = participantsGrid[ev._id] || {};
      const groups = (ev.audience === "junior" ? ["junior"] : ev.audience === "senior" ? ["senior"] : ["junior", "senior"]);
      const rowsCount = ev.isGroupEvent ? Math.max(2, Number(ev.participantCount || 2)) : 1;
      let perEventCount = 0;
      let anyStarted = false;
      groups.forEach((grp) => {
        const arr = Array.isArray(byEvent[grp]) ? byEvent[grp] : [];
        for (let i = 0; i < rowsCount; i++) {
          const v = arr[i] || {};
          const name = (v.name || "").trim();
          const gender = (v.gender || "").trim();
          const className = (v.className || "").trim();
          const hasAny = !!(name || gender || className);
          const isComplete = !!(name && gender && className);
          if (hasAny) anyStarted = true;
          if (ev.isGroupEvent && hasAny && !isComplete) {
            hasPartialRow = true;
            return;
          }
          if (isComplete) {
            perEventCount += 1;
            list.push({ eventId: ev._id, group: grp, name, gender, className, _id: v._id });
          }
        }
      });
      if (ev.isGroupEvent && anyStarted && perEventCount < 2) {
        hasPartialRow = true; // reuse flag to block and show alert below
      }
    });
    if (hasPartialRow) {
      alert("For group events: each filled row must be complete (Name, Gender, Class) and at least 2 participants are required.");
      return;
    }
    const filtered = list;
    if (filtered.length === 0) {
      alert("Please fill at least one participant");
      return;
    }
    setParticipants(filtered);
    setShowParticipantPreview(true);
  };

  const handleEditParticipant = () => {};

  const handleDeleteParticipant = async () => {};

  const handleSubmitAllParticipants = () => {
    const list = [];
    let hasPartialRow = false;
    (events || []).forEach((ev) => {
      if (isEventLocked(ev)) return; // skip locked events
      const byEvent = participantsGrid[ev._id] || {};
      const groups = ["junior", "senior"]; // safe iteration; filter per event below
      const rowsCount = ev.isGroupEvent ? Math.max(2, Number(ev.participantCount || 2)) : 1;
      let perEventCount = 0;
      groups.forEach((grp) => {
        if (ev.audience !== "both" && ev.audience !== grp) return;
        const arr = Array.isArray(byEvent[grp]) ? byEvent[grp] : [];
        for (let i = 0; i < rowsCount; i++) {
          const v = arr[i] || {};
          const name = (v.name || "").trim();
          const gender = (v.gender || "").trim();
          const className = (v.className || "").trim();
          const hasAny = !!(name || gender || className);
          const isComplete = !!(name && gender && className);
          if (hasAny && !isComplete) {
            hasPartialRow = true;
            return;
          }
          if (isComplete) {
            perEventCount += 1;
            list.push({ eventId: ev._id, group: grp, name, gender, className, _id: v._id });
          }
        }
      });
      if (ev.isGroupEvent && perEventCount < 2) {
        hasPartialRow = true;
      }
    });
    if (hasPartialRow) {
      alert("For group events: each filled row must be complete (Name, Gender, Class) and at least 2 participants are required.");
      return;
    }
    const filtered = list;
    if (filtered.length === 0) {
      alert("No participants to submit");
      return;
    }
    setParticipants(filtered);
    setShowParticipantPreview(true);
  };

  const confirmSaveParticipants = async () => {
    try {
      setSavingParticipants(true);
      // Load latest existing participants to upsert smartly if _id is missing (e.g., due to an old draft)
      const fetched = await listParticipants();
      const existing = Array.isArray(fetched) ? fetched : [];
      // Safety: filter out any participants for events that are now locked
      const unlocked = (participants || []).filter((p) => {
        const ev = (events || []).find((e) => String(e._id) === String(p.eventId || p.event));
        return ev ? !isEventLocked(ev) : true;
      });
      if (unlocked.length === 0) {
        await Swal.fire({ icon: "warning", title: "Not allowed", text: "No eligible events to save. Editing is locked within 48 hours of event start." });
        return;
      }
      // Track which existing records were matched/updated to later delete others (cleared in UI)
      const usedIdx = new Set();
      for (const p of unlocked) {
        let id = p._id;
        if (!id) {
          // Try to find a robust match in existing list when _id is missing
          const norm = (s) => String(s || "").trim().toLowerCase();
          let matchIndex = existing.findIndex((e) =>
            String(e._id || "") &&
            String(e.eventId || e.event) === String(p.eventId || p.event) &&
            norm(e.group) === norm(p.group) &&
            norm(e.name) === norm(p.name) &&
            String(e.className || "") === String(p.className || "")
          );
          if (matchIndex === -1) {
            // Fallback: unique by event+group+name
            const candidates = existing.map((e, i) => ({ e, i })).filter(({ e }) =>
              String(e.eventId || e.event) === String(p.eventId || p.event) &&
              norm(e.group) === norm(p.group) &&
              norm(e.name) === norm(p.name)
            );
            if (candidates.length === 1) matchIndex = candidates[0].i;
          }
          if (matchIndex >= 0) {
            id = existing[matchIndex]._id;
            usedIdx.add(matchIndex);
          }
        }
        const body = {
          eventId: p.eventId || p.event,
          name: p.name,
          className: p.className,
          gender: p.gender,
          group: p.group,
        };
        if (id) {
          // mark the matched existing record by index as used if we can find it
          const idx = existing.findIndex((e) => String(e._id) === String(id));
          if (idx >= 0) usedIdx.add(idx);
          await updateParticipant(id, body);
        } else {
          await createParticipant(body);
        }
      }
      // Delete any existing, unlocked participants that were not matched (user cleared them)
      const toDelete = existing
        .map((e, i) => ({ e, i }))
        .filter(({ e, i }) => {
          if (usedIdx.has(i)) return false;
          if (!e || !e._id) return false;
          const ev = (events || []).find((evt) => String(evt._id) === String(e.eventId || e.event));
          return ev ? !isEventLocked(ev) : true;
        })
        .map(({ e }) => e);
      for (const e of toDelete) {
        try { await deleteParticipant(e._id); } catch (_) {}
      }
      await refreshParticipants();
      setParticipantsDirty(false);
      setShowParticipantPreview(false);
      // Clear saved draft after successful save
      try {
        localStorage.removeItem("school_participants_grid");
      } catch (_) {
        // ignore
      }
      await Swal.fire({ icon: "success", title: "Saved!", text: "Participants saved successfully." });
    } catch (_) {
      // ignore
    } finally {
      setSavingParticipants(false);
    }
  };

  const confirmAndSaveParticipants = async () => {
    const result = await Swal.fire({
      title: "Confirm Save",
      text: `Do you want to save ${participants.length} participant(s)?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, save",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
    });
    if (result.isConfirmed) {
      await confirmSaveParticipants();
    }
  };

  // ---------- TEACHERS (New Form Layout) ----------
  const [teachersDirty, setTeachersDirty] = useState(false);
  const [teachersGrid, setTeachersGrid] = useState({
    // dynamic rows; each: { sl, member, designation, name, mobile, gender }
    others: [
      { sl: 1, member: "secretary_manager", designation: "", name: "", mobile: "", gender: "" },
    ],
  });
  const [showTeacherPreview, setShowTeacherPreview] = useState(false);
  const [savingTeachers, setSavingTeachers] = useState(false);
  const [tFormKey, setTFormKey] = useState(0);

  const resetTeacherGrid = () => {
    setTeachersGrid({
      others: [
        { sl: 1, member: "secretary_manager", designation: "", name: "", mobile: "", gender: "" },
      ],
    });
    setTFormKey((k) => k + 1);
    try { localStorage.removeItem("school_teachers_grid"); } catch (_) {}
    setTeachersDirty(false);
  };

  const setTeacherGridValue = (section, key, field, value) => {
    setTeachersGrid((prev) => {
      const next = { ...prev };
      if (section === "others") {
        const idx = key;
        const copy = Array.isArray(prev.others) ? [...prev.others] : [];
        copy[idx] = { ...(copy[idx] || {}), [field]: value };
        next.others = copy;
      }
      try { localStorage.setItem("school_teachers_grid", JSON.stringify(next)); } catch (_) {}
      return next;
    });
    setTeachersDirty(true);
  };

  const addTeacherRow = () => {
    setTeachersGrid((prev) => {
      const copy = Array.isArray(prev.others) ? [...prev.others] : [];
      const nextSl = (copy[copy.length - 1]?.sl || 0) + 1;
      copy.push({ sl: nextSl, member: "mc_member", designation: "", name: "", mobile: "", gender: "" });
      const next = { ...prev, others: copy };
      try { localStorage.setItem("school_teachers_grid", JSON.stringify(next)); } catch (_) {}
      return next;
    });
    setTFormKey((k) => k + 1);
    setTeachersDirty(true);
  };

  const removeTeacherRow = async(index) => {
      const teacherToDelete = teachersGrid?.others?.[index];

  // 2️⃣ Perform async deletion (if applicable)
  if (teacherToDelete?._id) {
    await deleteTeacher(teacherToDelete._id);
  }
    setTeachersGrid((prev) => {
      const copy = Array.isArray(prev.others) ? prev.others.filter((_, i) => i !== index) : [];
      // re-number sl
      const renum = copy.map((r, i) => ({ ...r, sl: i + 1 }));
      const next = { ...prev, others: renum };
      try { localStorage.setItem("school_teachers_grid", JSON.stringify(next)); } catch (_) {}
      return next;
    });
    setTFormKey((k) => k + 1);
    setTeachersDirty(true);
  };

  // Hydrate teachersGrid from API on load; reconcile any local draft against latest server list to avoid stale rows
  useEffect(() => {
    try {
      const raw = localStorage.getItem("school_teachers_grid");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          // Reconcile: drop any draft rows that have _id not present in server list (deleted in DB)
          const serverIds = new Set((Array.isArray(teachers) ? teachers : []).map(t => String(t._id || "")));
          const clean = { ...parsed };
          const rows = Array.isArray(parsed.others) ? parsed.others : [];
          const filtered = rows.filter(r => !r || !r._id ? true : serverIds.has(String(r._id)));
          // Re-number sl
          const renum = filtered.map((r, i) => ({ ...r, sl: i + 1 }));
          clean.others = renum.length ? renum : [{ sl: 1, member: "secretary_manager", designation: "", name: "", mobile: "", gender: "" }];
          setTeachersGrid(clean);
          setTeachersDirty(true);
          setTFormKey((k) => k + 1);
          return;
        }
      }
    } catch (_) {}
    // Build from fetched teachers list (include all members). If member is a custom value, map to 'other' with designation.
    const buildFromTeachers = () => {
      const rows = [];
      const list = Array.isArray(teachers) ? teachers : [];
      const allowed = new Set(["secretary_manager", "mc_member", "principal", "teacher", "other"]);
      const sec = list.find((t) => (t.member || "").toLowerCase() === "secretary_manager");
      if (sec) rows.push({ sl: rows.length + 1, member: "secretary_manager", designation: "", name: sec.name || "", mobile: sec.mobile || "", gender: (sec.gender || "").toLowerCase(), _id: sec._id });
      // push all other teachers in the order received
      list
        .filter((t) => (t.member || "").toLowerCase() !== "secretary_manager")
        .forEach((t) => {
          const rawMember = (t.member || "").toLowerCase();
          const isKnown = allowed.has(rawMember);
          const member = isKnown ? rawMember : "other";
          const designation = isKnown ? "" : t.member || "";
          rows.push({ sl: rows.length + 1, member, designation, name: t.name || "", mobile: t.mobile || "", gender: (t.gender || "").toLowerCase(), _id: t._id });
        });
      if (rows.length === 0) {
        rows.push({ sl: 1, member: "secretary_manager", designation: "", name: "", mobile: "", gender: "" });
      }
      setTeachersGrid({ others: rows });
      setTFormKey((k) => k + 1);
      setTeachersDirty(false);
    };
    buildFromTeachers();
  }, [teachers]);

  const gatherTeachersPayload = () => {
    const list = [];
    let hasPartialRow = false;
    // Others section only (dynamic rows)
    const rows = Array.isArray(teachersGrid.others) ? teachersGrid.others : [];
    rows.forEach((row) => {
      const name = (row.name || "").trim();
      const mobile = (row.mobile || "").trim();
      const gender = (row.gender || "").trim();
      const hasAny = !!(name || mobile || gender);
      const isComplete = !!(name && mobile && gender);
      if (!hasAny) return; // completely empty row, ignore
      if (hasAny && !isComplete) {
        hasPartialRow = true;
        return;
      }
      const allowed = new Set(["secretary_manager", "mc_member", "principal", "teacher", "other"]);
      const selected = (row.member || "").toLowerCase();
      const computedMember = selected === "other" && (row.designation || "").trim() ? row.designation : selected;
      const payload = { member: computedMember, name, mobile, gender };
      if (row._id) payload._id = row._id;
      if (selected === "other" && row.designation) payload.designation = row.designation;
      list.push(payload);
    });
    return { list, hasPartialRow };
  };

  const confirmSaveTeachers = async () => {
    const { list: payloads, hasPartialRow } = gatherTeachersPayload();
    if (hasPartialRow) {
      alert("For each teacher row, if you fill any field (Name, Mobile, or Gender), then all of them are mandatory.");
      return;
    }
    if (payloads.length === 0) {
      alert("Please fill at least one teacher");
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
      // Upsert: find a robust matching existing item to update, else create
      const existing = Array.isArray(teachers) ? teachers : [];
      const usedIdx = new Set();
      const norm = (s) => String(s || "").trim().toLowerCase();
      for (const p of payloads) {
        let match = null;
        if (p._id) {
          match = existing.find((t, i) => t._id === p._id && !usedIdx.has(i));
          if (match) usedIdx.add(existing.indexOf(match));
        }
        if (!match) {
          // Try strict match by member+name+mobile
          match = existing.find((t, i) => !usedIdx.has(i) && norm(t.member) === norm(p.member) && norm(t.name) === norm(p.name) && norm(t.mobile) === norm(p.mobile));
          if (match) usedIdx.add(existing.indexOf(match));
        }
        if (!match) {
          // Fallback: unique match by name+mobile
          const candidates = existing.map((t, i) => ({ t, i })).filter(({ t, i }) => !usedIdx.has(i) && norm(t.name) === norm(p.name) && norm(t.mobile) === norm(p.mobile));
          if (candidates.length === 1) {
            match = candidates[0].t;
            usedIdx.add(candidates[0].i);
          }
        }
        const body = { name: p.name, mobile: p.mobile, member: p.member, gender: p.gender, eventId: p.eventId || "" };
        if (match && match._id) await updateTeacher(match._id, body);
        else await createTeacher(body);
      }
      // Delete any existing teachers that are not present in the current payload (user cleared the row)
      const toDelete = existing
        .map((t, i) => ({ t, i }))
        .filter(({ t, i }) => !usedIdx.has(i) && t && t._id);
      for (const { t } of toDelete) {
        try { await deleteTeacher(t._id); } catch (_) {}
      }
      await refreshTeachers();
      try { localStorage.removeItem("school_teachers_grid"); } catch (_) {}
      setTeachersDirty(false);
      setShowTeacherPreview(false);
      await Swal.fire({ icon: "success", title: "Saved!", text: "Teachers saved successfully." });
    } catch (_) {
      // ignore
    } finally {
      setSavingTeachers(false);
    }
  };

  // ---------- RENDERERS ----------
  const sidebarItems = useMemo(() => ([
    { key: "overview", label: "Dashboard", icon: <FaHome /> },
    { key: "participants", label: "Participants", icon: <FaUserPlus /> },
    { key: "teachers", label: "Accompanying Teachers", icon: <FaUserTie /> },
  ]), []);

  const renderParticipantForm = () => {
    const anyUnlocked = (events || []).some((ev) => !isEventLocked(ev));
    return (
    <div key={formKey} style={{ marginTop: 8 }}>
      <Card title={"Registration Form for School"} strong>
         <p style={{color:"red", fontSize: isMobile ? '14px' : '16px', margin: '0 0 16px 0'}}>Please ensure to submit the data along with the accompanying Teacher.</p>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: isMobile ? "1fr" : "160px 1fr", 
          rowGap: 8, 
          columnGap: 12, 
          marginBottom: 12 
        }}>
          <div style={S.muted}>School Name</div>
          <div>{user?.schoolName || "-"}</div>
          <div style={S.muted}>Contact Person for festival</div>
          <div>{user?.name || user?.fullName || user?.username || "-"}</div>
          <div style={S.muted}>Mobile Number</div>
          <div>{user?.mobile || user?.phone || "-"}</div>
        </div>

        <TableShell columns={[{label:"SL No"},{ label: "Event(s)" }, { label: "Group" }, { label: "Name of the Participant" }, { label: "Boy/Girl" }, { label: "Class" }]}>
          {(events || []).length === 0 ? (
            <tr>
              <td style={{ ...S.td, textAlign: "center", color: palette.textMuted }} colSpan={5}>No events available</td>
            </tr>
          ) : (
            events.flatMap((ev,idx) => {
              const byEvent = participantsGrid[ev._id] || {};
              const groups = (ev.audience === "junior" ? ["junior"] : ev.audience === "senior" ? ["senior"] : ["junior", "senior"]);
              const rowsCount = ev.isGroupEvent ? Math.max(2, Number(ev.participantCount || 2)) : 1;
              const rows = [];
              groups.forEach((grp) => {
                for (let i = 0; i < rowsCount; i++) {
                  const arr = Array.isArray(byEvent[grp]) ? byEvent[grp] : [];
                  const v = arr[i] || {};
                  rows.push(
                    <tr key={`${ev._id}_${grp}_${i}`}>
                      <td>{idx+1}</td>
                      <td style={S.td}>
                        {ev.title}{ev.isGroupEvent ? ` (Member ${i + 1}/${rowsCount})` : ""}
                        <span
                          style={{
                            ...S.pill,
                            marginLeft: 8,
                            background: isEventLocked(ev) ? "#fee2e2" : "#ecfdf5",
                            color: isEventLocked(ev) ? "#991b1b" : "#065f46",
                            border: `1px solid ${isEventLocked(ev) ? "#fecaca" : "#a7f3d0"}`,
                          }}
                        >
                          {isEventLocked(ev) ? "Locked" : "Open"}
                        </span>
                      </td>
                      <td style={S.td}>
                        <span style={{ ...S.chip, ...(grp === "junior"
                          ? { background: palette.chipJuniorBg, border: `1px solid ${palette.chipJuniorBorder}`, color: palette.chipJuniorText }
                          : { background: palette.chipSeniorBg, border: `1px solid ${palette.chipSeniorBorder}`, color: palette.chipSeniorText } )}}>
                          {grp}
                        </span>
                      </td>
                      <td style={S.td}>
                        <Input
                          type="text"
                          placeholder="Enter full name"
                          defaultValue={v.name || ""}
                          onBlur={(e) => setGridValue(ev._id, grp, i, "name", e.target.value)}
                          autoComplete="off"
                          disabled={isEventLocked(ev)}
                        />
                      </td>
                      <td style={S.td}>
                        {(() => {
                          const allowed = (ev.gender || "both").toLowerCase();
                          const current = (v.gender || "").toLowerCase();
                          const safeValue = allowed === "boy" ? (current === "boy" ? "boy" : "") : allowed === "girl" ? (current === "girl" ? "girl" : "") : current;
                          return (
                            <select
                              defaultValue={safeValue}
                              onChange={(e) => setGridValue(ev._id, grp, i, "gender", e.target.value)}
                              style={{ width: "100%", padding: "8px" }}
                              disabled={isEventLocked(ev)}
                            >
                              <option value="">Select gender</option>
                              {allowed !== "girl" && <option value="boy">Boy</option>}
                              {allowed !== "boy" && <option value="girl">Girl</option>}
                            </select>
                          );
                        })()}
                      </td>
                      <td style={S.td}>
                        <select
                          defaultValue={v.className || ""}
                          onBlur={(e) => setGridValue(ev._id, grp, i, "className", e.target.value)}
                          onChange={(e) => setGridValue(ev._id, grp, i, "className", e.target.value)}
                          style={{ width: "100%", padding: "8px" }}
                          disabled={isEventLocked(ev)}
                        >
                          <option value="">Select Class</option>
                          <option value="6">6</option>
                          <option value="7">7</option>
                          <option value="8">8</option>
                          <option value="9">9</option>
                        </select>
                      </td>
                    </tr>
                  );
                }
              });
              return rows;
            })
          )}
        </TableShell>

        <div style={{ 
          display: "flex", 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: isMobile ? 'stretch' : 'flex-end', 
          marginTop: 12, 
          gap: 10 
        }}>
          <Button 
            onClick={resetParticipantForm}
            style={isMobile ? { width: '100%', textAlign: 'center' } : {}}
            disabled={!anyUnlocked}
          >
            Reset
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmitParticipant}
            style={isMobile ? { width: '100%', textAlign: 'center' } : {}}
            disabled={!anyUnlocked}
          >
            Preview & Submit
          </Button>
        </div>
      </Card>
    </div>
  );
  };

  const renderTeacherForm = () => (
    <div key={tFormKey} style={{ marginTop: 8 }}>
      <Card title="Accompanying Teachers" strong>
        <div style={{ 
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: '-ms-autohiding-scrollbar',
          paddingBottom: '10px',
          marginBottom: '16px'
        }}>
          <TableShell columns={[{ label: "Sl. no" }, { label: "Designation" }, { label: "Name Of the Participant" }, { label: "Mobile No" }, { label: "Gents/Ladies" }, { label: "" }]}>
            {(Array.isArray(teachersGrid.others) ? teachersGrid.others : []).map((row, idx) => (
            <tr key={idx}>
              <td style={S.td}>{row.sl}</td>
              <td style={S.td}>
                <Select value={row.member} onChange={(e) => setTeacherGridValue("others", idx, "member", e.target.value)}>
                  <option value="secretary_manager">Secretary/Manager</option>
                  <option value="mc_member">MC Member</option>
                  <option value="principal">Principal</option>
                  <option value="teacher">Teacher</option>
                  <option value="other">Other</option>
                </Select>
                {row.member === "other" && (
                  <Input style={{ marginTop: 6 }} type="text" placeholder="Enter designation" defaultValue={row.designation || ""} onBlur={(e) => setTeacherGridValue("others", idx, "designation", e.target.value)} />
                )}
              </td>
             <td style={S.td}>
            {/* Name of the Participant (previously Mobile No) */}
            <Input
              type="text"
              placeholder="Enter full name"
              defaultValue={row.name || ""}
              onBlur={(e) => setTeacherGridValue("others", idx, "name", e.target.value)}
            />
          </td>

          <td style={S.td}>
            {/* Mobile No (previously Name of the Participant) */}
           <Input
            type="tel"
            placeholder="Enter mobile"
            defaultValue={row.mobile || ""}
            maxLength={10}
            onInput={(e) => {
              // remove any non-numeric characters (also works for paste)
              e.target.value = e.target.value.replace(/\D/g, "");
            }}
            onBlur={(e) => {
              const value = e.target.value;

              if (value.length !== 10) {
                alert("Mobile number must be exactly 10 digits");
                return;
              }

              setTeacherGridValue("others", idx, "mobile", value);
            }}
          />

          </td>

              <td style={S.td}>
                <select
                  value={row.gender || ""}
                  onChange={(e) => setTeacherGridValue("others", idx, "gender", e.target.value)}
                  style={{ width: "100%", padding: "8px" }}
                >
                  <option value="">Select gender</option>
                  <option value="boy">Gents</option>
                  <option value="girl">Ladies</option>
                </select>
              </td>
              <td style={{ ...S.td, width: 120 }}>
                {idx > 0 && <Button danger onClick={() => removeTeacherRow(idx)}>Remove</Button>}
              </td>
            </tr>
            ))}
          </TableShell>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, gap: 10, flexWrap: "wrap" }}>
          <div>
            <Button onClick={addTeacherRow}>+ Add Row</Button>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button onClick={resetTeacherGrid}>Reset</Button>
            <Button variant="primary" onClick={() => setShowTeacherPreview(true)}>Preview & Submit</Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderParticipantsList = () => (
    <div style={{ marginTop: 8 }}>
      <div style={S.headerRow}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h3 style={S.h3}>Participants</h3>
          {participantsDirty && <span style={S.badgeWarn}>Don't Forget Click The Submit Button</span>}
        </div>
      </div>

      <div style={{ color: "#dc2626", fontWeight: 600, marginBottom: 8 }}>
        Don't forget to click on final  Submit button bellow
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button onClick={() => setShowParticipantFilter(true)}>Filter</Button>
      </div>

      <TableShell
        columns={[
          { label: "#" },
          { label: "Name" },
          { label: "Event" },
          { label: "Group" },
          { label: "Gender" },
          { label: "Class" },
        ]}
      >
        {filteredParticipants.length === 0 ? (
          <tr>
            <td style={{ ...S.td, textAlign: "center", color: palette.textMuted }} colSpan={6}>
              No participants added yet.
            </td>
          </tr>
        ) : (
          filteredParticipants.map((p, idx) => {
            const isJunior = (p.group || "").toLowerCase() === "junior";
            const chipStyle = isJunior
              ? { background: palette.chipJuniorBg, border: `1px solid ${palette.chipJuniorBorder}`, color: palette.chipJuniorText }
              : { background: palette.chipSeniorBg, border: `1px solid ${palette.chipSeniorBorder}`, color: palette.chipSeniorText };
            return (
              <tr key={idx} onClick={() => handleEditParticipant(idx)} style={{ cursor: "pointer" }}>
                <td style={S.td}>{idx + 1}</td>
                <td style={S.td}>{p.name}</td>
                <td style={S.td}>
                  {(() => {
                    const ev = events.find((e) => e._id === (p.eventId || p.event));
                    const label = ev?.title || p.event || "-";
                    const locked = ev ? isEventLocked(ev) : false;
                    return (
                      <>
                        {label}
                        {ev && (
                          <span
                            style={{
                              ...S.pill,
                              marginLeft: 8,
                              background: locked ? "#fee2e2" : "#ecfdf5",
                              color: locked ? "#991b1b" : "#065f46",
                              border: `1px solid ${locked ? "#fecaca" : "#a7f3d0"}`,
                            }}
                          >
                            {locked ? "Locked" : "Open"}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </td>
                <td style={S.td}>
                  <span style={{ ...S.chip, ...chipStyle }}>{p.group}</span>
                </td>
                <td style={S.td}>{p.gender}</td>
                <td style={S.td}>{p.className}</td>
              </tr>
            );
          })
        )}
      </TableShell>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
        <Button variant="primary" onClick={handleSubmitAllParticipants} disabled={!participantsDirty || !(events || []).some((ev) => !isEventLocked(ev))}>
          Submit
        </Button>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div style={{ marginTop: 10 }}>
       <h1>Welcome To Dashboard - {user?.schoolName || 'School'}</h1>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "participants":
        return renderParticipantForm();
      case "teachers":
        return renderTeacherForm();
      default:
        return renderOverview();
    }
  };

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={S.page}>
      <DashboardLayout
        title="School Dashboard"
        sidebarItems={sidebarItems}
        activeKey={activeTab}
        onSelectItem={setActiveTab}
      >
        {renderContent()}

        {showParticipantFilter && (
          <Modal
            title="Filter Participants"
            onClose={() => setShowParticipantFilter(false)}
            onClear={() => {
              setPfEvent("");
              setPfGroup("");
              setPfGender("");
              setPfQuery("");
            }}
            onApply={() => setShowParticipantFilter(false)}
          >
            <div style={S.formGrid}>
              <div style={S.inputRow}>
                <label style={S.label}>Event</label>
                <Select value={pfEvent} onChange={(e) => setPfEvent(e.target.value)}>
                  <option value="">All Events</option>
                  {events.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      {ev.title}
                    </option>
                  ))}
                </Select>
              </div>

              <div style={S.inputRow}>
                <label style={S.label}>Group</label>
                <Select value={pfGroup} onChange={(e) => setPfGroup(e.target.value)}>
                  <option value="">All Groups</option>
                  <option value="junior">Junior</option>
                  <option value="senior">Senior</option>
                </Select>
              </div>

              <div style={S.inputRow}>
                <label style={S.label}>Gender</label>
                <Select value={pfGender} onChange={(e) => setPfGender(e.target.value)}>
                  <option value="">All Genders</option>
                  <option value="boy">Boys</option>
                  <option value="girl">Girls</option>
                </Select>
              </div>

              <div style={S.inputRow}>
                <label style={S.label}>Search</label>
                <Input placeholder="Name or class" value={pfQuery} onChange={(e) => setPfQuery(e.target.value)} />
              </div>
            </div>
          </Modal>
        )}

        {showTeacherPreview && (
          <Modal
            title="Preview Accompanying Teachers"
            onClose={() => setShowTeacherPreview(false)}
            onClear={() => setShowTeacherPreview(false)}
            onApply={confirmSaveTeachers}
          >
            <TableShell columns={[{ label: "Sl No" }, { label: "Designation" }, { label: "Name" }, { label: "Mobile" }, { label: "Gender" }]}> 
              {(() => {
                const { list: payloads, hasPartialRow } = gatherTeachersPayload();
                if (hasPartialRow) {
                  alert("For each teacher row, if you fill any field (Name, Mobile, or Gender), then all of them are mandatory.");
                  return (
                    <tr>
                      <td style={{ ...S.td, textAlign: "center", color: palette.textMuted }} colSpan={5}>Please complete or clear all partially filled rows, then open preview again.</td>
                    </tr>
                  );
                }
                if (payloads.length === 0) {
                  return (
                    <tr>
                      <td style={{ ...S.td, textAlign: "center", color: palette.textMuted }} colSpan={5}>No entries</td>
                    </tr>
                  );
                }
                return payloads.map((p, idx) => {
                  const label = p.designation || (p.member === "secretary_manager" ? "Secretary/Manager" : p.member === "mc_member" ? "MC Member" : p.member);
                  return (
                    <tr key={idx}>
                      <td style={S.td}>{idx + 1}</td>
                      <td style={S.td}>{label}</td>
                      <td style={S.td}>{p.name}</td>
                      <td style={S.td}>{p.mobile}</td>
                      <td style={S.td}>{p.gender==="boy"?"Gents":"Ladies"}</td>
                    </tr>
                  );
                });
              })()}
            </TableShell>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, gap: 10 }}>
              <Button onClick={() => setShowTeacherPreview(false)}>Back</Button>
              <Button variant="primary" onClick={confirmSaveTeachers} disabled={savingTeachers}>{savingTeachers ? "Saving..." : "Confirm & Save"}</Button>
            </div>
          </Modal>
        )}

        {showTeacherFilter && (
          <Modal
            title="Filter Accompanying Teachers"
            onClose={() => setShowTeacherFilter(false)}
            onClear={() => {
              setTfEvent("");
              setTfMember("");
              setTfGender("");
              setTfQuery("");
            }}
            onApply={() => setShowTeacherFilter(false)}
          >
            <div style={S.formGrid}>
              <div style={S.inputRow}>
                <label style={S.label}>Event</label>
                <Select value={tfEvent} onChange={(e) => setTfEvent(e.target.value)}>
                  <option value="">All Events</option>
                  {events.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      {ev.title}
                    </option>
                  ))}
                </Select>
              </div>

              <div style={S.inputRow}>
                <label style={S.label}>Member</label>
                <Select value={tfMember} onChange={(e) => setTfMember(e.target.value)}>
                  <option value="">All Members</option>
                  <option value="secretary_manager">Secretary/Manager</option>
                  <option value="mc_member">MC Member</option>
                </Select>
              </div>

              <div style={S.inputRow}>
                <label style={S.label}>Gender</label>
                <Select value={tfGender} onChange={(e) => setTfGender(e.target.value)}>
                  <option value="">All Genders</option>
                  <option value="boy">Boys</option>
                  <option value="girl">Girls</option>
                </Select>
              </div>

              <div style={S.inputRow}>
                <label style={S.label}>Search</label>
                <Input placeholder="Name or mobile" value={tfQuery} onChange={(e) => setTfQuery(e.target.value)} />
              </div>
            </div>
          </Modal>
        )}

        {showParticipantPreview && (
          <Modal
            title="Preview Participants"
            onClose={() => setShowParticipantPreview(false)}
            onClear={() => setShowParticipantPreview(false)}
            onApply={confirmAndSaveParticipants}
          >
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", rowGap: 8, columnGap: 12, marginBottom: 12 }}>
              <div style={S.muted}>School Name</div>
              <div>{user?.schoolName || "-"}</div>
              <div style={S.muted}>Contact Person</div>
              <div>{user?.name || user?.fullName || user?.username || "-"}</div>
              <div style={S.muted}>Mobile Number</div>
              <div>{user?.mobile || user?.phone || "-"}</div>
            </div>
            <TableShell columns={[{ label: "Sl No" }, { label: "Event(s)" }, { label: "Group" }, { label: "Name of the Participant" }, { label: "Boy/Girl" }, { label: "Class" }]}>
              {participants.length === 0 ? (
                <tr>
                  <td style={{ ...S.td, textAlign: "center", color: palette.textMuted }} colSpan={6}>No participants</td>
                </tr>
              ) : (
                participants.map((p, idx) => (
                  <tr key={idx}>
                    <td style={S.td}>{idx + 1}</td>
                    <td style={S.td}>{events.find((ev) => ev._id === (p.eventId || p.event))?.title || "-"}</td>
                    <td style={S.td}>{(p.group || "").charAt(0).toUpperCase() + (p.group || "").slice(1)}</td>
                    <td style={S.td}>{p.name}</td>
                    <td style={S.td}>{p.gender === "boy" ? "Boy" : p.gender === "girl" ? "Girl" : "-"}</td>
                    <td style={S.td}>{p.className}</td>
                  </tr>
                ))
              )}
            </TableShell>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, gap: 10 }}>
              <Button onClick={() => setShowParticipantPreview(false)}>Back</Button>
              <Button variant="primary" onClick={confirmAndSaveParticipants} disabled={savingParticipants}>
                {savingParticipants ? "Saving..." : "Confirm & Save"}
              </Button>
            </div>
          </Modal>
        )}
      </DashboardLayout>
    </div>
  );
}
