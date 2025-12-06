import React, { useEffect, useMemo, useRef, useState } from "react";
import districtApi from "../api/districtApi";
import { toast } from "react-toastify";
import DashboardLayout from "../components/DashboardLayout";
import adminApi from "../api/adminApi";
import "../styles/AdminUsers.css";
import { FaHome, FaUsers, FaBuilding, FaSchool, FaCog, FaEdit, FaKey, FaBan, FaCheck, FaTrash, FaCalendarPlus, FaBullhorn, FaClipboardList } from "react-icons/fa";

const Modal = ({ title, children, show, onClose }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container animate-fade">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

// Dropdown for selecting a District
const DistrictSelector = ({ districtId, setDistrictId }) => {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const d = await districtApi.getAllDistricts();
        setDistricts(d || []);
      } catch {
        setDistricts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <select value={districtId} onChange={(e) => setDistrictId(e.target.value)} className="input" required>
      <option value="">{loading ? "Loading districts..." : "Select District"}</option>
      {districts.map((d) => (
        <option key={d._id} value={d._id}>
          {d.districtName}
        </option>
      ))}
    </select>
  );
};

// Combined selectors for District and School (schools filtered by district)
const DistrictAndSchoolSelectors = ({ districtId, setDistrictId, schoolName, setSchoolName }) => {
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoadingDistricts(true);
        const d = await districtApi.getAllDistricts();
        setDistricts(d || []);
      } catch {
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    })();
  }, []);

  useEffect(() => {
    const loadSchools = async () => {
      if (!districtId) {
        setSchools([]);
        setSchoolName("");
        return;
      }
      try {
        setLoadingSchools(true);
        const s = await districtApi.getAllSchools({ districtId });
        setSchools(s || []);
      } catch {
        setSchools([]);
      } finally {
        setLoadingSchools(false);
      }
    };
    loadSchools();
  }, [districtId, setSchoolName]);

  return (
    <>
      <div className="form-group" style={{ display: "grid", gap: 6 }}>
        <label>District</label>
        <select
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          className="input"
          required
        >
          <option value="">{loadingDistricts ? "Loading districts..." : "Select District"}</option>
          {districts.map((d) => (
            <option key={d._id} value={d._id}>
              {d.districtName}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group" style={{ display: "grid", gap: 6 }}>
        <label>School</label>
        <select
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          className="input"
          required
          disabled={!districtId || loadingSchools}
        >
          <option value="">{loadingSchools ? "Loading schools..." : "Select School"}</option>
          {schools.map((s) => (
            <option key={s._id} value={s.schoolName}>
              {s.schoolName}
            </option>
          ))}
        </select>
      </div>
    </>
  );
};

export default function AdminUsers() {
  const sidebarItems = [
    { key: "overview", label: "Dashboard", icon: <FaHome /> },
    { key: "users", label: "Users", icon: <FaUsers /> },
    { key: "districts", label: "Districts", icon: <FaBuilding /> },
    { key: "schools", label: "Schools", icon: <FaSchool /> },
    { key: "events", label: "Events", icon: <FaCalendarPlus /> },
    { key: "announcements", label: "Announcements", icon: <FaBullhorn /> },
    { key: "evaluation", label: "Evaluation Form", icon: <FaClipboardList /> },
    { key: "settings", label: "School Roles", icon: <FaCog /> },
  ];

  const roles = useMemo(
    () => [
      // Excluding admins from Users table per requirement
      "district_coordinator",
      "it_admin",
      "event_coordinator",
      "school_user",
    ],
    []
  );

  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [schoolRoles, setSchoolRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [resetState, setResetState] = useState({
    role: "",
    id: "",
    newPassword: "",
  });
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showEditNewPassword, setShowEditNewPassword] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [filterDistrictId, setFilterDistrictId] = useState("");
  const [filterSchoolName, setFilterSchoolName] = useState("");
  const [filterDistricts, setFilterDistricts] = useState([]);
  const [filterSchools, setFilterSchools] = useState([]);
  const [loadingFilterDistricts, setLoadingFilterDistricts] = useState(false);
  const [loadingFilterSchools, setLoadingFilterSchools] = useState(false);

  const menuRef = useRef(null);

  // Close dropdown when clicking outside any action-menu
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.action-menu')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");
      const userLists = await Promise.all(roles.map((r) => adminApi.listUsers(r)));
      const mapped = {};
      roles.forEach((r, i) => (mapped[r] = userLists[i] || []));
      setUsers(mapped);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Load Districts for filters
  useEffect(() => {
    (async () => {
      try {
        setLoadingFilterDistricts(true);
        const d = await districtApi.getAllDistricts();
        setFilterDistricts(d || []);
      } catch {
        setFilterDistricts([]);
      } finally {
        setLoadingFilterDistricts(false);
      }
    })();
  }, []);

  // Load Schools for filters when district changes
  useEffect(() => {
    const loadSchools = async () => {
      if (!filterDistrictId) {
        setFilterSchools([]);
        setFilterSchoolName("");
        return;
      }
      try {
        setLoadingFilterSchools(true);
        const s = await districtApi.getAllSchools({ districtId: filterDistrictId });
        setFilterSchools(s || []);
      } catch {
        setFilterSchools([]);
      } finally {
        setLoadingFilterSchools(false);
      }
    };
    loadSchools();
  }, [filterDistrictId]);

  // Load School Roles (for school_user editing)
  useEffect(() => {
    (async () => {
      try {
        setLoadingRoles(true);
        const r = await districtApi.getSchoolRoles();
        setSchoolRoles(r || []);
      } catch {
        setSchoolRoles([]);
      } finally {
        setLoadingRoles(false);
      }
    })();
  }, []);

  const toggleApprove = async (role, id, approved) => {
    try {
      await adminApi.approveUser(role, id, { approved });
      await loadAll();
      toast.success("User status updated");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update approval");
    }
  };

  const doReset = async (e) => {
    e.preventDefault();
    try {
      await adminApi.resetUserPassword(
        resetState.role,
        resetState.id,
        resetState.newPassword
      );
      toast.success("Password reset successfully");
      setResetState({ role: "", id: "", newPassword: "" });
      await loadAll();
    } catch (e2) {
      toast.error(e2?.response?.data?.message || "Failed to reset password");
    }
  };

  const handleDelete = async (role, id) => {
    try {
      const ok = window.confirm("Are you sure you want to permanently delete this user?");
      if (!ok) return;
      await adminApi.deleteUser(role, id);
      toast.success("User deleted successfully");
      await loadAll();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to delete user");
    }
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const flat = roles.flatMap((r) => (users[r] || []).map((u) => ({ ...u, _role: r })));
  const total = flat.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedFlat = flat.slice(startIndex, endIndex);

  return (
    <DashboardLayout
      title="Admin Dashboard"
      sidebarItems={sidebarItems}
      activeKey="users"
      onSelectItem={(key) => window.location.assign(`/admin/${key}`)}
    >
      <div className="admin-users-page">
        <div className="page-header">
         
          <div className="page-header">
            <h2>User Management</h2>
            <div className="filters-container">
              <div className="filter-group">
                <label>Filter by Role: </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="all">All</option>
                  {roles.map((r) => ( 
                    <option key={r} value={r}>
                      {r.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Status: </label>
                <select
                  value={approvalFilter}
                  onChange={(e) => setApprovalFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
              <div className="filter-group">
                <label>District: </label>
                <select
                  value={filterDistrictId}
                  onChange={(e) => setFilterDistrictId(e.target.value)}
                >
                  <option value="">All</option>
                  {filterDistricts.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.districtName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>School: </label>
                <select
                  value={filterSchoolName}
                  onChange={(e) => setFilterSchoolName(e.target.value)}
                  disabled={!filterDistrictId || loadingFilterSchools}
                >
                  <option value="">All</option>
                  {filterSchools.map((s) => (
                    <option key={s._id} value={s.schoolName}>
                      {s.schoolName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

         
        </div>

        {loading && <p className="loading-text">Loading users...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && (
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Sl No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>District</th>
                  <th>School</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
               {flat
  .filter((u) => (selectedRole === "all" || u._role === selectedRole) && 
                 (approvalFilter === "all" || 
                  (approvalFilter === "pending" && !u.approved) || 
                  (approvalFilter === "approved" && u.approved)) &&
                 (filterDistrictId === "" || u.districtId === filterDistrictId) &&
                 (filterSchoolName === "" || (u.schoolName || "") === filterSchoolName))
  .map((u, i) => (

                  <tr key={u._id}>
                    <td>{startIndex + i + 1}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u._role}</td>
                    <td>{(filterDistricts.find((d) => d._id === u.districtId) || {}).districtName || "-"}</td>
                    <td>{u.schoolName || "-"}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          u.approved ? "approved" : "pending"
                        }`}
                      >
                        {u.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td>
                      <div className="action-menu" ref={menuRef}>
                        <button
                          className="menu-trigger"
                          onClick={() =>
                            setOpenMenuId(openMenuId === u._id ? null : u._id)
                          }
                        >
                          ⋮
                        </button>

                        {openMenuId === u._id && (
                          <div className="menu-dropdown">
                            <button
                              onClick={() => {
                                setEditUser(u);
                                setOpenMenuId(null);
                              }}
                              className="menu-item"
                            >
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                <FaEdit /> Edit
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                setResetState({
                                  role: u._role,
                                  id: u._id,
                                  newPassword: "",
                                });
                                setOpenMenuId(null);
                              }}
                              className="menu-item"
                            >
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                <FaKey /> Reset Password
                              </span>
                            </button>
                            {u.approved ? (
                              <button
                                onClick={() => {
                                  toggleApprove(u._role, u._id, false);
                                  setOpenMenuId(null);
                                }}
                                className="menu-item danger"
                              >
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                  <FaBan /> Deactivate
                                </span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  toggleApprove(u._role, u._id, true);
                                  setOpenMenuId(null);
                                }}
                                className="menu-item success"
                              >
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                  <FaCheck /> Approve
                                </span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                handleDelete(u._role, u._id);
                              }}
                              className="menu-item danger"
                            >
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                <FaTrash /> Delete
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="pagination-bar">
        <div className="pagination-info">
          Showing <strong>{total ? startIndex + 1 : 0}</strong>–<strong>{Math.min(endIndex, total)}</strong> of <strong>{total}</strong>
        </div>
        <div className="pagination-controls">
          <div className="rows-per-page">
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const size = Number(e.target.value) || 10;
                setPageSize(size);
                setPage(1);
              }}
              className="input"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <button
            className="btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            Prev
          </button>
          <div className="page-counter">
            Page {currentPage} / {totalPages}
          </div>
          <button
            className="btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Reset Password Modal */}
      <Modal
        title="Reset User Password"
        show={!!resetState.id}
        onClose={() => setResetState({ role: "", id: "", newPassword: "" })}
      >
        <form onSubmit={doReset} className="reset-form">
          <div className="form-group">
            <label>New Password</label>
            <div className="password-field">
              <input
                type={showResetNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={resetState.newPassword}
                onChange={(e) =>
                  setResetState({ ...resetState, newPassword: e.target.value })
                }
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowResetNewPassword((v) => !v)}
              >
                {showResetNewPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn primary">
              Confirm Reset
            </button>
            <button
              type="button"
              className="btn cancel"
              onClick={() => setResetState({ role: "", id: "", newPassword: "" })}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Edit User Details"
        show={!!editUser}
        onClose={() => setEditUser(null)}
      >
        {editUser && (
          <form
            className="edit-form"
            style={{ display: "grid", gap: 12 }}
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const { _role, _id, name, email, mobile, schoolName, roleInSchool, districtId, newPassword } = editUser;
                const updates = {};
                if (typeof name !== "undefined") updates.name = name;
                if (typeof email !== "undefined") updates.email = email;
                if (typeof mobile !== "undefined") updates.mobile = mobile;
                if (typeof newPassword !== "undefined" && newPassword) updates.newPassword = newPassword;
                if (_role === "school_user") {
                  if (typeof schoolName !== "undefined") updates.schoolName = schoolName;
                  if (typeof roleInSchool !== "undefined") updates.roleInSchool = roleInSchool;
                  if (typeof districtId !== "undefined") updates.districtId = districtId;
                }
                if (_role === "district_coordinator") {
                  if (typeof districtId !== "undefined") updates.districtId = districtId;
                }
                await adminApi.updateUser(_role, _id, updates);
                toast.success("User details updated successfully");
                setEditUser(null);
                await loadAll();
              } catch (err) {
                toast.error(err?.response?.data?.message || "Failed to update user");
              }
            }}
          >
            <div className="form-group" style={{ display: "grid", gap: 6 }}>
              <label>Name</label>
              <input
                placeholder="Full name"
                value={editUser.name || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  // ✅ Allow only letters, spaces, dots, apostrophes & hyphens
                  if (/^[A-Za-z\s.'-]*$/.test(value)) {
                    setEditUser({ ...editUser, name: value });
                  }
                }}
                required
              />

            </div>
            <div className="form-group" style={{ display: "grid", gap: 6 }}>
              <label>Email</label>
              <input
                type="email"
                placeholder="Email address"
                value={editUser.email || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  // ✅ Allow only characters valid in an email
                  if (/^[A-Za-z0-9@._-]*$/.test(value)) {
                    setEditUser({ ...editUser, email: value });
                  }
                }}
                required
              />

            </div>
            <div className="form-group" style={{ display: "grid", gap: 6 }}>
              <label>Mobile</label>
              <input
                type="text"
                placeholder="Mobile number"
                value={editUser.mobile || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  // ✅ Allow only digits (0–9)
                  if (/^\d*$/.test(value)) {
                    setEditUser({ ...editUser, mobile: value });
                  }
                }}
                maxLength={10} // restrict to 10 digits (optional)
                required
              />

            </div>
            <div className="form-group" style={{ display: "grid", gap: 6 }}>
              <label>New Password</label>
              <div className="password-field">
                <input
                  type={showEditNewPassword ? "text" : "password"}
                  placeholder="Leave blank to keep current password"
                  value={editUser.newPassword || ""}
                  onChange={(e) => setEditUser({ ...editUser, newPassword: e.target.value })}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowEditNewPassword((v) => !v)}
                >
                  {showEditNewPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            {editUser._role === "school_user" && (
              <>
                <DistrictAndSchoolSelectors
                  districtId={editUser.districtId || ""}
                  setDistrictId={(v) => setEditUser({ ...editUser, districtId: v })}
                  schoolName={editUser.schoolName || ""}
                  setSchoolName={(v) => setEditUser({ ...editUser, schoolName: v })}
                />
                <div className="form-group" style={{ display: "grid", gap: 6 }}>
                  <label>Role In School</label>
                  {schoolRoles.length > 0 ? (
                    <select
                      value={editUser.roleInSchool || ""}
                      onChange={(e) => setEditUser({ ...editUser, roleInSchool: e.target.value })}
                      className="input"
                      disabled={loadingRoles}
                    >
                      <option value="">{loadingRoles ? "Loading roles..." : "Select Role in School"}</option>
                      {schoolRoles.map((r) => (
                        <option key={r._id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
  placeholder="e.g., Teacher, Principal"
  value={editUser.roleInSchool || ""}
  onChange={(e) => {
    const value = e.target.value;
    // ✅ Allow only letters, spaces, dots, apostrophes & hyphens
    if (/^[A-Za-z\s.'-]*$/.test(value)) {
      setEditUser({ ...editUser, roleInSchool: value });
    }
  }}
  required
/>

                  )}
                </div>
              </>
            )}
            {editUser._role === "district_coordinator" && (
              <div className="form-group" style={{ display: "grid", gap: 6 }}>
                <label>District</label>
                <DistrictSelector
                  districtId={editUser.districtId || ""}
                  setDistrictId={(v) => setEditUser({ ...editUser, districtId: v })}
                />
              </div>
            )}
            <div className="form-actions">
              <button type="submit" className="btn primary">
                Save
              </button>
              <button
                type="button"
                className="btn cancel"
                onClick={() => setEditUser(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
}
