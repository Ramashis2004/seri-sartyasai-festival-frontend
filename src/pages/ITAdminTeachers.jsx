import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { itListTeachers, itUpdateTeacher, itFinalizeTeachers, itCreateTeacher } from "../api/itAdminApi";
import districtApi from "../api/districtApi";
import adminApi from "../api/adminApi";
import Swal from "sweetalert2";

// Role options for different user types
const ROLE_OPTIONS = {
  teacher: [
    { value: 'secretary_manager', label: 'Secretary/Manager' },
    { value: 'mc_member', label: 'MC Member' },
    { value: 'principal', label: 'Principal' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'other', label: 'Other' }
  ],
  district: [
    { value: 'dist_president', label: 'Dist President' },
    { value: 'dist_edu_coordinator_gents', label: 'Dist Edu-Coordinator (Gents)' },
    { value: 'dist_edu_coordinator_ladies', label: 'Dist Edu-Coordinator (Ladies)' },
    { value: 'dist_monitoring_committee', label: 'Dist. Monitoring Committee' },
    { value: 'guru', label: 'Guru' },
    { value: 'parents', label: 'Parents' },
    { value: 'other', label: 'Other' }
  ]
};

// Helper function to determine if a role is a district role
const isDistrictRole = (role) => {
  if (!role) return false;
  const roleLower = role.toLowerCase();
  return ROLE_OPTIONS.district.some(r => r.value === roleLower) || 
         (roleLower !== '' && !ROLE_OPTIONS.teacher.some(r => r.value === roleLower));
};

