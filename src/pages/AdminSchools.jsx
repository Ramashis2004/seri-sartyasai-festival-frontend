import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import DashboardLayout from "../components/DashboardLayout";
import districtApi from "../api/districtApi";
import "../styles/AdminSchools.css";
import { FaHome, FaUsers, FaBuilding, FaSchool, FaCog, FaEdit, FaTrash, FaCalendarPlus, FaBullhorn, FaClipboardList } from "react-icons/fa";
// Add this regex at the top of the file (after imports)
const nameRegex = /^[A-Za-z\s]+$/;

export default function AdminSchools() {
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

  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ districtId: "", schoolName: "", id: "" });
  const [search, setSearch] = useState("");

  const districtNameById = useMemo(() => {
    const map = {};
    (districts || []).forEach((d) => (map[d._id] = d.districtName));
    return map;
  }, [districts]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [d, s] = await Promise.all([
        districtApi.getAllDistricts(),
        districtApi.getAllSchools(),
      ]);
      setDistricts(d || []);
      setSchools(s || []);
    } catch (e) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleOpenModal = (edit = false, school = null) => {
    setIsEdit(edit);
    if (edit && school) {
      setFormData({
        id: school._id,
        districtId: school.districtId,
        schoolName: school.schoolName,
      });
    } else {
      setFormData({ districtId: "", schoolName: "", id: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.districtId || !formData.schoolName.trim()) {
      toast.warning("Please fill all fields");
      return;
    }
  //   if (!nameRegex.test(formData.schoolName.trim())) {
  //   toast.error("School name should only contain letters (no numbers allowed)");
  //   return;
  // }


    try {
      if (isEdit) {
        await districtApi.updateSchool(formData.id, {
          districtId: formData.districtId,
          schoolName: formData.schoolName,
        });
        toast.success("School updated successfully");
      } else {
        await districtApi.createSchool({
          districtId: formData.districtId,
          schoolName: formData.schoolName,
        });
        toast.success("School added successfully");
      }
      handleCloseModal();
      await loadAll();
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async (schoolId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This school will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await districtApi.deleteSchool(schoolId);
          toast.success("Deleted successfully");
          await loadAll();
        } catch (err) {
          toast.error("Delete failed");
        }
      }
    });
  };

  const filteredSchools = (schools || []).filter((s) =>
    (s.schoolName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Admin Dashboard"
      sidebarItems={sidebarItems}
      activeKey="schools"
      onSelectItem={(key) => window.location.assign(`/admin/${key}`)}
    >
      <div className="admin-schools-container">
        <div className="header-row">
          <h2>Schools Management</h2>
          <button className="btn primary" onClick={() => handleOpenModal(false)}>
            + Add School
          </button>
        </div>

        <div className="search-bar">
       <input
  type="text"
  placeholder="Enter school name"
  value={formData.schoolName}
  onKeyDown={(e) => {
    // Block numbers and disallowed special characters
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      
      
      
    ];

    // Allow letters A-Z or allowed keys
    if (
      !/^[a-zA-Z]$/.test(e.key) && // not a letter
      !allowedKeys.includes(e.key)
    ) {
      e.preventDefault();
    }
  }}
  onChange={(e) => {
    // Clean pasted input → allow only letters, space, comma, hyphen
    const value = e.target.value.replace(/[^a-zA-Z,\-\s]/g, "");
    setFormData({ ...formData, schoolName: value });
  }}
  required
/>




        </div>

        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : (
          <div className="table-wrapper">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Sl No</th>
                  <th>School Name</th>
                  <th>District</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchools.length > 0 ? (
                  filteredSchools.map((s, index) => (
                    <tr key={s._id}>
                      <td>{index + 1}</td>
                      <td>{s.schoolName}</td>
                      <td>{districtNameById[s.districtId] || "-"}</td>
                      <td>
                        <button
                          className="btn small primary"
                          onClick={() => handleOpenModal(true, s)}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <FaEdit /> Edit
                          </span>
                        </button>
                        <button
                          className="btn small danger"
                          onClick={() => handleDelete(s._id)}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <FaTrash /> Delete
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-results">
                      No schools found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div
              className="modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>{isEdit ? "Edit School" : "Add School"}</h3>
              <form onSubmit={handleSave}>
                <label>District</label>
                <select
                  value={formData.districtId}
                  onChange={(e) =>
                    setFormData({ ...formData, districtId: e.target.value })
                  }
                  required
                >
                  <option value="">Select District</option>
                  {districts.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.districtName}
                    </option>
                  ))}
                </select>

                <label>School Name</label>
                <input
                  type="text"
                  placeholder="Enter school name"
                  value={formData.schoolName}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolName: e.target.value })
                  }
                  required
                />

                <div className="modal-actions">
                  <button type="button" className="btn" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn primary">
                    {isEdit ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
