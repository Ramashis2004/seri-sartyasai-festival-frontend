import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { itListParticipants, itListTeachers } from "../api/itAdminApi";
import { toast } from "react-toastify";

export default function ITAdminDetailedList() {
  const sidebarItems = [
    { key: "overview", label: "Dashboard" },
    { key: "participants", label: "Participants" },
    { key: "teachers", label: "Accompanying Teacher & Guru" },
  ];

  const spInit = useMemo(() => new URLSearchParams(window.location.search), []);
  const [districtId] = useState(spInit.get("districtId") || "");
  const [eventId] = useState(spInit.get("eventId") || "");
  const [schoolName] = useState(spInit.get("schoolName") || "");
  const [scope] = useState(spInit.get("scope") || "");
  // We always show only finalized (frozen) records in this detailed view
  const [frozen] = useState("true");

  const [participants, setParticipants] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const summary = useMemo(() => {
    const totalParticipants = participants.length;
    const boys = participants.filter((p) => (p.gender || "").toLowerCase() === "boy").length;
    const girls = participants.filter((p) => (p.gender || "").toLowerCase() === "girl").length;

    const totalTeachers = teachers.length;
    const maleTeachers = teachers.filter((t) => (t.gender || "").toLowerCase().startsWith("m") || (t.gender || "").toLowerCase() === "boy").length;
    const femaleTeachers = teachers.filter((t) => (t.gender || "").toLowerCase().startsWith("f") || (t.gender || "").toLowerCase() === "girl").length;

    const byRole = teachers.reduce((acc, t) => {
      const key = String(t.member || t.role || t.designation || "Other");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return { totalParticipants, boys, girls, totalTeachers, maleTeachers, femaleTeachers, byRole };
  }, [participants, teachers]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const baseParams = { districtId, eventId, schoolName, frozen };
      if (scope) baseParams.scope = scope;
      const [pList, tList] = await Promise.all([
        itListParticipants(baseParams).catch(() => []),
        itListTeachers(baseParams).catch(() => []),
      ]);
      const safeParticipants = Array.isArray(pList) ? pList : [];
      const safeTeachers = Array.isArray(tList) ? tList : [];

      // If a specific school is selected (scope=school or schoolName present),
      // show only school-level teachers. Otherwise (district only), show only
      // district-level gurus/teachers.
      const filteredTeachers = (scope === "school" || schoolName)
        ? safeTeachers.filter((t) => t.source === "school")
        : safeTeachers.filter((t) => t.source === "district");

      setParticipants(safeParticipants);
      setTeachers(filteredTeachers);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load detailed list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toCSVParticipants = () => {
    const header = [
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
    const body = participants.map((r, i) => [
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
    const lines = [header, ...body].map((row) =>
      row
        .map((v) => {
          const s = String(v ?? "");
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "detailed_participants.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toCSVTeachers = () => {
    const header = ["Sl.No", "Role", "Name", "Mobile", "Gender", "School", "District", "Frozen"];
    const body = teachers.map((t, i) => [
      String(i + 1),
      t.member || t.role || t.designation || "",
      t.name || "",
      t.mobile || "",
      t.gender || "",
      t.schoolName || "",
      t.districtName || "",
      t.frozen ? "Yes" : "No",
    ]);
    const lines = [header, ...body].map((row) =>
      row
        .map((v) => {
          const s = String(v ?? "");
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "detailed_teachers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toPDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

      doc.setFontSize(14);
      doc.text("Detailed Participants & Teachers List", 40, 32);

      const partHeaders = [
        "Sl.No",
        "Name",
        "Class",
        "Gender",
        "Event",
        "Group",
        "School",
        "District",
      ];
      const partBody = participants.map((r, i) => [
        String(i + 1),
        r.name || "",
        r.className || "",
        r.gender || "",
        r.eventTitle || "",
        r.source === "school" ? (r.group || "-") : "-",
        r.schoolName || "",
        r.districtName || "",
      ]);

      autoTable(doc, {
        head: [partHeaders],
        body: partBody,
        startY: 48,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [71, 85, 105] },
      });

      const teachersStartY = (doc.lastAutoTable && doc.lastAutoTable.finalY + 24) || 72;
      doc.text("Accompanying Teachers / Guru", 40, teachersStartY);

      const teacherHeaders = [
        "Sl.No",
        "Role",
        "Name",
        "Mobile",
        "Gender",
        "School",
        "District",
      ];
      const teacherBody = teachers.map((t, i) => [
        String(i + 1),
        t.member || t.role || t.designation || "",
        t.name || "",
        t.mobile || "",
        t.gender || "",
        t.schoolName || "",
        t.districtName || "",
      ]);

      autoTable(doc, {
        head: [teacherHeaders],
        body: teacherBody,
        startY: teachersStartY + 8,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [71, 85, 105] },
      });

      doc.save("detailed_list.pdf");
    } catch (e) {
      toast.error("Please install jspdf and jspdf-autotable to export PDF");
    }
  };

  const headerTitle = useMemo(() => {
    if (schoolName) return `Detailed List - ${schoolName}`;
    return "Detailed List";
  }, [schoolName]);

  return (
    <DashboardLayout
      title={headerTitle}
      sidebarItems={sidebarItems}
      activeKey="overview"
      onSelectItem={(key) => window.location.assign(`/it-admin/${key}`)}
    >
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn" onClick={() => window.history.back()}>Back</button>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button className="btn" onClick={toCSVParticipants}>Download Participants CSV</button>
            <button className="btn" onClick={toCSVTeachers}>Download Teachers CSV</button>
            <button className="btn" onClick={toPDF}>Download Combined PDF</button>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: "#dc2626", fontWeight: 600 }}>{error}</p>
        ) : (
          <>
            <div className="card" style={{ display: "grid", gap: 8 }}>
              <div className="card-header">
                <h3 style={{ margin: 0 }}>Summary</h3>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Participants</div>
                  <div>Total: {summary.totalParticipants}</div>
                  <div>Boys: {summary.boys}</div>
                  <div>Girls: {summary.girls}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Accompanying Teacher & Guru</div>
                  <div>Total: {summary.totalTeachers}</div>
                  <div>Gents: {summary.maleTeachers}</div>
                  <div>Ladies: {summary.femaleTeachers}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>By Role</div>
                  {Object.keys(summary.byRole).length === 0 ? (
                    <div>No roles</div>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {Object.entries(summary.byRole).map(([role, count]) => (
                        <li key={role}>{role}: {count}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="card" style={{ display: "grid", gap: 8 }}>
              <div className="card-header">
                <h3 style={{ margin: 0 }}>Participants</h3>
              </div>
              <div className="table-wrapper">
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>Sl.No</th>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Gender</th>
                      <th>Event</th>
                      <th>Group</th>
                      <th>School</th>
                      <th>District</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.length ? (
                      participants.map((r, i) => (
                        <tr key={r._id || i}>
                          <td>{i + 1}</td>
                          <td>{r.name}</td>
                          <td>{r.className || "-"}</td>
                          <td>{r.gender || "-"}</td>
                          <td>{r.eventTitle || "-"}</td>
                          <td>{r.source === "school" ? (r.group || "-") : "-"}</td>
                          <td>{r.schoolName || "-"}</td>
                          <td>{r.districtName || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center" }}>No participants</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card" style={{ display: "grid", gap: 8 }}>
              <div className="card-header">
                <h3 style={{ margin: 0 }}>Accompanying Teachers & Gurus</h3>
              </div>
              <div className="table-wrapper">
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>Sl.No</th>
                      <th>Role</th>
                      <th>Name</th>
                      <th>Mobile</th>
                      <th>Gender</th>
                      <th>School</th>
                      <th>District</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.length ? (
                      teachers.map((t, i) => (
                        <tr key={t._id || i}>
                          <td>{i + 1}</td>
                          <td>{t.member || t.role || t.designation || "-"}</td>
                          <td>{t.name || "-"}</td>
                          <td>{t.mobile || "-"}</td>
                          <td>{t.gender || "-"}</td>
                          <td>{t.schoolName || "-"}</td>
                          <td>{t.districtName || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center" }}>No teachers</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