export default function ITAdminTeachers() {
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
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");

  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [events, setEvents] = useState([]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    setIf(maybe('role'), setRole);
    setIf(maybe('q'), setQ);
  }, []);

  useEffect(() => {
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
        const [schoolEvents, districtEvents] = await Promise.all([
          adminApi.adminListEvents().catch(() => []),
          adminApi.adminListDistrictEvents().catch(() => []),
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
      const data = await itListTeachers({ scope, districtId, schoolName, eventId, present, frozen, q });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItems([]);
      setError(e?.response?.data?.message || "Failed to load teachers");
    } finally { setLoading(false); }
  };

  const onResetFilters = () => {
    setScope("all");
    setDistrictId("");
    setSchoolName("");
    setEventId("");
    setPresent("");
    setFrozen("");
    setQ("");
    setRole("");
  };

  const onAdd = async () => {
    const typeOptions = [
      { value: 'school', label: 'School' },
      { value: 'district', label: 'District' },
    ];

    const typeHtml = (selected = 'school') => `
      <div style="text-align: left;">
        <div class="swal2-form-row">
          <label><strong>Participant Type</strong></label>
          <select id="swal-type" class="swal2-select">
            ${typeOptions.map(o => `<option value="${o.value}" ${selected===o.value?'selected':''}>${o.label}</option>`).join('')}
          </select>
        </div>

        <div id="row-district" class="swal2-form-row">
          <label><strong>Select District</strong></label>
          <select id="swal-district" class="swal2-select">
            <option value="">Select District</option>
            ${districts.map(d => `<option value="${d._id}">${d.districtName}</option>`).join('')}
          </select>
        </div>

        <div id="row-school" class="swal2-form-row" style="display:${selected==='school'?'block':'none'};">
          <label><strong>Select School</strong></label>
          <select id="swal-school" class="swal2-select">
            <option value="">Select School</option>
          </select>
        </div>

        <div class="swal2-form-row">
          <label><strong>Designation</strong></label>
          <select id="swal-role" class="swal2-select">
            ${(ROLE_OPTIONS.teacher).map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
          </select>
        </div>
        <div id="row-other-role" class="swal2-form-row" style="display:none;">
          <label><strong>Specify Role</strong></label>
          <input id="swal-other-role" class="swal2-input" placeholder="Enter role" />
        </div>

        <div class="swal2-form-row">
          <label><strong>Name</strong></label>
          <input id="swal-name" class="swal2-input" placeholder="Name" />
        </div>
        <div class="swal2-form-row">
          <label><strong>Mobile No</strong></label>
          <input id="swal-phone" class="swal2-input" placeholder="Mobile" inputmode="numeric" pattern="\\d{10}" maxlength="10" />
        </div>
        <div class="swal2-form-row">
          <label><strong>Gender</strong></label>
          <select id="swal-gender" class="swal2-select">
            <option value="">Select</option>
            <option value="boy">Boy</option>
            <option value="girl">Girl</option>
          </select>
        </div>
      </div>
    `;

    const { value } = await Swal.fire({
      title: 'Add Participant',
      html: typeHtml('school'),
      width: '650px',
      focusConfirm: false,
      showCloseButton: true,
      showCancelButton: true,
      cancelButtonText: 'Close',
      didOpen: () => {
        const typeSel = document.getElementById('swal-type');
        const roleSel = document.getElementById('swal-role');
        const otherRoleRow = document.getElementById('row-other-role');
        const distSel = document.getElementById('swal-district');
        const schoolRow = document.getElementById('row-school');
        const schoolSel = document.getElementById('swal-school');
        const phoneInput = document.getElementById('swal-phone');

        const renderRoleOptions = () => {
          const t = typeSel.value === 'district' ? 'district' : 'teacher';
          roleSel.innerHTML = ROLE_OPTIONS[t].map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');
          otherRoleRow.style.display = 'none';
        };

        const loadSchoolsFor = async (districtId) => {
          if (!schoolSel) return;
          schoolSel.innerHTML = `<option value="">Loading...</option>`;
          try {
            const list = districtId ? await districtApi.getAllSchools({ districtId }) : [];
            schoolSel.innerHTML = [`<option value="">Select School</option>`, ...(list||[]).map(s => `<option value="${s.schoolName}">${s.schoolName}</option>`)].join('');
          } catch {
            schoolSel.innerHTML = `<option value="">Select School</option>`;
          }
        };

        typeSel?.addEventListener('change', () => {
          const isSchool = typeSel.value === 'school';
          schoolRow.style.display = isSchool ? 'block' : 'none';
          renderRoleOptions();
        });
        roleSel?.addEventListener('change', () => {
          otherRoleRow.style.display = roleSel.value === 'other' ? 'block' : 'none';
        });
        distSel?.addEventListener('change', (e) => {
          if (typeSel.value === 'school') loadSchoolsFor(e.target.value);
        });
        if (phoneInput) {
          const enforceDigits = (e) => {
            const digits = (e.target.value || '').replace(/\D/g, '').slice(0, 10);
            if (e.target.value !== digits) e.target.value = digits;
          };
          phoneInput.addEventListener('input', enforceDigits);
          phoneInput.addEventListener('blur', enforceDigits);
        }
        // initial
        renderRoleOptions();
      },
      preConfirm: () => {
        const type = document.getElementById('swal-type').value;
        const districtId = document.getElementById('swal-district').value;
        const schoolName = document.getElementById('swal-school')?.value || '';
        const roleSel = document.getElementById('swal-role');
        const selectedRole = roleSel ? roleSel.value : '';
        const otherRole = document.getElementById('swal-other-role')?.value || '';
        const name = document.getElementById('swal-name').value;
        const phoneRaw = document.getElementById('swal-phone').value;
        const phone = (phoneRaw || '').replace(/\D/g, '').slice(0, 10);
        const gender = (document.getElementById('swal-gender').value || '').toLowerCase();

        // basic validation
        if (!type) { Swal.showValidationMessage('Select Participant Type'); return; }
        if (!districtId) { Swal.showValidationMessage('Select District'); return; }
        if (type === 'school' && !schoolName) { Swal.showValidationMessage('Select School'); return; }
        if (!name) { Swal.showValidationMessage('Enter Name'); return; }
        if (!/^[0-9]{10}$/.test(phone)) { Swal.showValidationMessage('Enter a valid 10-digit Mobile No'); return; }

        return {
          source: type,
          districtId,
          schoolName: type === 'school' ? schoolName : undefined,
          name,
          phone,
          gender,
          member: selectedRole === 'other' ? otherRole : selectedRole,
        };
      }
    });

    if (!value) return;
    try {
      await itCreateTeacher(value);
      await load();
      await Swal.fire({ icon: 'success', title: 'Added', timer: 1500, showConfirmButton: false });
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to add';
      await Swal.fire({ icon: 'error', title: 'Add failed', text: msg });
    }
  };

  useEffect(() => { load(); }, [scope, districtId, schoolName, eventId, present, frozen, q]);

  useEffect(() => {
    if (!anchorId) return;
    const t = setTimeout(() => {
      const el = document.getElementById(`teacher-row-${anchorId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
    return () => clearTimeout(t);
  }, [items, anchorId]);

  const onTogglePresent = async (row) => {
    if (row.frozen) return;
    try {
      setAnchorId(String(row._id));
      await itUpdateTeacher(row._id, { source: row.source, updates: { present: !row.present } });
      await load();
    } catch {}
  };

  const onEdit = async (row) => {
    // Determine user type based on role
    const isDistrict = isDistrictRole(row.role || row.member);
    const userType = isDistrict ? 'district' : 'teacher';
    const currentRole = (row.role || row.member || '').toLowerCase();
    const showOtherInput = !ROLE_OPTIONS[userType].some(opt => opt.value === currentRole) && currentRole !== '';
    
    // Create the HTML for the form
    const formHtml = `
      <div style="text-align: left;">
        <div class="swal2-form-row">
          <label><strong>User Type:</strong></label><br>
          <select id="swal-user-type" class="swal2-select" style="width: 100%; margin: 8px 0;">
            <option value="teacher" ${!isDistrict ? 'selected' : ''}>Teacher</option>
            <option value="district" ${isDistrict ? 'selected' : ''}>District Guru</option>
          </select>
        </div>

        <div class="swal2-form-row">
          <label><strong>Name:</strong></label>
          <input id="swal-name" class="swal2-input" placeholder="Name" value="${row.name || ""}">
        </div>

        <div class="swal2-form-row">
          <label><strong>Phone:</strong></label>
          <input id="swal-phone" class="swal2-input" placeholder="Phone" value="${row.phone || ""}">
        </div>

        <div class="swal2-form-row">
          <label><strong>Gender:</strong></label><br>
          <div style="display: flex; gap: 15px; margin: 8px 0;">
            <label style="display: flex; align-items: center; gap: 5px;">
              <input type="radio" name="swal-gender" value="boy" ${row.gender === "boy" ? "checked" : ""}>
              Boy
            </label>
            <label style="display: flex; align-items: center; gap: 5px;">
              <input type="radio" name="swal-gender" value="girl" ${row.gender === "girl" ? "checked" : ""}>
              Girl
            </label>
          </div>
        </div>

        <div class="swal2-form-row">
          <label><strong>Role:</strong></label>
          <select id="swal-role" class="swal2-select" style="width: 100%; margin: 8px 0 0 0;">
            ${ROLE_OPTIONS[userType].map(opt => 
              `<option value="${opt.value}" ${currentRole === opt.value ? 'selected' : ''}>${opt.label}</option>`
            ).join('')}
            ${showOtherInput ? `<option value="${currentRole}" selected>Other: ${currentRole}</option>` : ''}
          </select>
        </div>

        <div id="swal-other-role-container" class="swal2-form-row" style="display: ${showOtherInput ? 'block' : 'none'};">
          <label><strong>Specify Role:</strong></label>
          <input id="swal-other-role" class="swal2-input" placeholder="Enter role" value="${showOtherInput ? (row.role || row.member || '') : ''}">
        </div>
      </div>
    `;

    const { value: formValues } = await Swal.fire({
      title: "Edit Teacher/Guru",
      html: formHtml,
      width: '600px',
      focusConfirm: false,
      showCloseButton: true,
      showCancelButton: true,
      cancelButtonText: "Close",
      didOpen: () => {
        // Add event listener for role change
        const roleSelect = document.getElementById('swal-role');
        const userTypeSelect = document.getElementById('swal-user-type');
        const otherRoleContainer = document.getElementById('swal-other-role-container');
        
        if (roleSelect) {
          roleSelect.addEventListener('change', (e) => {
            if (otherRoleContainer) {
              otherRoleContainer.style.display = e.target.value === 'other' ? 'block' : 'none';
            }
          });
        }
        
        if (userTypeSelect) {
          userTypeSelect.addEventListener('change', (e) => {
            const roleSelect = document.getElementById('swal-role');
            const selectedType = e.target.value;
            const roles = ROLE_OPTIONS[selectedType];
            
            if (roleSelect) {
              // Save current role if it's an 'other' value
              const currentValue = roleSelect.value;
              const isOtherValue = currentValue && ![...ROLE_OPTIONS.teacher, ...ROLE_OPTIONS.district].some(opt => opt.value === currentValue);
              
              roleSelect.innerHTML = [
                ...roles.map(opt => 
                  `<option value="${opt.value}">${opt.label}</option>`
                )
              ].join('');
              
              // If we had an 'other' value, add it back
              if (isOtherValue && currentValue) {
                const option = document.createElement('option');
                option.value = currentValue;
                option.textContent = `Other: ${currentValue}`;
                option.selected = true;
                roleSelect.appendChild(option);
              }
              
              // Show/hide other role input based on selection
              const otherRoleContainer = document.getElementById('swal-other-role-container');
              if (otherRoleContainer) {
                otherRoleContainer.style.display = roleSelect.value === 'other' ? 'block' : 'none';
              }
            }
          });
        }
      },
      preConfirm: () => {
        const userType = document.getElementById('swal-user-type').value;
        const roleSelect = document.getElementById('swal-role');
        const selectedRole = roleSelect ? roleSelect.value : '';
        const otherRole = document.getElementById('swal-other-role') ? document.getElementById('swal-other-role').value : '';
        
        return {
          name: document.getElementById("swal-name").value,
          phone: document.getElementById("swal-phone").value,
          gender: (document.querySelector('input[name="swal-gender"]:checked')?.value || "").toLowerCase(),
          role: selectedRole === 'other' ? otherRole : selectedRole,
          member: selectedRole === 'other' ? otherRole : selectedRole,
          userType: userType
        };
      }
    });

    if (!formValues) return;

    try {
      setAnchorId(String(row._id));
      // Create a new payload without userType since it's not allowed to be updated
      const { userType, ...updates } = formValues;
      const payload = { ...updates };
      if (!payload.member) payload.member = payload.role || "";
      delete payload.role; // backend does not accept 'role', only 'member'
      const resp = await itUpdateTeacher(row._id, { source: row.source, updates: payload });
      const updated = resp?.teacher ? { ...row, ...resp.teacher } : { ...row, ...payload };
      setItems((prev) => (prev || []).map((it) => (
        String(it._id) === String(row._id) ? { ...it, ...updated } : it
      )));
      await load();
      await Swal.fire({ icon: "success", title: "Updated", timer: 1500, showConfirmButton: false });
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to update";
      await Swal.fire({ icon: "error", title: "Update failed", text: msg });
    }
  };

  const onFreeze = async (freeze) => {
    const ok = await Swal.fire({ title: freeze ? "Freeze list?" : "Unfreeze list?", icon: "question", showCancelButton: true, confirmButtonText: freeze ? "Freeze" : "Unfreeze" });
    if (!ok.isConfirmed) return;
    try {
      await itFinalizeTeachers({ scope, eventId, districtId, schoolName, freeze });
      await load();
    } catch {}
  };

  const getRoleText = (r) => {
    const raw = (r?.role || r?.member || r?.designation || r?.roleName || r?.type || r?.category || "").trim();
    if (!raw) return "-";
    
    // Check all role options first
    const allRoles = [...ROLE_OPTIONS.teacher, ...ROLE_OPTIONS.district];
    const matchedRole = allRoles.find(role => role.value === raw.toLowerCase());
    if (matchedRole) return matchedRole.label;
    
    // Check custom role maps
    const map = {
      secretary_manager: "Secretary/Manager",
      mc_member: "MC Member",
      principal: "Principal",
      teacher: "Teacher",
      guru: "Guru",
      dist_president: "Dist President",
      dist_edu_coordinator_gents: "Dist Edu-Coordinator (Gents)",
      dist_edu_coordinator_ladies: "Dist Edu-Coordinator (Ladies)",
      dist_monitoring_committee: "Dist. Monitoring Committee",
      parents: "Parents"
    };
    
    return map[raw.toLowerCase()] || raw;
  };

  const uniqueRoles = useMemo(() => {
    const s = new Set();
    (items || []).forEach(r => {
      const txt = getRoleText(r);
      if (txt) s.add(txt);
    });
    return Array.from(s).sort();
  }, [items]);

  const filtered = useMemo(() => {
    let arr = items;
    if (role) arr = arr.filter(r => getRoleText(r).toLowerCase() === role.toLowerCase());
    return arr;
  }, [items, role]);

  const onToggleFreezeRow = async (row) => {
    try {
      setAnchorId(String(row._id));
      await itUpdateTeacher(row._id, { source: row.source, updates: { frozen: !row.frozen } });
      await load();
    } catch {}
  };

  const toCSV = () => {
    const header = [
      "Sl. No",
      "Name",
      "Phone",
      "Gender",
      "Role",
      "School",
      "District",
      "Present",
      "Frozen"
    ];
    const body = filtered.map((r, i) => [
      String(i + 1),
      r.name || "",
      r.phone || "",
      r.gender || "",
      getRoleText(r) || "",
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
    a.download = "teachers_list.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toPDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const headers = [
        "Sl. No",
        "Name",
        "Phone",
        "Gender",
        "Role",
        "School",
        "District",
        "Present",
        "Frozen",
      ];
      const body = filtered.map((r, i) => [
        String(i + 1),
        r.name || "",
        r.phone || "",
        r.gender || "",
        getRoleText(r) || "",
        r.schoolName || "",
        r.districtName || "",
        r.present ? "Yes" : "No",
        r.frozen ? "Yes" : "No",
      ]);
      doc.setFontSize(14);
      doc.text("Accompanying Teacher & Guru", 40, 32);
      autoTable(doc, {
        head: [headers],
        body,
        startY: 48,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [71, 85, 105] },
      });
      doc.save("teachers_list.pdf");
    } catch (e) {
      alert("Please install jspdf and jspdf-autotable to export PDF");
    }
  };

  // Add some styles for the form
  const styles = `
    .swal2-form-row {
      margin-bottom: 15px;
    }
    .swal2-form-row label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
    }
    .swal2-select {
      width: 100%;
      padding: 8px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      font-size: 14px;
    }
    .swal2-input {
      margin: 8px 0;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <DashboardLayout
      title="IT Admin Dashboard"
      sidebarItems={sidebarItems}
      activeKey="teachers"
      onSelectItem={(key) => window.location.assign(`/it-admin/${key}`)}
    >
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8 }}>
          <select value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="all">School / Distict</option>
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
          {/* <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">All Events</option>
            {events.map((ev) => <option key={`${ev.source}_${ev._id}`} value={ev._id}>{ev.title}</option>)}
          </select> */}
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
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All Roles</option>
            {uniqueRoles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <input placeholder="Search name/phone" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: 'center' }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onAdd} className="btn" style={{ background: '#2563eb', color: '#fff' }}>Add Participant</button>
            <button onClick={toCSV} className="btn">Download CSV</button>
            <button onClick={toPDF} className="btn">Download PDF</button>
          </div>
          <div>
            <button onClick={onResetFilters} className="btn" style={{ background: '#ef4444', color: '#fff' }}>Reset Filters</button>
          </div>
        </div>

        {loading ? <p>Loading...</p> : error ? <p style={{ color: '#dc2626', fontWeight: 600 }}>{error}</p> : (
          <div className="table-wrapper">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Sl. No</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>Role</th>
                  <th>School</th>
                  <th>District</th>
                  <th>Present</th>
                  <th>Frozen</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? filtered.map((r, i) => (
                  <tr key={r._id} id={`teacher-row-${r._id}`} style={{ backgroundColor: r.present ? '#b5d6a7' : 'transparent' }}>
                    <td>{i + 1}</td>
                    <td>{r.name}</td>
                    <td>{r.phone || "-"}</td>
                    <td>{r.gender==="boy"?"Gents":"Ladies" || "-"}</td>
                    <td>{getRoleText(r) || "-"}</td>
                    <td>{r.schoolName || "-"}</td>
                    <td>{r.districtName || '-'}</td>
                    <td>
                      <input type="checkbox" checked={!!r.present} disabled={!!r.frozen} onChange={() => onTogglePresent(r)} />
                    </td>
                    <td>
                      <input type="checkbox" checked={!!r.frozen} onChange={() => onToggleFreezeRow(r)} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn small" onClick={() => onEdit(r)} disabled={!!r.frozen}>Edit</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={10} style={{ textAlign: "center", color: '#475569' }}>No teachers/gurus match the current filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </DashboardLayout>
    </>
  );
}
