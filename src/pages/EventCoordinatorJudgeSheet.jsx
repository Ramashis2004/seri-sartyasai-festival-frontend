import React, { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { FaClipboardList, FaPrint, FaFileCsv } from "react-icons/fa";
import ecApi, { ecGetEvaluationFormat } from "../api/eventCoordinatorApi";

export default function EventCoordinatorJudgeSheet() {
  const [scope, setScope] = useState("school"); // 'school' | 'district'
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [participants, setParticipants] = useState([]);
  const [evalFormat, setEvalFormat] = useState({ criteria: [] });
  const [loading, setLoading] = useState(false);
  const printRef = useRef(null);

  // Header meta inputs
  const [coordinator1, setCoordinator1] = useState("");
  const [coordinator2, setCoordinator2] = useState("");
  const [judge1, setJudge1] = useState("");
  const [judge2, setJudge2] = useState("");
  const [judge3, setJudge3] = useState("");
  const [eventDates, setEventDates] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = scope === "district" ? await ecApi.ecListDistrictEvents() : await ecApi.ecListSchoolEvents();
        setEvents(Array.isArray(list) ? list : []);
        setEventId("");
        setEventTitle("");
        setParticipants([]);
        setEvalFormat({ criteria: [] });
      } finally {
        setLoading(false);
      }
    })();
  }, [scope]);

  const onSelectEvent = async (id) => {
    setEventId(id);
    const ev = (events || []).find((e) => String(e._id) === String(id));
    setEventTitle(ev?.title || "");
    if (!id) { setParticipants([]); setEvalFormat({ criteria: [] }); return; }
    try {
      setLoading(true);
      const [pts, fmt] = await Promise.all([
        ecApi.ecListParticipants({ scope, eventId: id }).catch(() => []),
        ecGetEvaluationFormat({ scope, eventId: id }).catch(() => ({ criteria: [] })),
      ]);
      setParticipants(Array.isArray(pts) ? pts : []);
      setEvalFormat(fmt && fmt.criteria ? fmt : { criteria: [] });
    } finally { setLoading(false); }
  };

  const totalMax = useMemo(() => (evalFormat?.criteria || []).reduce((s, c) => s + (Number(c.maxMarks) || 0), 0), [evalFormat]);

  const genderText = (g) => {
    const s = String(g || "").toLowerCase();
    if (["m", "male", "boy"].includes(s)) return "Boy";
    if (["f", "female", "girl"].includes(s)) return "Girl";
    return "";
  };

  const sidebarItems = [
    { key: "marks", label: "Mark Entry", icon: <FaClipboardList /> },
    { key: "judge-sheet", label: "Judge Sheet", icon: <FaClipboardList /> },
  ];

  const exportCSV = () => {
    if (!eventId) return;
    const baseHeaders = ["Sl. No.", "District"]; if (scope === 'school') baseHeaders.push("School");
    const headers = [
      ...baseHeaders,
      "Name of the participant",
      "Boy/Girl",
      "Class",
      "Present/Absent",
      ...((evalFormat?.criteria||[]).map(c => `${c.label} (${Number(c.maxMarks)||''})`)),
      `Total (${totalMax})`,
    ];
    const rows = (participants || []).map((p, i) => {
      const base = [String(i+1), p.districtName || ""]; if (scope === 'school') base.push(p.schoolName || "");
      base.push(p.name || "", genderText(p.gender), p.className || p.class || "", p.present ? 'Present' : 'Absent');
      const crit = (evalFormat?.criteria || []).map(() => "");
      const total = "";
      return [...base, ...crit, total];
    });
    const scopeName = scope === 'school' ? 'School' : 'District';
    const headerMetaRows = [
      ["AUM SRI SAIRAM"],
      ["STATE FESTIVAL OF JOY - 2025"],
      [eventTitle || 'Event Name'],
      [eventDates || 'Event Dates'],
      [`Event Category: ${scopeName}`],
      [
        `Coordinator 1: ${coordinator1 || ''}`
      ],
      [
        `Coordinator 2: ${coordinator2 || ''}`
      ],
      [
        `Name of Judge 1: ${judge1 || ''}`
      ],
      [
        `Name of Judge 2: ${judge2 || ''}`
      ],
      [
        `Name of Judge 3: ${judge3 || ''}`
      ],
      [
        `Date: ${eventDates || ''}`
      ],
      [""],
    ];

    const lines = [...headerMetaRows, headers, ...rows].map(arr => arr.map(v => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
    }).join(","));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Judge_Sheet_${scopeName}_${(eventTitle||'Event').replace(/\s+/g,'_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPDF = () => {
    if (!printRef.current) return;
    window.print();
  };

  const downloadPDF = async () => {
    if (!eventId) return;
    try {
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default; // plugin function

      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

      const center = (text, y, style={}) => {
        doc.setFontSize(style.size || 12);
        if (style.bold) doc.setFont(undefined, 'bold'); else doc.setFont(undefined, 'normal');
        const width = doc.getTextWidth(text);
        const x = (doc.internal.pageSize.getWidth() - width) / 2;
        doc.text(text, x, y);
      };

      // Header block
      center('AUM SRI SAIRAM', 40, { size: 14, bold: true });
      center('STATE FESTIVAL OF JOY - 2025', 60, { size: 14, bold: true });
      center(eventTitle || 'Event Name', 80, { size: 13, bold: true });
      center(eventDates || 'Event Dates', 98, { size: 11 });
      center(`Event Category: ${scope === 'school' ? 'School' : 'District'}`, 116, { size: 11 });

      const leftYStart = 140;
      const lineGap = 18;
      doc.setFontSize(11);
      doc.text(`Coordinator 1: ${coordinator1 || ''}`, 40, leftYStart);
      doc.text(`Coordinator 2: ${coordinator2 || ''}`, 40, leftYStart + lineGap);
      doc.text(`Name of Judge 1: ${judge1 || ''}`, 40, leftYStart + lineGap*2);
      doc.text(`Name of Judge 2: ${judge2 || ''}`, 40, leftYStart + lineGap*3);
      doc.text(`Name of Judge 3: ${judge3 || ''}`, 40, leftYStart + lineGap*4);
      doc.text(`Date: ${eventDates || ''}`, 40, leftYStart + lineGap*5);

      // Table data
      const columns = [
        { header: 'Sl. No.', dataKey: 'sl' },
        { header: 'District', dataKey: 'district' },
      ];
      if (scope === 'school') columns.push({ header: 'School', dataKey: 'school' });
      columns.push({ header: 'Name of the participant', dataKey: 'name' });
      columns.push({ header: 'Boy/Girl', dataKey: 'gender' });
      columns.push({ header: 'Class', dataKey: 'className' });
      columns.push({ header: 'Present/Absent', dataKey: 'present' });
      (evalFormat?.criteria || []).forEach((c, idx) => {
        columns.push({ header: `${c.label} (${Number(c.maxMarks)||''})`, dataKey: `c_${idx}` });
      });
      columns.push({ header: `Total (${totalMax})`, dataKey: 'total' });

      const body = (participants || []).map((p, i) => {
        const row = {
          sl: String(i+1),
          district: p.districtName || p.district || '',
          name: p.name || '',
          gender: genderText(p.gender),
          className: p.className || p.class || '',
          present: p.present ? 'Present' : 'Absent',
          total: '',
        };
        if (scope === 'school') row.school = p.schoolName || '';
        (evalFormat?.criteria || []).forEach((c, idx) => { row[`c_${idx}`] = ''; });
        return row;
      });

      const startY = leftYStart + lineGap*6 + 10;
      autoTable(doc, {
        startY,
        head: [columns.map(c => c.header)],
        body: body.map(r => columns.map(c => r[c.dataKey] ?? '')),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [248, 250, 252], textColor: 30, lineWidth: 0.5 },
        theme: 'grid',
        tableWidth: 'auto',
      });

      const pageH = doc.internal.pageSize.getHeight();
      const signY = doc.lastAutoTable ? (doc.lastAutoTable.finalY + 40) : (startY + 40);
      doc.text('Signature of Judge - 1', 140, Math.min(signY, pageH - 40));
      doc.text('Signature of Judge - 2', 290, Math.min(signY, pageH - 40));
      doc.text('Signature of Judge - 3', 440, Math.min(signY, pageH - 40));
      doc.text('Signature of Coordinators', 140, Math.min(signY + 40, pageH - 20));
      doc.text('Signature of IT-incharge after mark entry', 380, Math.min(signY + 40, pageH - 20));

      const scopeName = scope === 'school' ? 'School' : 'District';
      doc.save(`Judge_Sheet_${scopeName}_${(eventTitle||'Event').replace(/\s+/g,'_')}.pdf`);
    } catch (e) {
      alert('Please install jspdf and jspdf-autotable to enable PDF export');
    }
  };

  const tableHeader = (
    <thead>
      <tr>
        <th style={TH}>Sl. No.</th>
        <th style={TH}>District</th>
        {scope === 'school' && <th style={TH}>School</th>}
        <th style={TH}>Name of the participant</th>
        <th style={TH}>Boy/Girl</th>
        <th style={TH}>Class</th>
        <th style={TH}>Present/Absent</th>
        {(evalFormat?.criteria || []).map((c, idx) => (
          <th key={idx} style={TH}>{c.label}<div style={{ fontSize: 12, color: '#64748b' }}>{Number(c.maxMarks) || ''}</div></th>
        ))}
        <th style={TH}>Total<div style={{ fontSize: 12, color: '#64748b' }}>{totalMax}</div></th>
      </tr>
    </thead>
  );

  return (
    <DashboardLayout title="Event Coordinator" sidebarItems={sidebarItems} activeKey="judge-sheet" onSelectItem={(key) => {
      if (key === 'marks') window.location.assign('/event-coordinator/marks');
    }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><FaClipboardList /> Judge Sheet</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={exportCSV}><FaFileCsv />&nbsp;Download CSV</button>
            <button className="btn" onClick={downloadPDF}><FaPrint />&nbsp;Download PDF</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button className={`btn ${scope === 'school' ? 'primary' : ''}`} onClick={() => setScope('school')}>School Events</button>
          <button className={`btn ${scope === 'district' ? 'primary' : ''}`} onClick={() => setScope('district')}>District Events</button>
          <select value={eventId} onChange={(e) => onSelectEvent(e.target.value)} className="input" style={{ minWidth: 260 }} disabled={loading}>
            <option value="">-- Select Event --</option>
            {(events || []).map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ textAlign: 'center', fontWeight: 800, color: '#0f766e' }}>AUM SRI SAIRAM</div>
            <div style={{ textAlign: 'center', fontWeight: 800 }}>STATE FESTIVAL OF JOY - 2025</div>
            <div style={{ textAlign: 'center', fontWeight: 700 }}>{eventTitle || 'Event Name'}</div>
            <div style={{ textAlign: 'center', color: '#64748b' }}>{eventDates || 'Event Dates'}</div>
            <div style={{ textAlign: 'center', color: '#64748b' }}>Event Category: {scope === 'school' ? 'School' : 'District'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 8, marginTop: 8 }}>
              <div style={{ fontWeight: 600 }}>Coordinator 1</div>
              <input className="input" value={coordinator1} onChange={(e) => setCoordinator1(e.target.value)} placeholder="Type name" />
              <div style={{ fontWeight: 600 }}>Coordinator 2</div>
              <input className="input" value={coordinator2} onChange={(e) => setCoordinator2(e.target.value)} placeholder="Type name" />
              <div style={{ fontWeight: 600 }}>Name of Judge 1</div>
              <input className="input" value={judge1} onChange={(e) => setJudge1(e.target.value)} placeholder="Type name" />
              <div style={{ fontWeight: 600 }}>Name of Judge 2</div>
              <input className="input" value={judge2} onChange={(e) => setJudge2(e.target.value)} placeholder="Type name" />
              <div style={{ fontWeight: 600 }}>Name of Judge 3</div>
              <input className="input" value={judge3} onChange={(e) => setJudge3(e.target.value)} placeholder="Type name" />
              <div style={{ fontWeight: 600 }}>Date</div>
              <input className="input" value={eventDates} onChange={(e) => setEventDates(e.target.value)} placeholder="e.g., 24th & 25th December, 2025" />
            </div>
          </div>

          <div ref={printRef} className="card" style={{ padding: 12 }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="styled-table">
                {tableHeader}
                <tbody>
                  {!eventId ? (
                    <tr><td colSpan={7 + (evalFormat?.criteria||[]).length + 1} style={{ textAlign: 'center', color: '#64748b' }}>Select an event to generate the judge sheet.</td></tr>
                  ) : (participants || []).length === 0 ? (
                    <tr><td colSpan={7 + (evalFormat?.criteria||[]).length + 1} style={{ textAlign: 'center', color: '#64748b' }}>No participants available.</td></tr>
                  ) : (
                    (participants || [])
                    .filter(p => p.present === true)     // 🔥 Only present participants
                    .map((p, i) => (
                      <tr key={p._id}>
                        <td>{i + 1}</td>
                        <td>{p.districtName || p.district || ''}</td>
                        {scope === 'school' && <td>{p.schoolName || ''}</td>}
                        <td>{p.name || ''}</td>
                        <td>{genderText(p.gender)}</td>
                        <td>{p.className || p.class || ''}</td>
                        <td>{p.present ? 'Present' : 'Absent'}</td>
                        {(evalFormat?.criteria || []).map((c, idx) => (
                          <td key={idx}></td>
                        ))}
                        <td></td>
                      </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 32 }}>
             <div
  style={{
    display: "flex",
    justifyContent: "space-around",
    marginTop: 20,
    color: "#64748b",
  }}
>
  <div style={{ textAlign: "center" }}>
    <div style={{ borderTop: "1px solid #e5e7eb", width: 150, margin: "0 auto" }}></div>
    Signature of Judge - 1
  </div>

  <div style={{ textAlign: "center" }}>
    <div style={{ borderTop: "1px solid #e5e7eb", width: 150, margin: "0 auto" }}></div>
    Signature of Judge - 2
  </div>

  <div style={{ textAlign: "center" }}>
    <div style={{ borderTop: "1px solid #e5e7eb", width: 150, margin: "0 auto" }}></div>
    Signature of Judge - 3
  </div>
</div>

              <div style={{ gridColumn: '1 / span 2', borderTop: '1px solid #e5e7eb', paddingTop: 12, textAlign: 'center', color: '#64748b' }}>Signature of Coordinators</div>
              <div style={{ gridColumn: '1 / span 2', borderTop: '1px solid #e5e7eb', paddingTop: 12, textAlign: 'center', color: '#64748b' }}>Signature of IT-incharge after mark entry</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@media print { body { background: #fff; } .btn, nav, aside { display:none !important; } .card { box-shadow: none !important; border: 0 !important; } }`}</style>
    </DashboardLayout>
  );
}

const TH = { background: '#f8fafc', color: '#475569', fontWeight: 700, whiteSpace: 'nowrap' };
