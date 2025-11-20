import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { itGetTeachersBySchoolReport } from "../api/itAdminApi";
import { toast } from "react-toastify";

export default function ITAdminTeachersSchoolReport() {
  const sidebarItems = [
    { key: "overview", label: "Dashboard" },
    { key: "participants", label: "Participants" },
    { key: "teachers", label: "Accompanying Teacher & Guru" },
  ];

  const spInit = useMemo(() => new URLSearchParams(window.location.search), []);
  const [districtId] = useState(spInit.get("districtId") || "");
  const [eventId] = useState(spInit.get("eventId") || "");
  const [frozen] = useState(spInit.get("frozen") ?? "true");

  const [roles, setRoles] = useState([]);
  const [rows, setRows] = useState([]);
  const [grand, setGrand] = useState({ total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await itGetTeachersBySchoolReport({ districtId, eventId, frozen });
      setRoles(data?.roles || []);
      setRows(data?.rows || []);
      setGrand(data?.grandTotals || { total: 0 });
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toCSV = () => {
    const header = ["School Name", ...roles, "Total"];
    const body = rows.map(r => [r.schoolName, ...roles.map(k => r.byRole[k] || 0), r.total]);
    const foot = ["Grand Total", ...roles.map(k => grand[k] || 0), grand.total || 0];
    const lines = [header, ...body, foot].map(arr => arr.join(","));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "teachers_by_school.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toPDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const headers = ["School Name", ...roles, "Total"];
      const body = rows.map(r => [r.schoolName, ...roles.map(k => r.byRole[k] || 0), r.total]);
      const foot = ["Grand Total", ...roles.map(k => grand[k] || 0), grand.total || 0];
      doc.setFontSize(14);
      doc.text("Teachers by School", 40, 32);
      autoTable(doc, {
        head: [headers],
        body: [...body, foot],
        startY: 48,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [71, 85, 105] },
      });
      doc.save("teachers_by_school.pdf");
    } catch (e) {
      toast.error("Please install jspdf and jspdf-autotable to export PDF");
    }
  };

  const toDOCX = async () => {
    try {
      const docx = await import("docx");
      const { saveAs } = await import("file-saver");
      const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun, AlignmentType } = docx;

      const headerCells = ["School Name", ...roles, "Total"].map(t => new TableCell({
        width: { size: Math.max(10, Math.floor(100 / (roles.length + 2))), type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })], alignment: AlignmentType.CENTER })],
      }));
      const headerRow = new TableRow({ children: headerCells });

      const bodyRows = rows.map(r => new TableRow({ children: [
        new TableCell({ children: [new Paragraph(String(r.schoolName || ""))] }),
        ...roles.map(k => new TableCell({ children: [new Paragraph(String(r.byRole?.[k] || 0))] })),
        new TableCell({ children: [new Paragraph(String(r.total || 0))] }),
      ] }));

      const footRow = new TableRow({ children: [
        new TableCell({ children: [new Paragraph(new TextRun({ text: "Grand Total", bold: true }))] }),
        ...roles.map(k => new TableCell({ children: [new Paragraph(String(grand[k] || 0))] })),
        new TableCell({ children: [new Paragraph(String(grand.total || 0))] }),
      ]});

      const table = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...bodyRows, footRow] });

      const doc = new Document({ sections: [{ properties: {}, children: [new Paragraph({ text: "Teachers by School", heading: "Heading1" }), table] }] });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, "teachers_by_school.docx");
    } catch (e) {
      toast.error("Please install docx and file-saver to export DOCX");
    }
  };

  return (
    <DashboardLayout title="Teachers by School Report" sidebarItems={sidebarItems} activeKey="overview" onSelectItem={(key) => window.location.assign(`/it-admin/${key}`)}>
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn" onClick={() => window.history.back()}>Back</button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn" onClick={toCSV}>Download CSV</button>
            <button className="btn" onClick={toPDF}>Download PDF</button>
            <button className="btn" onClick={toDOCX}>Download DOCX</button>
          </div>
        </div>

        {loading ? <p>Loading...</p> : error ? <p style={{ color: '#dc2626', fontWeight: 600 }}>{error}</p> : (
          <div className="table-wrapper">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>School Name</th>
                  {roles.map((r) => (<th key={r}>{r}</th>))}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.schoolName}</td>
                    {roles.map((k) => (<td key={k}>{r.byRole?.[k] || 0}</td>))}
                    <td>{r.total}</td>
                  </tr>
                ))}
                <tr>
                  <td><b>Grand Total</b></td>
                  {roles.map((k) => (<td key={k}><b>{grand[k] || 0}</b></td>))}
                  <td><b>{grand.total || 0}</b></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
