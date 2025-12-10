import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { itListParticipants } from "../api/itAdminApi";

export default function ITAdminEventWiseReport() {
  const sidebarItems = [
    { key: "overview", label: "Dashboard" },
    { key: "participants", label: "Participants" },
    { key: "teachers", label: "Accompanying Teacher & Guru" },
  ];

  const spInit = useMemo(() => new URLSearchParams(window.location.search), []);
  const [districtId] = useState(spInit.get("districtId") || "");
  const [eventId] = useState(spInit.get("eventId") || "");

  const [schoolRows, setSchoolRows] = useState([]);
  const [districtRows, setDistrictRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [schoolParts, districtParts] = await Promise.all([
        itListParticipants({ scope: 'school', districtId, eventId }).catch(() => []),
        itListParticipants({ scope: 'district', districtId, eventId }).catch(() => []),
      ]);

      const agg = (arr, scope) => {
        const map = new Map();
        (Array.isArray(arr) ? arr : []).forEach((p) => {
          const id = String(p.eventId || p.event || p._id || '');
          if (!id) return;
          const title = p.eventTitle || p.title || 'Event';
          const audience = scope === 'school' ? (String(p.group || '').toLowerCase() || '') : '';
          const key = scope === 'school' ? `${id}__${audience}` : id;
          const cur = map.get(key) || { eventId: id, title, nomination: 0, present: 0, audience: audience ? (audience === 'senior' ? 'Senior' : 'Junior') : '-' };
          cur.nomination += 1;
          if (p.present) cur.present += 1;
          map.set(key, cur);
        });
        const arrOut = Array.from(map.values());
        if (scope === 'school') {
          const rank = (aud) => aud === 'Senior' ? 0 : (aud === 'Junior' ? 1 : 2);
          return arrOut.sort((a, b) => (rank(a.audience) - rank(b.audience)) || a.title.localeCompare(b.title));
        }
        return arrOut.sort((a,b) => a.title.localeCompare(b.title));
      };

      setSchoolRows(agg(schoolParts, 'school'));
      setDistrictRows(agg(districtParts, 'district'));
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load report');
      setSchoolRows([]);
      setDistrictRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toCSV = () => {
    const lines = [];
    lines.push(["Sl.No","Scope","Event","Audience","Nomination","Present"].join(","));
    const esc = (v) => (/[",\n]/.test(String(v))?`"${String(v).replace(/"/g,'""')}"`:String(v));
    const rank = (aud) => aud === 'Senior' ? 0 : (aud === 'Junior' ? 1 : 2);
    const s = (schoolRows || []).slice().sort((a,b)=> (rank(a.audience)-rank(b.audience)) || a.title.localeCompare(b.title));
    const d = (districtRows || []).slice().sort((a,b)=> a.title.localeCompare(b.title));
    const toLine = (i, scope, r) => [String(i+1), scope, r.title, r.audience || '-', String(r.nomination||0), String(r.present||0)].map(esc).join(",");
    s.forEach((r, i)=>lines.push(toLine(i, 'School', r)));
    d.forEach((r, i)=>lines.push(toLine(i, 'District', r)));
    const blob = new Blob([lines.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'event_wise_report.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const toPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      doc.setFontSize(14);
      doc.text('Event-wise Report', 40, 32);
      const headSchool = [['Sl.No','Event','Audience','Nomination','Present']];
      const rank = (aud) => aud === 'Senior' ? 0 : (aud === 'Junior' ? 1 : 2);
      const schoolSorted = (schoolRows || []).slice().sort((a,b)=> (rank(a.audience)-rank(b.audience)) || a.title.localeCompare(b.title));
      const toBodySchool = (arr) => arr.map((r, i) => [String(i+1), r.title, r.audience || '-', String(r.nomination||0), String(r.present||0)]);
      autoTable(doc, { head: headSchool, body: toBodySchool(schoolSorted), startY: 48, headStyles: { fillColor: [59,130,246] }, styles: { fontSize: 9 }, theme: 'striped', margin: { left: 40, right: 40 } , didDrawPage: (data)=>{ doc.setFontSize(12); doc.text('School Events', 40, 44);} });
      const afterY = doc.lastAutoTable.finalY + 18;
      doc.setFontSize(12); doc.text('District Events', 40, afterY);
      const headDistrict = [['Sl.No','Event','Nomination','Present']];
      const districtSorted = (districtRows || []).slice().sort((a,b)=> a.title.localeCompare(b.title));
      const toBodyDistrict = (arr) => arr.map((r, i) => [String(i+1), r.title, String(r.nomination||0), String(r.present||0)]);
      autoTable(doc, { head: headDistrict, body: toBodyDistrict(districtSorted), startY: afterY + 6, headStyles: { fillColor: [16,185,129] }, styles: { fontSize: 9 }, theme: 'striped', margin: { left: 40, right: 40 } });
      doc.save('event_wise_report.pdf');
    } catch(e) {
      alert('Please install jspdf and jspdf-autotable to export PDF');
    }
  };

  return (
    <DashboardLayout title="Event-wise Report" sidebarItems={sidebarItems} activeKey="overview" onSelectItem={(key) => window.location.assign(`/it-admin/${key}`)}>
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn" onClick={() => window.history.back()}>Back</button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn" onClick={toCSV}>Download CSV</button>
            <button className="btn" onClick={toPDF}>Download PDF</button>
          </div>
        </div>

        {loading ? <p>Loading...</p> : error ? <p style={{ color: '#dc2626', fontWeight: 600 }}>{error}</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0' }}>School Events</h4>
              <div className="table-wrapper">
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>Sl.No</th>
                      <th>Event</th>
                      <th>Audience</th>
                      <th>Nomination</th>
                      <th>Present</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(schoolRows || []).length ? (schoolRows).map((r, i) => (
                      <tr key={`s_${r.eventId}_${i}`}>
                        <td>{i + 1}</td>
                        <td>{r.title}</td>
                        <td>{r.audience || '-'}</td>
                        <td>{r.nomination || 0}</td>
                        <td>{r.present || 0}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} style={{ textAlign: 'center' }}>No data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 style={{ margin: '0 0 8px 0' }}>District Events</h4>
              <div className="table-wrapper">
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>Sl.No</th>
                      <th>Event</th>
                      <th>Nomination</th>
                      <th>Present</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(districtRows || []).length ? (districtRows).map((r, i) => (
                      <tr key={`d_${r.eventId}_${i}`}>
                        <td>{i + 1}</td>
                        <td>{r.title}</td>
                        <td>{r.nomination || 0}</td>
                        <td>{r.present || 0}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} style={{ textAlign: 'center' }}>No data</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
