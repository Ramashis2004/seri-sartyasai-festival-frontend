import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { itListParticipants, itUpdateParticipant, itFinalizeParticipants, itListEvents, itListDistrictEvents, itCreateParticipant } from "../api/itAdminApi";
import districtApi from "../api/districtApi";
import Swal from "sweetalert2";
 

export default function ITAdminParticipants() {
  const sidebarItems = [
    { key: "overview", label: "Dashboard" },
    { key: "participants", label: "Participants" },
    { key: "teachers", label: "Accompanying Teacher & Guru" },
  ];

  const [scope, setScope] = useState("all");
  const [districtId, setDistrictId] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [eventId, setEventId] = useState("");
  const [present, setPresent] = useState("");
  const [frozen, setFrozen] = useState("");
  const [gender, setGender] = useState("");
  const [group, setGroup] = useState("");
  const [q, setQ] = useState("");

  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [events, setEvents] = useState([]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Add Participant modal state
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState(""); // '' | 'school' | 'district'
  const [addDistrictId, setAddDistrictId] = useState("");
  const [addSchoolId, setAddSchoolId] = useState("");
  const [addSchoolName, setAddSchoolName] = useState("");
  const [addEventId, setAddEventId] = useState("");
  const [addName, setAddName] = useState("");
  const [addGender, setAddGender] = useState("");
  const [addClassName, setAddClassName] = useState("");
  const [addGroup, setAddGroup] = useState(""); // junior|senior for school
  const [modalSchools, setModalSchools] = useState([]);
  const [modalEvents, setModalEvents] = useState([]);
  const [computingEvents, setComputingEvents] = useState(false);
  const [anchorId, setAnchorId] = useState("");

  // Initialize filters from query string (supports links from Overview)
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const maybe = (k) => sp.get(k);
    const setIf = (val, setter) => { if (val !== null && typeof val !== 'undefined') setter(val); };
    setIf(maybe('scope'), setScope);
    setIf(maybe('districtId'), setDistrictId);
    setIf(maybe('schoolName'), setSchoolName);
    setIf(maybe('eventId'), setEventId);
    setIf(maybe('present'), setPresent);
    setIf(maybe('frozen'), setFrozen);
    setIf(maybe('gender'), setGender);
    setIf(maybe('group'), setGroup);
    setIf(maybe('q'), setQ);
  }, []);

  const loadFilters = useEffect(() => {
    (async () => {
      try {
        const d = await districtApi.getAllDistricts();
        setDistricts(d || []);
      } catch { setDistricts([]); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!districtId) { setSchools([]); return; }
      try {
        const s = await districtApi.getAllSchools({ districtId });
        setSchools(s || []);
      } catch { setSchools([]); }
    })();
  }, [districtId]);

  useEffect(() => {
    (async () => {
      try {
        // Admin events: union of school + district events for filtering convenience
        const [schoolEvents, districtEvents] = await Promise.all([
          itListEvents().catch(() => []),
          itListDistrictEvents().catch(() => []),
        ]);
        setEvents([
          ...schoolEvents.map((e) => ({ _id: e._id, title: e.title, source: "school" })),
          ...districtEvents.map((e) => ({ _id: e._id, title: e.title, source: "district" })),
        ]);
      } catch { setEvents([]); }
    })();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await itListParticipants({ scope, districtId, schoolName, eventId, present, frozen, gender, group, q });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItems([]);
      setError(e?.response?.data?.message || "Failed to load participants");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [scope, districtId, schoolName, eventId, present, frozen, gender, group, q]);

  useEffect(() => {
    if (!anchorId) return;
    // Defer to allow DOM to render
    const t = setTimeout(() => {
      const el = document.getElementById(`row-${anchorId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
    return () => clearTimeout(t);
  }, [items, anchorId]);

  const onTogglePresent = async (row) => {
    if (row.frozen) return;
    try {
      setAnchorId(String(row._id));
      await itUpdateParticipant(row._id, { source: row.source, updates: { present: !row.present } });
      await load();
    } catch {}
  };

  const onEdit = async (row) => {
  const prevGender = (row.gender || "").toLowerCase();
  const { value: formValues } = await Swal.fire({
    title: "Edit Participant",
    html: `
      <input id="swal-name" class="swal2-input" placeholder="Name" value="${row.name || ""}">
      <input id="swal-class" class="swal2-input" placeholder="Class" value="${row.className || ""}">

      <div style="text-align:left; margin-top:10px;margin-left:82px">
        <label><strong>Gender:</strong></label>

        <label style="margin-right:15px;">
          <input type="radio" name="swal-gender" value="boy" 
            ${row.gender === "boy" ? "checked" : ""}> Boy
        </label>

        <label>
          <input type="radio" name="swal-gender" value="girl" 
            ${row.gender === "girl" ? "checked" : ""}> Girl
        </label>
      </div>
    `,
    focusConfirm: false,
    showCloseButton: true,
    showCancelButton: true,
    cancelButtonText: "Close",

    preConfirm: () => ({
      name: document.getElementById("swal-name").value,
      className: document.getElementById("swal-class").value,
      gender: (document.querySelector('input[name="swal-gender"]:checked')?.value || "").toLowerCase()
    })
  });

  if (!formValues) return;

  try {
    setAnchorId(String(row._id));
    const resp = await itUpdateParticipant(row._id, { source: row.source, updates: formValues });
    const updated = resp?.participant ? { ...row, ...resp.participant } : { ...row, ...formValues };
    setItems((prev) => (prev || []).map((it) => (
      String(it._id) === String(row._id) ? { ...it, ...updated } : it
    )));
    await load();
    const newGender = (formValues.gender || "").toLowerCase();
    const genderFilter = (gender || "").toLowerCase();
    if (newGender !== prevGender && genderFilter && genderFilter !== newGender) {
      await Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Participant updated. It may no longer be visible due to the current Gender filter.",
        timer: 2200,
        showConfirmButton: false
      });
    } else {
      await Swal.fire({ icon: "success", title: "Updated", timer: 1500, showConfirmButton: false });
    }
  } catch (e) {
    const msg = e?.response?.data?.message || "Failed to update participant";
    await Swal.fire({ icon: "error", title: "Update failed", text: msg });
  }
};

  const onFreeze = async (freeze) => {
    const ok = await Swal.fire({ title: freeze ? "Freeze participants?" : "Unfreeze participants?", icon: "question", showCancelButton: true, confirmButtonText: freeze ? "Freeze" : "Unfreeze" });
    if (!ok.isConfirmed) return;
    try {
      await itFinalizeParticipants({ scope, eventId, districtId, schoolName, freeze });
      await load();
    } catch {}
  };

  const onToggleFreezeRow = async (row) => {
    try {
      setAnchorId(String(row._id));
      await itUpdateParticipant(row._id, { source: row.source, updates: { frozen: !row.frozen } });
      await load();
    } catch {}
  };

  const resetFilters = () => {
    setScope("all");
    setDistrictId("");
    setSchoolName("");
    setEventId("");
    setPresent("");
    setFrozen("");
    setGender("");
    setGroup("");
    setQ("");
  };

  const filtered = useMemo(() => items, [items]);

  const toCSV = () => {
    const header = [
      "Sl.No",
      "District",
      "School",
      "Name",
      "Gender",
      "Class",
      "Event",
      "Group",
      "Present",
      "Frozen",
    ];
    const body = filtered.map((r, i) => [
      String(i + 1),
      r.name || "",
      r.className || "",
      r.gender || "",
      r.eventTitle || "",
      r.source === "school" ? (r.group || "-") : "-",
      r.schoolName || "",
      r.districtName || "",
      r.present ? "Yes" : "No",
      r.frozen ? "Yes" : "No",
    ]);
    const lines = [header, ...body].map(arr => arr.map(v => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(","));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participants_list.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toPDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const headers = [
        "Sl.No",
        "Name",
        "Class",
        "Gender",
        "Event",
        "Group",
        "School",
        "District",
        "Present",
        "Frozen",
      ];
      const body = filtered.map((r, i) => [
        String(i + 1),
        r.name || "",
        r.className || "",
        r.gender || "",
        r.eventTitle || "",
        r.source === "school" ? (r.group || "-") : "-",
        r.schoolName || "",
        r.districtName || "",
        r.present ? "Yes" : "No",
        r.frozen ? "Yes" : "No",
      ]);
      doc.setFontSize(14);
      doc.text("Participants", 40, 32);
      autoTable(doc, {
        head: [headers],
        body,
        startY: 48,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [71, 85, 105] },
      });
      doc.save("participants_list.pdf");
    } catch (e) {
      alert("Please install jspdf and jspdf-autotable to export PDF");
    }
  };

  const toDOCX = async () => {
    try {
      const docx = await import("docx");
      const { saveAs } = await import("file-saver");
      const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun, AlignmentType } = docx;

      const headers = [
        "Sl.No", "Name", "Class", "Gender", "Event", "Group", "School", "District", "Present", "Frozen"
      ];
      const headerCells = headers.map(t => new TableCell({
        width: { size: Math.max(10, Math.floor(100 / headers.length)), type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })], alignment: AlignmentType.CENTER })],
      }));
      const headerRow = new TableRow({ children: headerCells });

      const bodyRows = filtered.map((r, i) => new TableRow({ children: [
        new TableCell({ children: [new Paragraph(String(i + 1))] }),
        new TableCell({ children: [new Paragraph(String(r.name || ""))] }),
        new TableCell({ children: [new Paragraph(String(r.className || ""))] }),
        new TableCell({ children: [new Paragraph(String(r.gender || ""))] }),
        new TableCell({ children: [new Paragraph(String(r.eventTitle || ""))] }),
        new TableCell({ children: [new Paragraph(String(r.source === "school" ? (r.group || "-") : "-"))] }),
        new TableCell({ children: [new Paragraph(String(r.schoolName || ""))] }),
        new TableCell({ children: [new Paragraph(String(r.districtName || ""))] }),
        new TableCell({ children: [new Paragraph(String(r.present ? "Yes" : "No"))] }),
        new TableCell({ children: [new Paragraph(String(r.frozen ? "Yes" : "No"))] }),
      ] }));

      const table = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...bodyRows] });
      const doc = new Document({ sections: [{ properties: {}, children: [new Paragraph({ text: "Participants", heading: "Heading1" }), table] }] });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, "participants_list.docx");
    } catch (e) {
      alert("Please install docx and file-saver to export DOCX");
    }
  };

  // Modal helpers
  const resetAddForm = () => {
    setAddType("");
    setAddDistrictId("");
    setAddSchoolId("");
    setAddSchoolName("");
    setAddEventId("");
    setAddName("");
    setAddGender("");
    setAddClassName("");
    setAddGroup("");
    setModalSchools([]);
    setModalEvents([]);
    setComputingEvents(false);
  };

  useEffect(() => {
    (async () => {
      if (!showAdd) return;
      if (!addDistrictId) { setModalSchools([]); return; }
      try {
        const s = await districtApi.getAllSchools({ districtId: addDistrictId });
        setModalSchools(Array.isArray(s) ? s : []);
      } catch { setModalSchools([]); }
    })();
  }, [showAdd, addDistrictId]);

  useEffect(() => {
    (async () => {
      if (!showAdd) return;
      setModalEvents([]);
      setComputingEvents(true);
      try {
        if (addType === "school") {
          if (!addDistrictId || !addSchoolId) { setComputingEvents(false); return; }
          const all = Array.isArray(await itListEvents()) ? await itListEvents() : [];
          const schoolObj = (modalSchools || []).find((s) => String(s._id) === String(addSchoolId));
          const sName = schoolObj?.schoolName || addSchoolName || "";
          setAddSchoolName(sName);
          const existing = Array.isArray(await itListParticipants({ scope: 'school', districtId: addDistrictId, schoolName: sName })) ? await itListParticipants({ scope: 'school', districtId: addDistrictId, schoolName: sName }) : [];
          const countsByEvent = existing.reduce((acc, p) => {
            const id = String(p.eventId || p.event || p._id || "");
            if (!id) return acc;
            acc[id] = (acc[id] || 0) + 1;
            return acc;
          }, {});
          const filledEventIds = new Set(existing.map((p) => String(p.eventId || p.event || p._id)));
          const available = all.filter((e) => {
            const id = String(e._id);
            // If no participant yet, event is available
            if (!filledEventIds.has(id)) return true;
            // For group events, allow selection until participantCount is reached
            const isGroup = !!e.isGroupEvent && typeof e.participantCount === 'number' && e.participantCount >= 2;
            if (isGroup) {
              const used = countsByEvent[id] || 0;
              return used < e.participantCount;
            }
            // Non-group events remain one-participant only
            return false;
          });
          setModalEvents(available);
        } else if (addType === "district") {
          if (!addDistrictId) { setComputingEvents(false); return; }
          const all = Array.isArray(await itListDistrictEvents()) ? await itListDistrictEvents() : [];
          const existing = Array.isArray(await itListParticipants({ scope: 'district', districtId: addDistrictId })) ? await itListParticipants({ scope: 'district', districtId: addDistrictId }) : [];
          const filledEventIds = new Set(existing.map((p) => String(p.eventId || p.event || p._id)));
          const available = all.filter((e) => !filledEventIds.has(String(e._id)));
          setModalEvents(available);
        }
      } catch { setModalEvents([]); }
      finally { setComputingEvents(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAdd, addType, addDistrictId, addSchoolId]);

  // Auto-select audience (Junior/Senior) based on selected event metadata or title
  useEffect(() => {
    if (!showAdd) return;
    if (addType !== 'school') { setAddGroup(''); return; }
    if (!addEventId) return;
    const ev = (modalEvents || []).find((e) => String(e._id) === String(addEventId));
    if (!ev) return;
    const meta = (
      ev.group || ev.audience || ev.category || ev.type || ev.level || ev.ageGroup || ev.for || ''
    );
    const metaLower = String(meta).toLowerCase();
    const titleLower = String(ev.title || ev.name || '').toLowerCase();
    let detected = '';
    if (metaLower.includes('junior') || titleLower.includes('junior')) detected = 'junior';
    else if (metaLower.includes('senior') || titleLower.includes('senior')) detected = 'senior';
    if (detected && detected !== addGroup) setAddGroup(detected);
  }, [showAdd, addType, addEventId, modalEvents]);

  const submitAdd = async (e) => {
    e?.preventDefault?.();
    if (!addType) { alert('Please select Participant Type'); return; }
    if (!addDistrictId) { alert('Please select District'); return; }
    if (addType === 'school' && !addSchoolId) { alert('Please select School'); return; }
    if (!addEventId) { alert('Please select Event'); return; }
    if (!addName || !addGender || !addClassName || (addType === 'school' && !addGroup)) { alert('Please fill all participant details'); return; }
    try {
      const districtObj = (districts || []).find((d) => String(d._id) === String(addDistrictId));
      const districtNameLabel = districtObj?.districtName || "";
      const schoolObj = (modalSchools || []).find((s) => String(s._id) === String(addSchoolId));
      const schoolNameLabel = schoolObj?.schoolName || addSchoolName || "";
      await itCreateParticipant({
        source: addType === 'school' ? 'school' : 'district',
        eventId: addEventId,
        name: addName,
        className: String(addClassName).trim(),
        gender: String(addGender).toLowerCase(),
        ...(addType === 'school' ? { group: String(addGroup).toLowerCase() } : {}),
        districtId: addDistrictId,
        ...(addType === 'school' ? { schoolName: schoolNameLabel } : {}),
      });
      setShowAdd(false);
      resetAddForm();
      await load();
      await Swal.fire({ icon: 'success', title: 'Added', timer: 1500, showConfirmButton: false });
    } catch (e) {
      const raw = e?.response?.data;
      const status = e?.response?.status;
      const msg = (raw && (raw.message || raw.error || JSON.stringify(raw))) || e?.message || 'Failed to add participant';
      await Swal.fire({ icon: 'error', title: 'Add failed', text: `${msg}${status ? ` (HTTP ${status})` : ''}` });
    }
  };

  return (
    <DashboardLayout
      title="IT Admin Dashboard"
      sidebarItems={sidebarItems}
      activeKey="participants"
      onSelectItem={(key) => window.location.assign(`/it-admin/${key}`)}
    >
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 8 }}>
          <select value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="all">School / District</option>
            <option value="school">School</option>
            <option value="district">District</option>
          </select>
          <select value={districtId} onChange={(e) => setDistrictId(e.target.value)}>
            <option value="">All Districts</option>
            {districts.map((d) => <option key={d._id} value={d._id}>{d.districtName}</option>)}
          </select>
          <select value={schoolName} onChange={(e) => setSchoolName(e.target.value)} disabled={!districtId}>
            <option value="">All Schools</option>
            {schools.map((s) => <option key={s._id} value={s.schoolName}>{s.schoolName}</option>)}
          </select>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">All Events</option>
            {events.map((ev) => <option key={`${ev.source}_${ev._id}`} value={ev._id}>{ev.title}</option>)}
          </select>
          <select value={present} onChange={(e) => setPresent(e.target.value)}>
            <option value="">Attendance</option>
            <option value="true">Present</option>
            <option value="false">Absent</option>
          </select>
          <select value={frozen} onChange={(e) => setFrozen(e.target.value)}>
            <option value="">Status</option>
            <option value="true">Frozen</option>
            <option value="false">Not Frozen</option>
          </select>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Gender</option>
            <option value="boy">Boys</option>
            <option value="girl">Girls</option>
          </select>
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            <option value="">Audience</option>
            <option value="junior">Junior</option>
            <option value="senior">Senior</option>
          </select>
          <input placeholder="Search name/class" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={() => { resetAddForm(); setShowAdd(true); }} className="btn" style={{ backgroundColor: '#2563eb', color: 'white' }}>Add Participant</button>
          <button onClick={toCSV} className="btn">Download CSV</button>
          <button onClick={toPDF} className="btn">Download PDF</button>
          <button onClick={toDOCX} className="btn">Download DOCX</button>
          <button onClick={resetFilters} className="btn" style={{ backgroundColor: '#ef4444', color: 'white' }}>Reset Filters</button>
        </div>

        {loading ? <p>Loading...</p> : error ? <p style={{ color: '#dc2626', fontWeight: 600 }}>{error}</p> : (
          <div className="table-wrapper">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>District</th>
                  <th>School</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Class</th>
                  <th>Event</th>
                  <th>Group</th>
                  <th>Present</th>
                  <th>Frozen</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? filtered.map((r, i) => (
                  <tr key={r._id} id={`row-${r._id}`} style={{ backgroundColor: r.present ? '#b5d6a7' : 'transparent' }}>
                    <td>{i + 1}</td>
                    <td>{r.districtName || '-'}</td>
                    <td>{r.schoolName || "-"}</td>
                    <td>{r.name}</td>
                    <td>{r.gender==="boy"?"Boy":"Girl" || "-"}</td>
                    <td>{r.className || "-"}</td>
                    <td>{r.eventTitle || '-'}</td>
                    <td>{r.source === "school" ? (r.group==="senior"?"Senior":"Junior" || "-") : "-"}</td>
                    <td>
                      <input type="checkbox" checked={!!r.present} disabled={!!r.frozen} onChange={() => onTogglePresent(r)} />
                    </td>
                    <td>
                      <input type="checkbox" checked={!!r.frozen} onChange={() => onToggleFreezeRow(r)} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
  onClick={() => onEdit(r)}
  disabled={!!r.frozen}
  style={{
    fontSize: "13px",
    marginLeft: "6px",
    background: "white",
    color: "#0077b6",
    textDecoration: "none",
    fontWeight: "bold",
    borderRadius: "6px",
    transition: "0.3s",
    cursor: "pointer",
  }}
>
  Edit
</button>

                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={11} style={{ textAlign: "center", color: '#475569' }}>No participants match the current filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {showAdd && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
            <div style={{ background: '#ffffff', borderRadius: 16, width: 'min(720px, 96vw)', maxHeight: '90vh', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
              <div style={{ padding: 20, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>Add Participant</h3>
                <button onClick={() => { setShowAdd(false); }} style={{ background: 'transparent', border: 'none', color: '#0ea5e9', fontWeight: 600, cursor: 'pointer' }}>Close</button>
              </div>
              <form onSubmit={submitAdd}>
                <div style={{ padding: 20, display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                  <div style={{ display: 'grid', gap: 6 }}>
                    <label style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>Participant Type</label>
                    <select value={addType} onChange={(e) => { setAddType(e.target.value); setAddEventId(""); }} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}>
                      <option value="">Select type</option>
                      <option value="school">School</option>
                      <option value="district">District</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gap: 6 }}>
                    <label style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>Select District</label>
                    <select value={addDistrictId} onChange={(e) => { setAddDistrictId(e.target.value); setAddSchoolId(""); setAddEventId(""); }} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}>
                      <option value="">Select district</option>
                      {districts.map((d) => (
                        <option key={d._id} value={d._id}>{d.districtName}</option>
                      ))}
                    </select>
                  </div>

                  {addType === 'school' && (
                    <div style={{ display: 'grid', gap: 6 }}>
                      <label style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>Select School</label>
                      <select value={addSchoolId} onChange={(e) => { setAddSchoolId(e.target.value); setAddEventId(""); }} disabled={!addDistrictId} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', background: !addDistrictId ? '#f1f5f9' : 'white' }}>
                        <option value="">Select school</option>
                        {modalSchools.map((s) => (
                          <option key={s._id} value={s._id}>{s.schoolName}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {(addType === 'district' || (addType === 'school' && addSchoolId)) && (
                    <div style={{ display: 'grid', gap: 6 }}>
                      <label style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>Select Event</label>
                      <select value={addEventId} onChange={(e) => setAddEventId(e.target.value)} disabled={computingEvents} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', background: computingEvents ? '#f1f5f9' : 'white' }}>
                        <option value="">{computingEvents ? 'Loading events...' : 'Select event'}</option>
                        {modalEvents.map((ev) => (
                          <option key={ev._id} value={ev._id}>{ev.title}</option>
                        ))}
                      </select>
                      {!computingEvents && modalEvents.length === 0 && (addType ? <small style={{ color: '#64748b' }}>No available events</small> : null)}
                    </div>
                  )}

                  {!!addEventId && (
                    <>
                      {addType === 'school' && (
                        <div style={{ display: 'grid', gap: 6 }}>
                          <label style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>Junior or Senior</label>
                          <select value={addGroup} onChange={(e) => setAddGroup(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}>
                            <option value="">Select audience</option>
                            <option value="junior">Junior</option>
                            <option value="senior">Senior</option>
                          </select>
                        </div>
                      )}
                      <div style={{ display: 'grid', gap: 6 }}>
                        <label style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>Name</label>
                        <input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Participant name" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'grid', gap: 6 }}>
                        <label style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>Boy or Girl</label>
                        <select value={addGender} onChange={(e) => setAddGender(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}>
                          <option value="">Select gender</option>
                          <option value="boy">Boy</option>
                          <option value="girl">Girl</option>
                        </select>
                      </div>
                      <div style={{ display: 'grid', gap: 6 }}>
                        <label style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>Class</label>
                        <select value={addClassName} onChange={(e) => setAddClassName(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}>
                          <option value="">Select class</option>
                          <option value="6">6</option>
                          <option value="7">7</option>
                          <option value="8">8</option>
                          <option value="9">9</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
                <div style={{ padding: 16, borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button type="button" className="btn" onClick={() => { setShowAdd(false); }} style={{ background: 'white', border: '1px solid #e2e8f0' }}>Cancel</button>
                  <button type="submit" className="btn" style={{ backgroundColor: '#16a34a', color: 'white' }}>Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
