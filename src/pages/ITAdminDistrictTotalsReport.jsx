import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { itListParticipants, itGetParticipantsByDistrictReport, itGetTeachersByDistrictReport, itGetTeachersBySchoolReport } from "../api/itAdminApi";

export default function ITAdminDistrictTotalsReport() {
  const sidebarItems = [
    { key: "overview", label: "Dashboard" },
    { key: "participants", label: "Participants" },
    { key: "teachers", label: "Accompanying Teacher & Guru" },
  ];

  const spInit = useMemo(() => new URLSearchParams(window.location.search), []);
  const [districtId] = useState(spInit.get("districtId") || "");
  const [eventId] = useState(spInit.get("eventId") || "");
  const [scope] = useState(spInit.get("scope") || "school"); // school|district
  const [frozen] = useState(spInit.get("frozen") ?? "true");
  const [all] = useState(spInit.get("all") === "true");

  const [rows, setRows] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const memberLabels = {
    dist_president: "Dist President",
    dist_edu_coordinator_gents: "Edu-Coord (Gents)",
    dist_edu_coordinator_ladies: "Edu-Coord (Ladies)",
    dist_monitoring_committee: "Monitoring Committee",
    guru: "Guru",
    parents: "Parents",
    mc_member: "MC Member",
    teacher: "Teacher",
    principal: "Principal",
    other: "Other",
    secretary_manager: "Secretary Manager",
  };

  const load = async () => {
    try {
      setLoading(true);
      if (scope === "district") {
        if (all) {
          const [pData, tData] = await Promise.all([
            itGetParticipantsByDistrictReport({ districtId, eventId, scope: "district", all: "true" }).catch(() => ({ rows: [] })),
            itGetTeachersByDistrictReport({ districtId, eventId, scope: "district", all: "true" }).catch(() => ({ roles: [], rows: [] })),
          ]);
          const pRows = Array.isArray(pData?.rows) ? pData.rows : [];
          const tRoles = Array.isArray(tData?.roles) ? tData.roles : [];
          const tRows = Array.isArray(tData?.rows) ? tData.rows : [];
          const map = new Map();
          pRows.forEach((r) => {
            const key = String(r.districtId);
            const cur = map.get(key) || { key, districtName: r.districtName || '-', schoolName: '', boys: 0, girls: 0, studentsTotal: 0, byRole: {}, rolesTotal: 0 };
            cur.boys += Number(r.boy || 0);
            cur.girls += Number(r.girl || 0);
            cur.studentsTotal += Number(r.total || 0);
            map.set(key, cur);
          });
          tRows.forEach((r) => {
            const key = String(r.districtId);
            const cur = map.get(key) || { key, districtName: r.districtName || '-', schoolName: '', boys: 0, girls: 0, studentsTotal: 0, byRole: {}, rolesTotal: 0 };
            const byRole = r.byRole || {};
            Object.keys(byRole).forEach((k) => { cur.byRole[k] = (Number(cur.byRole[k] || 0) + Number(byRole[k] || 0)); });
            cur.rolesTotal = Number(cur.rolesTotal || 0) + Number(r.total || 0);
            map.set(key, cur);
          });
          const finalRows = Array.from(map.values()).sort((a,b)=> a.districtName.localeCompare(b.districtName));
          const combinedRoleKeys = Array.from(new Set([...(tRoles || []), ...finalRows.flatMap(r => Object.keys(r.byRole || {}))]));
          setRoles(combinedRoleKeys);
          setRows(finalRows);
        } else {
          const [pData, tData] = await Promise.all([
            itGetParticipantsByDistrictReport({ districtId, eventId, scope: 'district', frozen: String(frozen) }).catch(() => ({ rows: [] })),
            itGetTeachersByDistrictReport({ districtId, eventId, scope: 'district', frozen: String(frozen) }).catch(() => ({ roles: [], rows: [] })),
          ]);
          const pRows = Array.isArray(pData?.rows) ? pData.rows : [];
          const tRoles = Array.isArray(tData?.roles) ? tData.roles : [];
          const tRows = Array.isArray(tData?.rows) ? tData.rows : [];
          const map = new Map();
          pRows.forEach((r) => {
            const key = String(r.districtId);
            map.set(key, { key, districtName: r.districtName || '-', schoolName: '', boys: Number(r.boy||0), girls: Number(r.girl||0), studentsTotal: Number(r.total||0), byRole: {}, rolesTotal: 0 });
          });
          tRows.forEach((r) => {
            const key = String(r.districtId);
            const cur = map.get(key) || { key, districtName: r.districtName || '-', schoolName: '', boys: 0, girls: 0, studentsTotal: 0, byRole: {}, rolesTotal: 0 };
            cur.byRole = r.byRole || {};
            cur.rolesTotal = Number(r.total || 0);
            map.set(key, cur);
          });
          const finalRows = Array.from(map.values()).sort((a,b)=> a.districtName.localeCompare(b.districtName));
          const combinedRoleKeys = Array.from(new Set([...(tRoles || []), ...finalRows.flatMap(r => Object.keys(r.byRole || {}))]));
          setRoles(combinedRoleKeys);
          setRows(finalRows);
        }
      } else {
        if (all) {
          const [pList, tData] = await Promise.all([
            itListParticipants({ scope: 'school', districtId, eventId, all: 'true' }).catch(() => []),
            itGetTeachersBySchoolReport({ districtId, eventId, all: 'true' }).catch(() => ({ roles: [], rows: [] })),
          ]);
          const tRoles = Array.isArray(tData?.roles) ? tData.roles : [];
          const tRows = Array.isArray(tData?.rows) ? tData.rows : [];
          const map = new Map();
          (Array.isArray(pList) ? pList : []).forEach((p) => {
            const dId = String(p.districtId || '');
            const dName = p.districtName || '-';
            const sName = p.schoolName || '-';
            if (!dId || !sName) return;
            const key = `${dId}__${sName}`;
            const cur = map.get(key) || { key, districtId: dId, districtName: dName, schoolName: sName, boys: 0, girls: 0, studentsTotal: 0, byRole: {}, rolesTotal: 0 };
            const isBoy = String(p.gender || '').toLowerCase() === 'boy';
            const isGirl = String(p.gender || '').toLowerCase() === 'girl';
            cur.boys += isBoy ? 1 : 0;
            cur.girls += isGirl ? 1 : 0;
            cur.studentsTotal += 1;
            map.set(key, cur);
          });
          tRows.forEach((r) => {
            const sName = r.schoolName || '-';
            if (!sName) return;
            // Try to find existing map entry by matching schoolName
            let found = false;
            for (const [key, cur] of map.entries()) {
              if (cur.schoolName === sName) {
                const byRole = r.byRole || {};
                Object.keys(byRole).forEach((k) => { cur.byRole[k] = (Number(cur.byRole[k] || 0) + Number(byRole[k] || 0)); });
                cur.rolesTotal = Number(cur.rolesTotal || 0) + Number(r.total || 0);
                found = true;
                break;
              }
            }
            if (!found) {
              const key = `unknown__${sName}`;
              const cur = map.get(key) || { key, districtId: '', districtName: r.districtName || cur?.districtName || '-',
 schoolName: sName, boys: 0, girls: 0, studentsTotal: 0, byRole: {}, rolesTotal: 0 };
              const byRole = r.byRole || {};
              Object.keys(byRole).forEach((k) => { cur.byRole[k] = (Number(cur.byRole[k] || 0) + Number(byRole[k] || 0)); });
              cur.rolesTotal = Number(cur.rolesTotal || 0) + Number(r.total || 0);
              map.set(key, cur);
            }
          });
          const finalRows = Array.from(map.values()).sort((a,b)=> (a.districtName.localeCompare(b.districtName)) || (a.schoolName || '').localeCompare(b.schoolName || ''));
          const combinedRoleKeys = Array.from(new Set([...(tRoles || []), ...finalRows.flatMap(r => Object.keys(r.byRole || {}))]));
          setRoles(combinedRoleKeys);
          setRows(finalRows);
        } else {
          const [pList, tData] = await Promise.all([
            itListParticipants({ scope: 'school', districtId, eventId, frozen: String(frozen) }).catch(() => []),
            itGetTeachersBySchoolReport({ districtId, eventId, frozen: String(frozen) }).catch(() => ({ roles: [], rows: [] })),
          ]);
          const tRoles = Array.isArray(tData?.roles) ? tData.roles : [];
          const tRows = Array.isArray(tData?.rows) ? tData.rows : [];
          const map = new Map();
          (Array.isArray(pList) ? pList : []).forEach((p) => {
            const dId = String(p.districtId || '');
            const dName = p.districtName || '-';
            const sName = p.schoolName || '-';
            if (!dId || !sName) return;
            const key = `${dId}__${sName}`;
            const cur = map.get(key) || { key, districtId: dId, districtName: dName, schoolName: sName, boys: 0, girls: 0, studentsTotal: 0, byRole: {}, rolesTotal: 0 };
            const isBoy = String(p.gender || '').toLowerCase() === 'boy';
            const isGirl = String(p.gender || '').toLowerCase() === 'girl';
            cur.boys += isBoy ? 1 : 0;
            cur.girls += isGirl ? 1 : 0;
            cur.studentsTotal += 1;
            map.set(key, cur);
          });
          tRows.forEach((r) => {
            const sName = r.schoolName || '-';
            if (!sName) return;
            // For school scope, we need to find matching entries by schoolName
            // Create a composite key using schoolName - look for any entry with this school
            let found = false;
            for (const [key, cur] of map.entries()) {
              if (cur.schoolName === sName) {
                const byRole = r.byRole || {};
                Object.keys(byRole).forEach((k) => { cur.byRole[k] = (Number(cur.byRole[k] || 0) + Number(byRole[k] || 0)); });
                cur.rolesTotal = Number(cur.rolesTotal || 0) + Number(r.total || 0);
                found = true;
                break;
              }
            }
            // If not found, create new entry
            if (!found) {
              const key = `unknown__${sName}`;
              const cur = map.get(key) || { key, districtId: '', districtName: r.districtName || cur?.districtName || '-',
 schoolName: sName, boys: 0, girls: 0, studentsTotal: 0, byRole: {}, rolesTotal: 0 };
              const byRole = r.byRole || {};
              Object.keys(byRole).forEach((k) => { cur.byRole[k] = (Number(cur.byRole[k] || 0) + Number(byRole[k] || 0)); });
              cur.rolesTotal = Number(cur.rolesTotal || 0) + Number(r.total || 0);
              map.set(key, cur);
            }
          });
          const finalRows = Array.from(map.values()).sort((a,b)=> (a.districtName.localeCompare(b.districtName)) || (a.schoolName || '').localeCompare(b.schoolName || ''));
          const combinedRoleKeys = Array.from(new Set([...(tRoles || []), ...finalRows.flatMap(r => Object.keys(r.byRole || {}))]));
          setRoles(combinedRoleKeys);
          setRows(finalRows);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const grand = useMemo(() => {
    const res = { boys: 0, girls: 0, roles: {}, total: 0 };
    // Aggregate counts directly from rows.byRole to avoid role-key mismatches
    (rows || []).forEach(r => {
      res.boys += Number(r.boys || 0);
      res.girls += Number(r.girls || 0);
      const by = r.byRole || {};
      Object.keys(by).forEach((k) => { res.roles[k] = (res.roles[k] || 0) + Number(by[k] || 0); });
    });
    const rolesSum = Object.values(res.roles).reduce((a,b) => a + Number(b || 0), 0);
    res.total = Number(res.boys || 0) + Number(res.girls || 0) + rolesSum;
    return res;
  }, [rows]);

  useEffect(() => { load(); }, []);

  const toCSV = () => {
    const lines = [];
    const header = ["Sl.No","District", ...(scope==='school'?['School']:[]), "Boys","Girls", ...(roles||[]).map(k => memberLabels[k] || k), "Grand Total"];
    lines.push(header.join(","));
    const esc = (v) => (/[",\n]/.test(String(v))?`"${String(v).replace(/"/g,'""')}"`:String(v));
    (rows || []).forEach((r, i) => {
      const roleVals = (roles||[]).map(k => Number(r.byRole?.[k] || 0));
      const sumRoles = Object.values(r.byRole || {}).reduce((a,b)=> a + Number(b || 0), 0);
      const row = [String(i+1), r.districtName, ...(scope==='school'?[r.schoolName||'-']:[]), String(r.boys||0), String(r.girls||0), ...roleVals.map(String), String(Number(r.studentsTotal||0) + sumRoles)];
      lines.push(row.map(esc).join(","));
    });
    if ((rows||[]).length) {
      const roleTotals = (roles||[]).map(k => String(grand.roles?.[k] || 0));
      const foot = ["Grand Total", ...(scope==='school'?['']:[]), "", String(grand.boys || 0), String(grand.girls || 0), ...roleTotals, String(grand.total || 0)];
      lines.push(foot.map(esc).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'district_wise_totals.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const toPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      doc.setFontSize(14);
      doc.text('District-wise Total Participant Count', 40, 32);
      const head = [["Sl.No","District", ...(scope==='school'?['School']:[]), "Boys","Girls", ...(roles||[]).map(k => memberLabels[k] || k), "Grand Total"]];
      const body = (rows || []).map((r, i) => {
        const roleVals = (roles||[]).map(k => Number(r.byRole?.[k] || 0));
        const sumRoles = Object.values(r.byRole || {}).reduce((a,b) => a + Number(b || 0), 0);
        return [String(i+1), r.districtName, ...(scope==='school'?[r.schoolName||'-']:[]), String(r.boys||0), String(r.girls||0), ...roleVals.map(String), String(Number(r.studentsTotal||0) + sumRoles)];
      });
      const foot = (rows||[]).length ? [[
        "Grand Total",
        ...(scope==='school'?[''] : []),
        "",
        String(grand.boys || 0),
        String(grand.girls || 0),
        ...((roles||[]).map(k => String(grand.roles?.[k] || 0))),
        String(grand.total || 0)
      ]] : [];
      autoTable(doc, { head: head, body: [...body, ...foot], startY: 48, headStyles: { fillColor: [99,102,241] }, styles: { fontSize: 9 }, theme: 'striped', margin: { left: 40, right: 40 } });
      doc.save('district_wise_totals.pdf');
    } catch(e) {
      alert('Please install jspdf and jspdf-autotable to export PDF');
    }
  };

  return (
    <DashboardLayout title="School-wise Total Participant Count" sidebarItems={sidebarItems} activeKey="overview" onSelectItem={(key) => window.location.assign(`/it-admin/${key}`)}>
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn" onClick={() => window.history.back()}>Back</button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn" onClick={toCSV}>Download CSV</button>
            <button className="btn" onClick={toPDF}>Download PDF</button>
          </div>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <div style={{ padding: 12 }}>Loading...</div>
          ) : (
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Sl.No</th>
                  <th>District</th>
                  {scope === 'school' && (<th>School</th>)}
                  <th>Boys</th>
                  <th>Girls</th>
                  {(roles || []).map((k) => (
                    <th key={k}>{memberLabels[k] || k}</th>
                  ))}
                  <th>Grand Total</th>
                </tr>
              </thead>
              <tbody>
                {(rows || []).length ? (rows || []).map((r, i) => {
                  const roleVals = (roles||[]).map(k => Number(r.byRole?.[k] || 0));
                  const sumRoles = Object.values(r.byRole || {}).reduce((a,b) => a + Number(b || 0), 0);
                  return (
                    <tr key={r.key || r.districtName}>
                      <td>{i + 1}</td>
                      <td>{r.districtName}</td>
                      {scope === 'school' && (<td>{r.schoolName || '-'}</td>)}
                      <td>{r.boys || 0}</td>
                      <td>{r.girls || 0}</td>
                      {roleVals.map((v, idx) => (<td key={String(idx)}>{v}</td>))}
                      <td>{Number(r.studentsTotal || 0) + sumRoles}</td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={(scope==='school'?6:5) + (roles ? roles.length : 0)} style={{ textAlign: 'center' }}>No data</td></tr>
                )}
                {(rows || []).length ? (
                  <tr>
                    <td><b>Grand Total</b></td>
                    <td></td>
                    {scope === 'school' && (<td></td>)}
                    <td><b>{grand.boys}</b></td>
                    <td><b>{grand.girls}</b></td>
                    {(roles || []).map((k) => (<td key={k}><b>{grand.roles?.[k] || 0}</b></td>))}
                    <td><b>{grand.total}</b></td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
