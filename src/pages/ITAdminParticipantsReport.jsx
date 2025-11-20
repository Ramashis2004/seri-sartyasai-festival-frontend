import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { itGetParticipantsByDistrictReport } from "../api/itAdminApi";
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

  const [rows, setRows] = useState([]);
  const [grand, setGrand] = useState({ boy: 0, girl: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await itGetParticipantsByDistrictReport({ districtId, eventId, scope, frozen });
      setRows(data?.rows || []);
      setGrand(data?.grandTotal || { boy: 0, girl: 0, total: 0 });
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toCSV = () => {
    const header = ["District", "BOY", "GIRL", "Grand Total"];
    const body = rows.map(r => [r.districtName, r.boy, r.girl, r.total]);
    const foot = ["Grand Total", grand.boy, grand.girl, grand.total];
    const lines = [header, ...body, foot].map(arr => arr.join(","));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participants_by_district.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toPDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const headers = ["District", "BOY", "GIRL", "Grand Total"];
      const body = rows.map(r => [r.districtName, r.boy, r.girl, r.total]);
      const foot = ["Grand Total", grand.boy, grand.girl, grand.total];
      doc.setFontSize(14);
      doc.text("Participants by District", 40, 32);
      autoTable(doc, {
        head: [headers],
        body: [...body, foot],
        startY: 48,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [71, 85, 105] },
      });
      doc.save("participants_by_district.pdf");
    } catch (e) {
      toast.error("Please install jspdf and jspdf-autotable to export PDF");
    }
  };

  const toDOCX = async () => {
    try {
      const docx = await import("docx");
      const { saveAs } = await import("file-saver");
      const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun, AlignmentType } = docx;

      const headerCells = ["District", "BOY", "GIRL", "Grand Total"].map(t => new TableCell({
        width: { size: 25, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: t, bold: true })], alignment: AlignmentType.CENTER })],
      }));
      const headerRow = new TableRow({ children: headerCells });

      const bodyRows = rows.map(r => new TableRow({ children: [
        new TableCell({ children: [new Paragraph(String(r.districtName || ""))] }),
        new TableCell({ children: [new Paragraph(String(r.boy))] }),
        new TableCell({ children: [new Paragraph(String(r.girl))] }),
        new TableCell({ children: [new Paragraph(String(r.total))] }),
      ] }));

      const footRow = new TableRow({ children: [
        new TableCell({ children: [new Paragraph(new TextRun({ text: "Grand Total", bold: true }))] }),
        new TableCell({ children: [new Paragraph(String(grand.boy))] }),
        new TableCell({ children: [new Paragraph(String(grand.girl))] }),
        new TableCell({ children: [new Paragraph(String(grand.total))] }),
      ]});

      const table = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...bodyRows, footRow] });

      const doc = new Document({ sections: [{ properties: {}, children: [new Paragraph({ text: "Participants by District", heading: "Heading1" }), table] }] });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, "participants_by_district.docx");
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
                  <th>District</th>
                  <th>BOY</th>
                  <th>GIRL</th>
                  <th>Grand Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.districtId}>
                    <td>{r.districtName}</td>
                    <td>{r.boy}</td>
                    <td>{r.girl}</td>
                    <td>{r.total}</td>
                  </tr>
                ))}
                <tr>
                  <td><b>Grand Total</b></td>
                  <td><b>{grand.boy}</b></td>
                  <td><b>{grand.girl}</b></td>
                  <td><b>{grand.total}</b></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
