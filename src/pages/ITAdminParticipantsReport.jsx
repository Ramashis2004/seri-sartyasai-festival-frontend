import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { itGetParticipantsByDistrictReport, itGetNotReported, itListParticipants } from "../api/itAdminApi";
import districtApi from "../api/districtApi";
import { toast } from "react-toastify";

export default function ITAdminParticipantsReport() {
  const sidebarItems = [
    { key: "overview", label: "Dashboard" },
    { key: "participants", label: "Participants" },
    { key: "teachers", label: "Accompanying Teacher & Guru" },
  ];

  const spInit = useMemo(() => new URLSearchParams(window.location.search), []);
  const [districtId] = useState(spInit.get("districtId") || "");
  const [eventId] = useState(spInit.get("eventId") || "");
  const [scope] = useState(spInit.get("scope") || ""); // school|district|""
  const [frozen] = useState(spInit.get("frozen") ?? "true");
  const [present] = useState(spInit.get("present") || "");

  const [rows, setRows] = useState([]);
  const [grand, setGrand] = useState({ boy: 0, girl: 0, total: 0 });
  // For reporting status mode
  const [statusRows, setStatusRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      // If 'present' is set, show reporting status table instead of numeric report
      if (present) {
        // Load districts, not-reported lists, and district-only totals
        const [allDistricts, notRep, districtOnly] = await Promise.all([
          districtApi.getAllDistricts().catch(() => []),
          itGetNotReported({ districtId, eventId }).catch(() => ({ districts: [], schools: [] })),
          itGetParticipantsByDistrictReport({ districtId, eventId, scope: "district", frozen }).catch(() => ({ rows: [] })),
        ]);

        const notDistrictIds = new Set((notRep?.districts || []).map((d) => String(d._id)));
        const notSchoolIds = new Set((notRep?.schools || []).map((s) => String(s._id)));

        // Optionally narrow to a single district
        const districtsToShow = (allDistricts || []).filter((d) => !districtId || String(d._id) === String(districtId));

        const districtTotals = new Set((districtOnly?.rows || []).filter(r => (Number(r.total) || 0) > 0).map(r => String(r.districtId)));
        const result = [];
        for (const d of districtsToShow) {
          // District row
          result.push({
            key: `d_${d._id}`,
            isDistrict: true,
            districtName: d.districtName || "-",
            schoolName: "",
            // Mark district as reported ONLY if district-level totals exist
            reported: districtTotals.has(String(d._id)),
          });

          // If scope explicitly requests only district rows, skip schools
          if (scope === "district") continue;

          // Schools under this district
          let schools = [];
          try {
            schools = await districtApi.getAllSchools({ districtId: d._id });
          } catch {
            schools = [];
          }
          for (const s of schools || []) {
            result.push({
              key: `s_${s._id}`,
              isDistrict: false,
              districtName: d.districtName || "-",
              schoolName: s.schoolName || "-",
              reported: !notSchoolIds.has(String(s._id)),
            });
          }
        }

        setStatusRows(result);
        setRows([]);
        setGrand({ boy: 0, girl: 0, total: 0 });
      } else {
        // Default: numeric participants report with de-duplication across events
        // When scope === 'school' -> show district+school rows; otherwise show district-only rows
        // We aggregate from raw participant lists to ensure a student participating in multiple events is counted once
        const [schoolParts, districtParts] = await Promise.all([
          itListParticipants({ scope: 'school', districtId, eventId, frozen }).catch(() => []),
          itListParticipants({ scope: 'district', districtId, eventId, frozen }).catch(() => []),
        ]);

        const norm = (s) => String(s || "").trim().toLowerCase();

        if (scope === 'school') {
          // Aggregation by district + school
          const map = new Map();
          const seen = new Set();
          const add = (p) => {
            const dId = String(p.districtId || '');
            const dName = p.districtName || '-';
            const sName = p.schoolName || '-';
            const name = norm(p.studentName || p.name);
            if (!dId || !sName || !name) return;
            // Unique per district+school+name (ignore class/event)
            const uKey = `${dId}__${sName}__${name}`;
            if (seen.has(uKey)) return;
            seen.add(uKey);
            const key = `${dId}__${sName}`;
            const cur = map.get(key) || { key, districtId: dId, districtName: dName, schoolName: sName, boy: 0, girl: 0, total: 0 };
            const gender = norm(p.gender);
            if (gender === 'boy') cur.boy += 1; else if (gender === 'girl') cur.girl += 1; // others are only in total
            cur.total += 1; // overall unique student count
            map.set(key, cur);
          };
          (Array.isArray(schoolParts) ? schoolParts : []).forEach(add); // only school source
          const arr = Array.from(map.values()).sort((a,b)=> (a.districtName.localeCompare(b.districtName)) || (a.schoolName || '').localeCompare(b.schoolName || ''));
          const g = arr.reduce((acc, r) => ({ boy: acc.boy + Number(r.boy||0), girl: acc.girl + Number(r.girl||0), total: acc.total + Number(r.total||0) }), { boy: 0, girl: 0, total: 0 });
          setRows(arr);
          setGrand(g);
        } else {
          // Aggregation by district only
          const map = new Map();
          const seen = new Set();
          const add = (p) => {
            const dId = String(p.districtId || '');
            const dName = p.districtName || '-';
            const sName = p.schoolName || '-';
            const name = norm(p.studentName || p.name);
            if (!dId || !name) return;
            // Unique per district(+school when available) + name (ignore class/event)
            const uKey = `${dId}__${sName}__${name}`;
            if (seen.has(uKey)) return;
            seen.add(uKey);
            const key = dId;
            const cur = map.get(key) || { districtId: dId, districtName: dName, boy: 0, girl: 0, total: 0 };
            const gender = norm(p.gender);
            if (gender === 'boy') cur.boy += 1; else if (gender === 'girl') cur.girl += 1;
            cur.total += 1;
            map.set(key, cur);
          };
          const sourceList = scope === 'district' ? districtParts : [...(Array.isArray(schoolParts)?schoolParts:[]), ...(Array.isArray(districtParts)?districtParts:[])];
          (Array.isArray(sourceList) ? sourceList : []).forEach(add);
          const arr = Array.from(map.values()).sort((a,b)=> a.districtName.localeCompare(b.districtName));
          const g = arr.reduce((acc, r) => ({ boy: acc.boy + Number(r.boy||0), girl: acc.girl + Number(r.girl||0), total: acc.total + Number(r.total||0) }), { boy: 0, girl: 0, total: 0 });
          setRows(arr);
          setGrand(g);
        }
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const exportStatusCSV = () => {
    const header = ["Sl. No", "District", "School", "Students Reported From Schools"];
    const body = statusRows.map((r, i) => [i + 1, r.districtName, r.schoolName, r.reported ? "Reported" : "Not Reported"]);
    const lines = [header, ...body].map(arr => arr.join(","));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporting_status_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportStatusPDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      
      doc.setFontSize(14);
      doc.text("Reporting Status", 40, 32);
      
      autoTable(doc, {
        head: [["Sl. No", "District", "School", "Students Reported From Schools"]],
        body: statusRows.map((r, i) => [i + 1, r.districtName, r.schoolName, r.reported ? "Reported" : "Not Reported"]),
        startY: 48,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [71, 85, 105] },
        columnStyles: { 0: { cellWidth: 'auto' } } // Auto width for sl.no
      });
      
      doc.save(`reporting_status_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      toast.error("Please install jspdf and jspdf-autotable to export PDF");
    }
  };

  const exportStatusDOCX = async () => {
    try {
      const docx = await import("docx");
      const { saveAs } = await import("file-saver");
      const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun, AlignmentType } = docx;

      const headerCells = ["Sl. No", "District", "School", "Students Reported From Schools"].map(t => new TableCell({
        width: t === "Sl. No" ? { size: 10, type: WidthType.PERCENTAGE } : { size: 30, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })], alignment: AlignmentType.CENTER })],
      }));
      const headerRow = new TableRow({ children: headerCells });

      const bodyRows = statusRows.map((r, i) => new TableRow({ children: [
        new TableCell({ children: [new Paragraph(String(i + 1))], width: { size: 10, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph(r.districtName || "")] }),
        new TableCell({ children: [new Paragraph(r.schoolName || "")] }),
        new TableCell({ children: [new Paragraph(r.reported ? "Reported" : "Not Reported")] }),
      ] }));

      const table = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...bodyRows] });
      const doc = new Document({ sections: [{ properties: {}, children: [new Paragraph({ text: "Reporting Status", heading: "Heading1" }), table] }] });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `reporting_status_${new Date().toISOString().split('T')[0]}.docx`);
    } catch (e) {
      toast.error("Please install docx and file-saver to export DOCX");
    }
  };

  const toCSV = () => {
    if (present) {
      exportStatusCSV();
      return;
    }
    const bySchool = scope === 'school';
    const header = bySchool ? ["District", "School", "BOY", "GIRL", "Grand Total"] : ["District", "BOY", "GIRL", "Grand Total"];
    const body = rows.map(r => bySchool ? [r.districtName, r.schoolName, r.boy, r.girl, r.total] : [r.districtName, r.boy, r.girl, r.total]);
    const foot = ["Grand Total", grand.boy, grand.girl, grand.total];
    const lines = [header, ...body, foot].map(arr => arr.join(","));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `participants_${scope==='school'?'by_school':'by_district'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toPDF = async () => {
    if (present) {
      await exportStatusPDF();
      return;
    }
    try {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const bySchool = scope === 'school';
      const headers = bySchool ? ["District", "School", "BOY", "GIRL", "Grand Total"] : ["District", "BOY", "GIRL", "Grand Total"];
      const body = rows.map(r => bySchool ? [r.districtName, r.schoolName, r.boy, r.girl, r.total] : [r.districtName, r.boy, r.girl, r.total]);
      const foot = bySchool ? ["Grand Total", "", grand.boy, grand.girl, grand.total] : ["Grand Total", grand.boy, grand.girl, grand.total];
      doc.setFontSize(14);
      doc.text(scope === 'school' ? "Participants by School" : "Participants by District", 40, 32);
      autoTable(doc, {
        head: [headers],
        body: [...body, foot],
        startY: 48,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [71, 85, 105] },
      });
      doc.save(`participants_${scope==='school'?'by_school':'by_district'}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      toast.error("Please install jspdf and jspdf-autotable to export PDF");
    }
  };

  const toDOCX = async () => {
    if (present) {
      await exportStatusDOCX();
      return;
    }
    try {
      const docx = await import("docx");
      const { saveAs } = await import("file-saver");
      const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun, AlignmentType } = docx;
      const bySchool = scope === 'school';
      const cols = bySchool ? ["District", "School", "BOY", "GIRL", "Grand Total"] : ["District", "BOY", "GIRL", "Grand Total"];
      const widthPct = bySchool ? [20, 30, 16, 16, 18] : [34, 22, 22, 22];
      const headerCells = cols.map((t, idx) => new TableCell({
        width: { size: widthPct[idx] || 20, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })], alignment: AlignmentType.CENTER })],
      }));
      const headerRow = new TableRow({ children: headerCells });
      const bodyRows = rows.map(r => new TableRow({ children: (
        bySchool ? [
          new TableCell({ children: [new Paragraph(String(r.districtName || ""))] }),
          new TableCell({ children: [new Paragraph(String(r.schoolName || ""))] }),
          new TableCell({ children: [new Paragraph(String(r.boy))] }),
          new TableCell({ children: [new Paragraph(String(r.girl))] }),
          new TableCell({ children: [new Paragraph(String(r.total))] }),
        ] : [
          new TableCell({ children: [new Paragraph(String(r.districtName || ""))] }),
          new TableCell({ children: [new Paragraph(String(r.boy))] }),
          new TableCell({ children: [new Paragraph(String(r.girl))] }),
          new TableCell({ children: [new Paragraph(String(r.total))] }),
        ]) }));

      const footRow = new TableRow({ children: (
        bySchool ? [
          new TableCell({ children: [new Paragraph(new TextRun({ text: "Grand Total", bold: true }))] }),
          new TableCell({ children: [new Paragraph("")] }),
          new TableCell({ children: [new Paragraph(String(grand.boy))] }),
          new TableCell({ children: [new Paragraph(String(grand.girl))] }),
          new TableCell({ children: [new Paragraph(String(grand.total))] }),
        ] : [
          new TableCell({ children: [new Paragraph(new TextRun({ text: "Grand Total", bold: true }))] }),
          new TableCell({ children: [new Paragraph(String(grand.boy))] }),
          new TableCell({ children: [new Paragraph(String(grand.girl))] }),
          new TableCell({ children: [new Paragraph(String(grand.total))] }),
        ])});

      const table = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...bodyRows, footRow] });

      const doc = new Document({ sections: [{ properties: {}, children: [new Paragraph({ text: scope === 'school' ? "Participants by School" : "Participants by District", heading: "Heading1" }), table] }] });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `participants_${scope==='school'?'by_school':'by_district'}_${new Date().toISOString().split('T')[0]}.docx`);
    } catch (e) {
      toast.error("Please install docx and file-saver to export DOCX");
    }
  };

  return (
    <DashboardLayout title="Participants Report" sidebarItems={sidebarItems} activeKey="overview" onSelectItem={(key) => window.location.assign(`/it-admin/${key}`)}>
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn" onClick={() => window.history.back()}>Back</button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn" onClick={toCSV}>
              {present ? 'Export Status CSV' : 'Download CSV'}
            </button>
            <button className="btn" onClick={toPDF}>
              {present ? 'Export Status PDF' : 'Download PDF'}
            </button>
            <button className="btn" onClick={toDOCX}>
              {present ? 'Export Status DOCX' : 'Download DOCX'}
            </button>
          </div>
        </div>

        {loading ? <p>Loading...</p> : error ? <p style={{ color: '#dc2626', fontWeight: 600 }}>{error}</p> : (
          present ? (
            <div className="table-wrapper">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Sl. No</th>
                    <th>District</th>
                    <th>School</th>
                    <th>Students Reported From Schools</th>
                  </tr>
                </thead>
                <tbody>
                  {statusRows.length ? statusRows.map((r, i) => (
                    <tr key={r.key}>
                      <td>{i + 1}</td>
                      <td>{r.districtName}</td>
                      <td>{r.isDistrict ? "" : r.schoolName}</td>
                      <td>{r.reported ? "Reported" : "Not Reported"}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} style={{ textAlign: 'center' }}>No data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>District</th>
                    {scope === 'school' && (<th>School</th>)}
                    <th>BOY</th>
                    <th>GIRL</th>
                    <th>Grand Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.key || r.districtId}>
                      <td>{r.districtName}</td>
                      {scope === 'school' && (<td>{r.schoolName}</td>)}
                      <td>{r.boy}</td>
                      <td>{r.girl}</td>
                      <td>{r.total}</td>
                    </tr>
                  ))}
                  <tr>
                    <td><b>Grand Total</b></td>
                    {scope === 'school' && (<td></td>)}
                    <td><b>{grand.boy}</b></td>
                    <td><b>{grand.girl}</b></td>
                    <td><b>{grand.total}</b></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
