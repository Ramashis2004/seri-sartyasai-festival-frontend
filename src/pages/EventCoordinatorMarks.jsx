import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { FaClipboardList } from "react-icons/fa";
import ecApi from "../api/eventCoordinatorApi";
import Swal from "sweetalert2";

export default function EventCoordinatorMarks() {
  const [activeTab, setActiveTab] = useState("school");
  const [schoolEvents, setSchoolEvents] = useState([]);
  const [districtEvents, setDistrictEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [participants, setParticipants] = useState([]);
  const [marks, setMarks] = useState({});
  const [schoolOptions, setSchoolOptions] = useState([]); // unique school names for selected event
  const [selectedSchool, setSelectedSchool] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const S = {
    headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    row: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" },
    card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, boxShadow: "0 8px 20px rgba(2,6,23,0.06)" },
    tableWrap: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" },
    table: { width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 14 },
    th: { textAlign: "left", background: "#f8fafc", color: "#475569", fontWeight: 700, padding: "12px 14px", borderBottom: "1px solid #e2e8f0" },
    td: { padding: "12px 14px", borderBottom: "1px solid #e2e8f0", verticalAlign: "top" },
    input: { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none" },
    select: { width: 280, padding: "10px 12px", borderRadius: 10, border: "1px solid #e2e8f0", outline: "none" },
    tabs: { display: "flex", gap: 8 },
    tabBtn: (active) => ({ padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: active ? "#2563eb" : "#fff", color: active ? "#fff" : "#0f172a", fontWeight: 700, cursor: "pointer" }),
    actionRow: { display: "flex", justifyContent: "flex-end", marginTop: 12 },
    btn: (primary=false) => ({ padding: "10px 14px", borderRadius: 10, border: `1px solid ${primary ? "#2563eb" : "#e2e8f0"}`, background: primary ? "#2563eb" : "#fff", color: primary ? "#fff" : "#0f172a", fontWeight: 600, cursor: "pointer" }),
    hint: { color: "#64748b" },
    title: { display: "flex", alignItems: "center", gap: 10, margin: 0 },
  };

  const genderText = (g) => {
    const s = String(g || "").toLowerCase();
    if (["m", "male", "boy"].includes(s)) return "Boy";
    if (["f", "female", "girl"].includes(s)) return "Girl";
    return "";
  };

  const buildConsolidated = async (ignoreSchoolFilter = false) => {
    const evs = activeTab === "school" ? schoolEvents : districtEvents;
    const matrix = new Map();
    for (const ev of (evs || [])) {
      try {
        const arr = await ecApi.ecListParticipants({ scope: activeTab, eventId: ev._id });
        (Array.isArray(arr) ? arr : []).forEach((p) => {
          if (!ignoreSchoolFilter && activeTab === "school" && selectedSchool && String(p.schoolName || "") !== String(selectedSchool)) return;
          const key = `${String(p.name||'').trim().toLowerCase()}|${String(p.schoolName||'').trim().toLowerCase()}|${String(p.districtName||'').trim().toLowerCase()}`;
          if (!matrix.has(key)) {
            matrix.set(key, { name: p.name || "", district: p.districtName || p.district || "", school: p.schoolName || "", events: [] });
          }
          const m = p.marks != null ? String(p.marks) : "";
          matrix.get(key).events.push({ title: ev.title || "", position: evaluate(m) || "" });
        });
      } catch {}
    }
    const rows = Array.from(matrix.values());
    const maxEvents = rows.reduce((mx, r) => Math.max(mx, (r.events || []).length), 0);
    return { rows, maxEvents };
  };

  const downloadCSVAll = async () => {
    const { rows, maxEvents } = await buildConsolidated(true);
    const header = ["Name", "District", "School"]; 
    for (let i = 1; i <= maxEvents; i++) { header.push(`EVENT-${i}`, `POSITION of EVENT-${i}`); }
    const body = rows.map(r => {
      const row = [r.name, r.district, r.school];
      for (let i = 0; i < maxEvents; i++) {
        const cell = r.events[i];
        row.push(cell ? cell.title : "", cell ? cell.position : "");
      }
      return row;
    });
    const lines = [header, ...body].map(arr => arr.map(v => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(","));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const scopeName = activeTab === "school" ? "school" : "district";
    a.download = `consolidated_${scopeName}_events.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadDOCXAll = async () => {
    const { rows, maxEvents } = await buildConsolidated(true);
    try {
      const docx = await import("docx");
      const { saveAs } = await import("file-saver");
      const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun, AlignmentType } = docx;
      const headers = ["Name", "District", "School"]; for (let i = 1; i <= maxEvents; i++) { headers.push(`EVENT-${i}`, `POSITION of EVENT-${i}`); }
      const headerCells = headers.map(t => new TableCell({
        width: { size: Math.max(10, Math.floor(100 / headers.length)), type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })], alignment: AlignmentType.CENTER })],
      }));
      const headerRow = new TableRow({ children: headerCells });
      const bodyRows = rows.map(r => new TableRow({ children: [
        new TableCell({ children: [new Paragraph(String(r.name))] }),
        new TableCell({ children: [new Paragraph(String(r.district))] }),
        new TableCell({ children: [new Paragraph(String(r.school))] }),
        ...Array.from({ length: maxEvents }).flatMap((_, i) => {
          const cell = r.events[i];
          return [
            new TableCell({ children: [new Paragraph(String(cell ? cell.title : ""))] }),
            new TableCell({ children: [new Paragraph(String(cell ? cell.position : ""))] }),
          ];
        })
      ] }));

      const table = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...bodyRows] });
      const title = `Consolidated Report - ${activeTab === "school" ? "School" : "District"}`;
      const doc = new Document({ sections: [{ properties: {}, children: [new Paragraph({ text: title, heading: "Heading1" }), table] }] });
      const blob = await Packer.toBlob(doc);
      const scopeName = activeTab === "school" ? "school" : "district";
      saveAs(blob, `consolidated_${scopeName}_events.docx`);
    } catch (e) {
      alert("Please install docx and file-saver to export DOCX");
    }
  };

  const evaluate = (n) => {
    const v = Number(n);
    if (!Number.isFinite(v)) return "";
    if (v === 0) return "Absent";
    if (v >= 1 && v <= 15) return "Participant";
    if (v >= 16 && v <= 20) return "Good";
    if (v >= 21 && v <= 25) return "Very Good";
    if (v >= 26 && v <= 30) return "Excellent";
    return "";
  };

  const activeEvents = activeTab === "school" ? schoolEvents : districtEvents;
  const selectedEvent = useMemo(() => activeEvents.find((e) => String(e._id) === String(selectedEventId)), [activeEvents, selectedEventId]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingEvents(true);
        const [s, d] = await Promise.all([ecApi.ecListSchoolEvents().catch(() => []), ecApi.ecListDistrictEvents().catch(() => [])]);
        setSchoolEvents(Array.isArray(s) ? s : []);
        setDistrictEvents(Array.isArray(d) ? d : []);
      } finally {
        setLoadingEvents(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setSelectedEventId("");
    setParticipants([]);
    setMarks({});
    setSchoolOptions([]);
    setSelectedSchool("");
  }, [activeTab]);

  const fetchParticipants = async (evId) => {
    if (!evId) { setParticipants([]); setMarks({}); return; }
    try {
      setLoadingParticipants(true);
      const data = await ecApi.ecListParticipants({ scope: activeTab, eventId: evId });
      const arr = Array.isArray(data) ? data : [];
      setParticipants(arr);
      const m = {};
      arr.forEach((p) => { m[p._id] = (p.marks != null && p.marks !== undefined) ? String(p.marks) : ""; });
      setMarks(m);
      if (activeTab === "school") {
        const uniq = Array.from(new Set(arr.map(p => p.schoolName).filter(Boolean)));
        setSchoolOptions(uniq);
        // If only one school present, auto-select it
        setSelectedSchool(prev => prev || (uniq.length === 1 ? uniq[0] : ""));
      } else {
        setSchoolOptions([]);
        setSelectedSchool("");
      }
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleEventChange = (e) => {
    const evId = e.target.value;
    setSelectedEventId(evId);
    fetchParticipants(evId);
  };

  const setMark = (id, value) => {
    const v = value.replace(/[^0-9]/g, "");
    const n = v === "" ? "" : String(Math.max(0, Math.min(30, Number(v))));
    setMarks((prev) => ({ ...prev, [id]: n }));
  };

  const canSubmit = useMemo(() => Object.values(marks).some((v) => v !== ""), [marks]);

  const visibleParticipants = useMemo(() => {
    if (activeTab === "school" && selectedSchool) {
      return (participants || []).filter(p => String(p.schoolName || "") === String(selectedSchool));
    }
    return participants || [];
  }, [participants, activeTab, selectedSchool]);

  // Build report rows from the visible participants
  const reportRows = useMemo(() => {
    return (visibleParticipants || []).map((p, idx) => {
      const m = marks[p._id] ?? (p.marks != null ? String(p.marks) : "");
      return {
        slno: String(idx + 1),
        name: p.name || "",
        district: p.districtName || p.district || "",
        event: selectedEvent?.title || "",
        position: evaluate(m) || "",
        marks: m || "",
        school: p.schoolName || "",
        className: p.className || p.class || "",
      };
    });
  }, [visibleParticipants, marks, selectedEvent]);

  const downloadCSV = () => {
    const header = [
      "Sl.No",
      "Name",
      "District",
      "School",
      "Event",
      "Position",
    ];
    const body = reportRows.map(r => [r.slno, r.name, r.district, r.school, r.event, r.position]);
    const lines = [header, ...body].map(arr => arr.map(v => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(","));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const scopeName = activeTab === "school" ? "school" : "district";
    const evName = (selectedEvent?.title || "event").replace(/\s+/g, "_");
    a.download = `report_${scopeName}_${evName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadDOCX = async () => {
    try {
      const docx = await import("docx");
      const { saveAs } = await import("file-saver");
      const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun, AlignmentType } = docx;

      const headers = ["Sl.No", "Name", "District", "School", "Event", "Position"];
      const headerCells = headers.map(t => new TableCell({
        width: { size: Math.max(10, Math.floor(100 / headers.length)), type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })], alignment: AlignmentType.CENTER })],
      }));
      const headerRow = new TableRow({ children: headerCells });

      const bodyRows = reportRows.map(r => new TableRow({ children: [
        new TableCell({ children: [new Paragraph(String(r.slno))] }),
        new TableCell({ children: [new Paragraph(String(r.name))] }),
        new TableCell({ children: [new Paragraph(String(r.district))] }),
        new TableCell({ children: [new Paragraph(String(r.school))] }),
        new TableCell({ children: [new Paragraph(String(r.event))] }),
        new TableCell({ children: [new Paragraph(String(r.position))] }),
      ] }));

      const table = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...bodyRows] });
      const title = `Report - ${(selectedEvent?.title || "Event")}`;
      const doc = new Document({ sections: [{ properties: {}, children: [new Paragraph({ text: title, heading: "Heading1" }), table] }] });
      const blob = await Packer.toBlob(doc);
      const scopeName = activeTab === "school" ? "school" : "district";
      const evName = (selectedEvent?.title || "event").replace(/\s+/g, "_");
      saveAs(blob, `report_${scopeName}_${evName}.docx`);
    } catch (e) {
      alert("Please install docx and file-saver to export DOCX");
    }
  };

  const handleSubmit = async () => {
    if (!selectedEventId || !canSubmit) return;
    const items = participants
      .filter((p) => marks[p._id] !== "")
      .map((p) => ({ participantId: p._id, marks: Number(marks[p._id]), evaluation: evaluate(marks[p._id]) }));
    try {
      const confirm = await Swal.fire({
        title: "Submit marks?",
        text: `You are about to submit ${items.length} mark(s). This will save evaluations for the selected event.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Submit",
        cancelButtonText: "Cancel",
      });
      if (!confirm.isConfirmed) return;
      setSubmitting(true);
      await ecApi.ecSubmitMarks({ scope: activeTab, eventId: selectedEventId, items });
      setMarks({});
      await fetchParticipants(selectedEventId);
      await Swal.fire({ icon: "success", title: "Marks submitted", timer: 1500, showConfirmButton: false });
    } catch (e) {
      // no-op
    } finally {
      setSubmitting(false);
    }
  };

  const sidebarItems = [
    { key: "marks", label: "Mark Entry", icon: <FaClipboardList /> },
    { key: "judge-sheet", label: "Judge Sheet", icon: <FaClipboardList /> },
  ];

  return (
    <DashboardLayout title="Event Coordinator" sidebarItems={sidebarItems} activeKey="marks" onSelectItem={(key) => {
      if (key === 'judge-sheet') window.location.assign('/event-coordinator/judge-sheet');
    }}>
      <div style={S.card}>
        <div style={{ ...S.headerRow, marginBottom: 16 }}>
          <h3 style={S.title}><FaClipboardList /> Mark Entry</h3>
          <div style={S.tabs}>
            <button style={S.tabBtn(activeTab === "school")} onClick={() => setActiveTab("school")}>Mark Entry for School</button>
            <button style={S.tabBtn(activeTab === "district")} onClick={() => setActiveTab("district")}>Mark Entry for District</button>
          </div>
        </div>

        <div style={{ ...S.row, marginBottom: 12 }}>
          <label style={{ color: "#475569", fontWeight: 600 }}>Select Event</label>
          <select value={selectedEventId} onChange={handleEventChange} style={S.select} disabled={loadingEvents}>
            <option value="">-- Select --</option>
            {(activeEvents || []).map((ev) => (
              <option key={ev._id} value={ev._id}>{ev.title}</option>
            ))}
          </select>
          <div style={S.hint}>{loadingEvents ? "Loading events..." : ""}</div>
        </div>

        {activeTab === "school" && selectedEventId && (
          <div style={{ ...S.row, marginBottom: 12 }}>
            <label style={{ color: "#475569", fontWeight: 600 }}>Select School</label>
            <select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)} style={S.select}>
              <option value="">-- All Schools --</option>
              {schoolOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        )}

        {selectedEvent && (
          <div style={{ marginBottom: 12, color: "#0f172a", fontWeight: 700 }}>Event: {selectedEvent.title}</div>
        )}

        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Event</th>
                <th style={S.th}>Name</th>
                <th style={S.th}>Class</th>
                <th style={S.th}>Boy/Girl</th>
                <th style={S.th}>Present/Absent</th>
                <th style={S.th}>Marks</th>
                <th style={S.th}>Evaluation</th>
              </tr>
            </thead>
            <tbody>
              {!selectedEventId ? (
                <tr><td style={{ ...S.td, textAlign: "center", color: "#64748b" }} colSpan={7}>Select an event to view participants</td></tr>
              ) : loadingParticipants ? (
                <tr><td style={{ ...S.td, textAlign: "center", color: "#64748b" }} colSpan={7}>Loading participants...</td></tr>
              ) : (visibleParticipants || []).length === 0 ? (
                <tr><td style={{ ...S.td, textAlign: "center", color: "#64748b" }} colSpan={7}>No participants found</td></tr>
              ) : (
                (visibleParticipants || []).map((p) => {
                  const m = marks[p._id] ?? "";
                  const e = evaluate(m);
                  return (
                    <tr key={p._id}>
                      <td style={S.td}>{selectedEvent?.title || "-"}</td>
                      <td style={S.td}>{p.name || "-"}</td>
                      <td style={S.td}>{p.className || p.class || "-"}</td>
                      <td style={S.td}>{genderText(p.gender)}</td>
                      <td style={S.td}>{p.present ? "Present" : "Absent"}</td>
                      <td style={S.td}>
                        <input
                          type="number"
                          min={0}
                          max={30}
                          value={m}
                          onChange={(ev) => setMark(p._id, ev.target.value)}
                          style={S.input}
                          placeholder="0-30"
                        />
                      </td>
                      <td style={S.td}>{e}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ ...S.actionRow, gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button style={S.btn(false)} disabled={!selectedEventId || (visibleParticipants || []).length === 0} onClick={downloadCSV}>Generate CSV</button>
            <button style={S.btn(false)} disabled={!selectedEventId || (visibleParticipants || []).length === 0} onClick={downloadDOCX}>Generate DOCX</button>
            <button style={S.btn(false)} onClick={downloadCSVAll}>All Events CSV</button>
            <button style={S.btn(false)} onClick={downloadDOCXAll}>All Events DOCX</button>
          </div>
          <button style={S.btn(true)} disabled={!canSubmit || submitting} onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    </DashboardLayout>
  );
}
