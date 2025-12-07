import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useEffect, useState, useMemo } from "react";
import districtApi from "../api/districtApi";
import { itListEvents, itListDistrictEvents, itGetOverviewMetrics, itGetNotReported, itGetStudentsYetToReport, itGetTeachersOverview, itListParticipants } from "../api/itAdminApi";
import "../styles/itAdminOverview.css";

export default function ITAdminOverview() {
  const sidebarItems = [
    { key: "overview", label: "Dashboard" },
    { key: "participants", label: "Participants" },
    { key: "teachers", label: "Accompanying Teacher & Guru" },
  ];

  const [districtId, setDistrictId] = useState("");
  const [eventId, setEventId] = useState("");

  const [districts, setDistricts] = useState([]);
  const [events, setEvents] = useState([]);

  const [metrics, setMetrics] = useState(null);
  const [notReported, setNotReported] = useState({ districts: [], schools: [] });
  const [studentsYet, setStudentsYet] = useState({ schoolWise: [], districtWise: [] });
  const [teachers, setTeachers] = useState({ reported: { total: 0, male: 0, female: 0, other: 0 }, yetToReport: { total: 0, male: 0, female: 0, other: 0 } });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Event-wise aggregation
  const [eventAgg, setEventAgg] = useState({ school: [], district: [] });
  const [showEventWise, setShowEventWise] = useState(false);

  const [showSchoolsNotReported, setShowSchoolsNotReported] = useState(false);
  const [showDistrictsNotReported, setShowDistrictsNotReported] = useState(false);
  const [reportDistrictId, setReportDistrictId] = useState("");
  const [reportSchools, setReportSchools] = useState([]);
  const [reportSchoolId, setReportSchoolId] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const d = await districtApi.getAllDistricts();
        setDistricts(d || []);
      } catch {
        setDistricts([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [schoolEvents, districtEvents] = await Promise.all([
          itListEvents().catch(() => []),
          itListDistrictEvents().catch(() => []),
        ]);
        setEvents([
          ...schoolEvents.map((e) => ({ _id: e._id, title: e.title, source: "school" })),
          ...districtEvents.map((e) => ({ _id: e._id, title: e.title, source: "district" })),
        ]);
      } catch {
        setEvents([]);
      }
    })();
  }, []);

  const params = useMemo(() => ({ districtId, eventId }), [districtId, eventId]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [m, nr, sy, to, schoolParts, districtParts] = await Promise.all([
        itGetOverviewMetrics(params),
        itGetNotReported(params),
        itGetStudentsYetToReport(params),
        itGetTeachersOverview(params),
        itListParticipants({ scope: 'school', districtId, eventId }).catch(() => []),
        itListParticipants({ scope: 'district', districtId, eventId }).catch(() => []),
      ]);
      setMetrics(m || null);
      setNotReported(nr || { districts: [], schools: [] });
      setStudentsYet(sy || { schoolWise: [], districtWise: [] });
      setTeachers(to || { reported: { total: 0, male: 0, female: 0, other: 0 }, yetToReport: { total: 0, male: 0, female: 0, other: 0 } });

      const agg = (arr, scope) => {
        const map = new Map();
        (Array.isArray(arr) ? arr : []).forEach((p) => {
          const id = String(p.eventId || p.event || p._id || '');
          if (!id) return;
          const title = p.eventTitle || p.title || 'Event';
          const audience = scope === 'school' ? (String(p.group || '').toLowerCase() || '') : '';
          const key = scope === 'school' ? `${id}__${audience}` : id;
          const cur = map.get(key) || { eventId: id, title, nomination: 0, present: 0, audience: audience ? (audience === 'senior' ? 'Senior' : 'Junior') : '-' };
          cur.nomination += 1; // total participated (nominated)
          if (p.present) cur.present += 1; // present count
          map.set(key, cur);
        });
        return Array.from(map.values()).sort((a,b) => a.title.localeCompare(b.title) || String(a.audience).localeCompare(String(b.audience)));
      };
      setEventAgg({ school: agg(schoolParts, 'school'), district: agg(districtParts, 'district') });
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load overview");
      setMetrics(null);
      setNotReported({ districts: [], schools: [] });
      setStudentsYet({ schoolWise: [], districtWise: [] });
      setTeachers({ reported: { total: 0, male: 0, female: 0, other: 0 }, yetToReport: { total: 0, male: 0, female: 0, other: 0 } });
      setEventAgg({ school: [], district: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [params]);

  const goToParticipants = (extra = {}) => {
    const sp = new URLSearchParams();
    if (districtId) sp.set("districtId", districtId);
    if (eventId) sp.set("eventId", eventId);
    Object.entries(extra).forEach(([k, v]) => {
      if (typeof v !== "undefined" && v !== null && v !== "") sp.set(k, String(v));
    });
    window.location.assign(`/it-admin/participants?${sp.toString()}`);
  };

  const reportedDistricts = useMemo(() => {
    if (!Array.isArray(districts)) return [];
    const notIds = new Set((notReported?.districts || []).map((d) => String(d._id)));
    return districts.filter((d) => !notIds.has(String(d._id)));
  }, [districts, notReported]);

  useEffect(() => {
    if (!reportDistrictId) {
      setReportSchools([]);
      setReportSchoolId("");
      return;
    }
    (async () => {
      try {
        const s = await districtApi.getAllSchools({ districtId: reportDistrictId });
        setReportSchools(Array.isArray(s) ? s : []);
      } catch {
        setReportSchools([]);
      }
    })();
  }, [reportDistrictId]);

  const handleGenerateDetailedList = () => {
    if (!reportDistrictId && !reportSchoolId) {
      alert("Please select a District or School");
      return;
    }
    const sp = new URLSearchParams();
    if (reportDistrictId) sp.set("districtId", reportDistrictId);
    sp.set("frozen", "true");
    if (reportSchoolId) {
      const notReportedSchools = (notReported?.schools || []).filter((s) => String(s.districtId) === String(reportDistrictId));
      const excluded = new Set(notReportedSchools.map((s) => String(s._id)));
      const validSchools = (reportSchools || []).filter((s) => !excluded.has(String(s._id)));
      const sch = validSchools.find((s) => String(s._id) === String(reportSchoolId));
      if (sch?.schoolName) {
        sp.set("schoolName", sch.schoolName);
        sp.set("scope", "school");
      }
    } else if (reportDistrictId) {
      // District only: show district-level participants & gurus (no school participants)
      sp.set("scope", "district");
    }
    window.location.assign(`/it-admin/detailed-list?${sp.toString()}`);
  };

  return (
    <DashboardLayout
      title="IT Admin Dashboard"
      sidebarItems={sidebarItems}
      activeKey="overview"
      onSelectItem={(key) => window.location.assign(`/it-admin/${key}`)}
    >
      <div className="dashboard">
        <div className="toolbar">
          <select value={districtId} onChange={(e) => setDistrictId(e.target.value)}>
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d._id} value={d._id}>{d.districtName}</option>
            ))}
          </select>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">All Events</option>
            {events.map((ev) => (
              <option key={`${ev.source}_${ev._id}`} value={ev._id}>{ev.title}</option>
            ))}
          </select>
          <button className="btn ghost" onClick={load}>Refresh</button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: '#dc2626', fontWeight: 600 }}>{error}</p>
        ) : (
          <>
            <div className="stat-grid">
              {/* Registered (Present) */}
              <div className="card stat-card" style={{ display: 'grid', gap: 8, overflow: 'hidden' }}>
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="dot orange" />
                    <div style={{ color: '#475569', fontWeight: 600 }}>Total Students Reported</div>
                  </div>
                  <button className="btn ghost" onClick={() => {
                    const sp = new URLSearchParams();
                    if (districtId) sp.set('districtId', districtId);
                    if (eventId) sp.set('eventId', eventId);
                    sp.set('frozen','true');
                    window.location.assign(`/it-admin/reports/participants?${sp.toString()}`);
                  }}>View All</button>
                </div>
                <div className="stat-value red" style={{ cursor: 'pointer' }} onClick={() => {
                  const sp = new URLSearchParams();
                  if (districtId) sp.set('districtId', districtId);
                  if (eventId) sp.set('eventId', eventId);
                  sp.set('frozen','true');
                  window.location.assign(`/it-admin/reports/participants?${sp.toString()}`);
                }}>{metrics?.participants?.total || 0}</div>
                {/* <div style={{ color: '#64748b', textAlign: 'center' }}>Total students currently marked present</div> */}
                <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button className="btn pill" >Boys - {metrics?.participants?.boys || 0}</button>
                  <button className="btn pill" >Girls - {metrics?.participants?.girls || 0}</button>
                </div>
              </div>

              {/* From Schools */}
              <div className="card stat-card" style={{ display: 'grid', gap: 8, overflow: 'hidden' }}>
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="dot blue" />
                    <div style={{ color: '#475569', fontWeight: 600 }}>Students Reported From Schools</div>
                  </div>
                  
                  <button className="btn ghost" onClick={() => {
                    const sp = new URLSearchParams();
                    if (districtId) sp.set('districtId', districtId);
                    if (eventId) sp.set('eventId', eventId);
                    sp.set('scope','school');
                    sp.set('frozen','true');
                    window.location.assign(`/it-admin/reports/participants?${sp.toString()}`);
                  }}>View All</button>
                </div>
                <div className="stat-value red" style={{ cursor: 'pointer' }} onClick={() => {
                  const sp = new URLSearchParams();
                  if (districtId) sp.set('districtId', districtId);
                  if (eventId) sp.set('eventId', eventId);
                  sp.set('scope','school');
                  sp.set('frozen','true');
                  window.location.assign(`/it-admin/reports/participants?${sp.toString()}`);
                }}>{metrics?.participants?.schoolCount || 0}</div>
                
                <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button className="btn pill">Boys - {metrics?.participants?.schoolBoys || 0}</button>
                  <button className="btn pill">Girls - {metrics?.participants?.schoolGirls || 0}</button>
                </div>

                {/* <div style={{ color: '#64748b', textAlign: 'center' }}>Present students from School submissions</div> */}
              </div>

              {/* From Districts */}
              <div className="card stat-card" style={{ display: 'grid', gap: 8, overflow: 'hidden' }}>
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="dot green" />
                    <div style={{ color: '#475569', fontWeight: 600 }}>Students Reported From Districts</div>
                  </div>
                  <button className="btn ghost" onClick={() => {
                    const sp = new URLSearchParams();
                    if (districtId) sp.set('districtId', districtId);
                    if (eventId) sp.set('eventId', eventId);
                    sp.set('scope','district');
                    sp.set('frozen','true');
                    window.location.assign(`/it-admin/reports/participants?${sp.toString()}`);
                  }}>View All</button>
                </div>
                <div className="stat-value red" style={{ cursor: 'pointer' }} onClick={() => {
                  const sp = new URLSearchParams();
                  if (districtId) sp.set('districtId', districtId);
                  if (eventId) sp.set('eventId', eventId);
                  sp.set('scope','district');
                  sp.set('frozen','true');
                  window.location.assign(`/it-admin/reports/participants?${sp.toString()}`);
                }}>{metrics?.participants?.districtCount || 0}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button className="btn pill" >Boys - {metrics?.participants?.districtBoys || 0}</button>
                  <button className="btn pill" >Girls - {metrics?.participants?.districtGirls || 0}</button>
                </div>
                {/* <div style={{ color: '#64748b', textAlign: 'center' }}>Present students from District submissions</div> */}
              </div>

              {/* Reported */}
              <div className="card stat-card" style={{ display: 'grid', gap: 8, overflow: 'hidden' }}>
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="dot violet" />
                    <div style={{ color: '#475569', fontWeight: 600 }}>Reported</div>
                  </div>
                  <button className="btn ghost" onClick={() => {
                    const sp = new URLSearchParams();
                    if (districtId) sp.set('districtId', districtId);
                    if (eventId) sp.set('eventId', eventId);
                    sp.set('present','true');
                    window.location.assign(`/it-admin/reports/participants?${sp.toString()}`);
                  }}>View All</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                    <div>
                      <div className="stat-subvalue">{metrics?.schools?.reportedCount || 0}</div>
                      <div style={{ color: '#64748b' }}>Schools Reported</div>
                    </div>
                    <div>
                      <div className="stat-subvalue">{metrics?.districts?.reportedCount || 0}</div>
                      <div style={{ color: '#64748b' }}>Districts Reported</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
                    <div>
                      <div className="stat-subvalue" style={{ color: '#10b981' }}>{metrics?.districts?.withSchoolsCount || 0}</div>
                      <div style={{ color: '#64748b' }}>Districts with Schools</div>
                    </div>
                    <div>
                      <div className="stat-subvalue" style={{ color: '#ef4444' }}>{metrics?.districts?.withoutSchoolsCount || 0}</div>
                      <div style={{ color: '#64748b' }}>Districts without Schools</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Teacher cards row */}
            <div className="stat-grid">
              {/* Accompanying Guru - Reported */}
              <div className="card stat-card" style={{ display: 'grid', gap: 8, overflow: 'hidden' }}>
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="dot green" />
                    <div style={{ color: '#475569', fontWeight: 600 }}> Total Accompanist Reported</div>
                  </div>
                  <button className="btn ghost" onClick={() => {
                    const sp = new URLSearchParams();
                    if (districtId) sp.set('districtId', districtId);
                    if (eventId) sp.set('eventId', eventId);
                    sp.set('frozen','true');
                    window.location.assign(`/it-admin/reports/teachers?${sp.toString()}`);
                  }}>View All</button>
                </div>
                <div className="stat-value red" style={{ cursor: 'pointer' }} onClick={() => {
                  const sp = new URLSearchParams();
                  if (districtId) sp.set('districtId', districtId);
                  if (eventId) sp.set('eventId', eventId);
                  sp.set('frozen','true');
                  window.location.assign(`/it-admin/reports/teachers?${sp.toString()}`);
                }}>{teachers?.reported?.total || 0}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button className="btn pill" >Gents - {teachers?.reported?.male || 0}</button>
                  <button className="btn pill" >Ladies - {teachers?.reported?.female || 0}</button>
                </div>
              </div>

             

              {/* Teachers Reported From Schools */}
              <div className="card stat-card" style={{ display: 'grid', gap: 8, overflow: 'hidden' }}>
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="dot blue" />
                    <div style={{ color: '#475569', fontWeight: 600 }}>Teachers Reported From Schools</div>
                  </div>
                  <button className="btn ghost" onClick={() => {
                    const sp = new URLSearchParams();
                    if (districtId) sp.set('districtId', districtId);
                    if (eventId) sp.set('eventId', eventId);
                    sp.set('frozen','true');
                    window.location.assign(`/it-admin/reports/teachers-by-school?${sp.toString()}`);
                  }}>View All</button>
                </div>
                <div className="stat-value red" style={{ cursor: 'pointer' }} onClick={() => {
                  const sp = new URLSearchParams();
                  if (districtId) sp.set('districtId', districtId);
                  if (eventId) sp.set('eventId', eventId);
                  sp.set('frozen','true');
                  window.location.assign(`/it-admin/reports/teachers-by-school?${sp.toString()}`);
                }}>{teachers?.reported?.schoolTeacher || 0}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button className="btn pill">Yet to Report - {teachers?.yetToReport?.schoolTeacher || 0}</button>
                </div>
              </div>

              {/* Gurus Reported From Schools */}
              <div className="card stat-card" style={{ display: 'grid', gap: 8, overflow: 'hidden' }}>
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="dot green" />
                    <div style={{ color: '#475569', fontWeight: 600 }}>Gurus Reported From Districts</div>
                  </div>
                  <button className="btn ghost" onClick={() => {
                    const sp = new URLSearchParams();
                    if (districtId) sp.set('districtId', districtId);
                    if (eventId) sp.set('eventId', eventId);
                    sp.set('scope','district');
                    sp.set('frozen','true');
                    window.location.assign(`/it-admin/reports/teachers?${sp.toString()}`);
                  }}>View All</button>
                </div>
                <div className="stat-value red" style={{ cursor: 'pointer' }} onClick={() => {
                  const sp = new URLSearchParams();
                  if (districtId) sp.set('districtId', districtId);
                  if (eventId) sp.set('eventId', eventId);
                  sp.set('scope','district');
                  sp.set('frozen','true');
                  window.location.assign(`/it-admin/reports/teachers?${sp.toString()}`);
                }}>{teachers?.reported?.districtGuru || 0}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button className="btn pill" >Yet to Report - {teachers?.yetToReport?.districtGuru || 0}</button>
                </div>
              </div>

              {/* Generate Detailed List (replaces Accompanying Guru - Yet to Report) */}
              <div className="card stat-card" style={{ display: 'grid', gap: 8, overflow: 'hidden', alignItems: 'center', justifyItems: 'center' }}>
                <div style={{ textAlign: 'center', paddingTop: 4 }}>
                  <h3 style={{ margin: 0, fontSize: 20 }}>Generate Detailed List</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', padding: '0 12px' }}>
                  <select value={reportDistrictId} onChange={(e) => { setReportDistrictId(e.target.value); setReportSchoolId(""); }}>
                    <option value="">District</option>
                    {(districts || []).map((d) => (
                      <option key={d._id} value={d._id}>{d.districtName}</option>
                    ))}
                  </select>
                  <select value={reportSchoolId} onChange={(e) => setReportSchoolId(e.target.value)} disabled={!reportDistrictId}>
                    <option value="">School</option>
                    {(() => {
                      if (!reportDistrictId) return null;
                      const notReportedSchools = (notReported?.schools || []).filter((s) => String(s.districtId) === String(reportDistrictId));
                      const excluded = new Set(notReportedSchools.map((s) => String(s._id)));
                      return (reportSchools || []).filter((s) => !excluded.has(String(s._id))).map((s) => (
                        <option key={s._id} value={s._id}>{s.schoolName}</option>
                      ));
                    })()}
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                  <button
                    className="btn"
                    onClick={handleGenerateDetailedList}
                    style={{ backgroundColor: '#38a3c7', borderRadius: 999, padding: '8px 32px', color: '#fff', fontWeight: 600 }}
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 12 }}>
              {/* Left: Yet to Report */}
              <div className="card" style={{ display: 'grid', gap: 8 }}>
                <div className="card-header">
                  <h3 style={{ margin: 0 }}>Yet to Report</h3>
                  <div style={{ display: 'flex', gap: 8 }}></div>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button className="btn ghost" onClick={() => setShowSchoolsNotReported((v) => !v)}>Schools: {notReported.schools.length}</button>
                  <button className="btn ghost" onClick={() => setShowDistrictsNotReported((v) => !v)}>Districts: {notReported.districts.length}</button>
                </div>

                {showSchoolsNotReported && (
                  <div style={{ marginTop: 12 }}>
                    <div className="table-wrapper">
                      <table className="styled-table">
                        <thead>
                          <tr>
                            <th>Sl.No</th>
                            <th>School</th>
                          </tr>
                        </thead>
                        <tbody>
                          {notReported.schools.length ? notReported.schools.map((s, i) => (
                            <tr key={s._id || `${s.schoolName}_${i}`}>
                              <td>{i + 1}</td>
                              <td>{s.schoolName}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan={2} style={{ textAlign: 'center' }}>No schools</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {showDistrictsNotReported && (
                  <div style={{ marginTop: 12 }}>
                    <div className="table-wrapper">
                      <table className="styled-table">
                        <thead>
                          <tr>
                            <th>Sl.No</th>
                            <th>District</th>
                          </tr>
                        </thead>
                        <tbody>
                          {notReported.districts.length ? notReported.districts.map((d, i) => (
                            <tr key={d._id}>
                              <td>{i + 1}</td>
                              <td>{d.districtName}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan={2} style={{ textAlign: 'center' }}>No districts</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Event-wise Report */}
              <div className="card" style={{ display: 'grid', gap: 8 }}>
                <div className="card-header" style={{ alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>Event-wise Report</h3>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn ghost" onClick={() => setShowEventWise(v => !v)}>{showEventWise ? 'Hide' : 'Show'}</button>
                    <button className="btn" onClick={() => {
                      const lines = [];
                      lines.push(["Scope","Event","Audience","Nomination","Present"].join(","));
                      const esc = (v) => (/[",\n]/.test(String(v))?`"${String(v).replace(/"/g,'""')}"`:String(v));
                      const toLine = (scope, r) => [scope, r.title, r.audience || '-', String(r.nomination||0), String(r.present||0)].map(esc).join(",");
                      eventAgg.school.forEach(r=>lines.push(toLine('School', r)));
                      eventAgg.district.forEach(r=>lines.push(toLine('District', r)));
                      const blob = new Blob([lines.join("\n")], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = 'event_wise_report.csv'; a.click(); URL.revokeObjectURL(url);
                    }}>CSV</button>
                    <button className="btn" onClick={async() => {
                      try {
                        const { default: jsPDF } = await import('jspdf');
                        const autoTable = (await import('jspdf-autotable')).default;
                        const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
                        doc.setFontSize(14);
                        doc.text('Event-wise Report', 40, 32);
                        const headSchool = [['Event','Audience','Nomination','Present']];
                        const toBodySchool = (arr) => arr.map(r => [r.title, r.audience || '-', String(r.nomination||0), String(r.present||0)]);
                        autoTable(doc, { head: headSchool, body: toBodySchool(eventAgg.school), startY: 48, headStyles: { fillColor: [59,130,246] }, styles: { fontSize: 9 }, theme: 'striped', margin: { left: 40, right: 40 } , didDrawPage: (data)=>{ doc.setFontSize(12); doc.text('School Events', 40, 44);} });
                        const afterY = doc.lastAutoTable.finalY + 18;
                        doc.setFontSize(12); doc.text('District Events', 40, afterY);
                        const headDistrict = [['Event','Nomination','Present']];
                        const toBodyDistrict = (arr) => arr.map(r => [r.title, String(r.nomination||0), String(r.present||0)]);
                        autoTable(doc, { head: headDistrict, body: toBodyDistrict(eventAgg.district), startY: afterY + 6, headStyles: { fillColor: [16,185,129] }, styles: { fontSize: 9 }, theme: 'striped', margin: { left: 40, right: 40 } });
                        doc.save('event_wise_report.pdf');
                      } catch(e) {
                        alert('Please install jspdf and jspdf-autotable to export PDF');
                      }
                    }}>PDF</button>
                  </div>
                </div>
                {showEventWise && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0' }}>School Events</h4>
                    <div className="table-wrapper">
                      <table className="styled-table">
                        <thead>
                          <tr>
                            <th>Event</th>
                            <th>Audience</th>
                            <th>Nomination</th>
                            <th>Present</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(eventAgg.school || []).length ? (eventAgg.school).map((r, i) => (
                            <tr key={`s_${r.eventId}_${i}`}>
                              <td>{r.title}</td>
                              <td>{r.audience || '-'}</td>
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
                  <div>
                    <h4 style={{ margin: '0 0 8px 0' }}>District Events</h4>
                    <div className="table-wrapper">
                      <table className="styled-table">
                        <thead>
                          <tr>
                            <th>Event</th>
                            <th>Nomination</th>
                            <th>Present</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(eventAgg.district || []).length ? (eventAgg.district).map((r, i) => (
                            <tr key={`d_${r.eventId}_${i}`}>
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
            </div>

            <div className="card">
              <div className="card-header">
                <h3 style={{ margin: 0 }}>Students Yet to Report</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {/* <button className="btn ghost" onClick={() => {
                    const sp = new URLSearchParams();
                    if (districtId) sp.set('districtId', districtId);
                    if (eventId) sp.set('eventId', eventId);
                    sp.set('present','false');
                    sp.set('scope','school');
                    window.location.assign(`/it-admin/reports/participants?${sp.toString()}`);
                  }}>View School List</button>
                  <button className="btn ghost" onClick={() => {
                    const sp = new URLSearchParams();
                    if (districtId) sp.set('districtId', districtId);
                    if (eventId) sp.set('eventId', eventId);
                    sp.set('present','false');
                    sp.set('scope','district');
                    window.location.assign(`/it-admin/reports/participants?${sp.toString()}`);
                  }}>View District List</button> */}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                <div>
                  <h4 style={{ marginTop: 0 }}>School-wise</h4>
                  <div className="table-wrapper">
                    <table className="styled-table">
                      <thead>
                        <tr>
                          <th>Sl.No</th>
                          <th>School</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsYet.schoolWise.length ? studentsYet.schoolWise.map((r, i) => (
                          <tr key={`${r.schoolName}_${i}`}>
                            <td>{i + 1}</td>
                            <td>{r.schoolName || '-'}</td>
                            <td>{r.count}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={3} style={{ textAlign: 'center' }}>No data</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h4 style={{ marginTop: 0 }}>District-wise</h4>
                  <div className="table-wrapper">
                    <table className="styled-table">
                      <thead>
                        <tr>
                          <th>Sl.No</th>
                          <th>District</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsYet.districtWise.length ? studentsYet.districtWise.map((r, i) => (
                          <tr key={r.districtId || i}>
                            <td>{i + 1}</td>
                            <td>{r.districtName || '-'}</td>
                            <td>{r.count}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={3} style={{ textAlign: 'center' }}>No data</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
