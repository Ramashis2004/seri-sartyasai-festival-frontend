import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import DashboardLayout from "../components/DashboardLayout";
import districtApi from "../api/districtApi";
import "../styles/district.css";
import { FaHome, FaUsers, FaBuilding, FaSchool, FaCog, FaEdit, FaTrash, FaCalendarPlus, FaBullhorn, FaClipboardList } from "react-icons/fa";

const Modal = ({ title, children, show, onClose }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box animate-slide-up">
        <div className="modal-header">
          <h4>{title}</h4>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

const DistrictForm = ({ initialValue = "", onSave, onCancel, label }) => {
  const [name, setName] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ districtName: name.trim() });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>District Name</label>
            <input
          type="text"
          className="input"
          value={name}
          onChange={(e) => {
            const value = e.target.value;
            // ✅ Allow only letters, spaces, dots, apostrophes & hyphens
            if (/^[A-Za-z\s.'-]*$/.test(value)) {
              setName(value);
            }
          }}
          placeholder="Enter district name"
          required
        />
      </div>
      <div className="modal-footer">
        <button type="button" className="btn secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn primary">{label}</button>
      </div>
    </form>
  );
};

export default function AdminDistricts() {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

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

  const loadAll = async () => {
    try {
      setLoading(true);
      const data = await districtApi.getAllDistricts();
      setDistricts(data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load districts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const createDistrict = async (data) => {
    try {
      await districtApi.createDistrict(data);
      toast.success(`District '${data.districtName}' created successfully!`);
      setShowAddModal(false);
      await loadAll();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to create district");
    }
  };

  const updateDistrict = async (id, data) => {
    try {
      await districtApi.updateDistrict(id, data);
      toast.success(`District updated to '${data.districtName}'!`);
      setShowEditModal(false);
      setSelectedDistrict(null);
      await loadAll();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update district");
    }
  };

  const confirmDelete = async (district) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      html: `You are about to delete <b>${district.districtName}</b>.<br>This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await districtApi.deleteDistrict(district._id);
        toast.success(`District '${district.districtName}' deleted successfully!`);
        await loadAll();
      } catch (e) {
        toast.error(e?.response?.data?.message || "Failed to delete district");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"
      sidebarItems={sidebarItems}
      activeKey="districts"
      onSelectItem={(key) => window.location.assign(`/admin/${key}`)}
    >
      <section className="admin-section">
        <div className="header-bar">
          <h3>🏢 District Management</h3>
          <button className="btn primary" onClick={() => setShowAddModal(true)}>
            + Add District
          </button>
        </div>

        {loading && <p className="loading-text">Loading...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>District Name</th>
                  <th>Created On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {districts.length ? (
                  districts.map((d, i) => (
                    <tr key={d._id}>
                      <td>{i + 1}</td>
                      <td><b>{d.districtName}</b></td>
                      <td>{formatDate(d.createdAt)}</td>
                      <td>
                        <button
                          className="btn small primary"
                          onClick={() => {
                            setSelectedDistrict(d);
                            setShowEditModal(true);
                          }}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <FaEdit /> Edit
                          </span>
                        </button>
                        <button
                          className="btn small danger"
                          onClick={() => confirmDelete(d)}
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
                    <td colSpan="4" style={{ textAlign: "center" }}>
                      No districts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add Modal */}
      <Modal
        title="Add New District"
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
      >
        <DistrictForm
          label="Create"
          onSave={createDistrict}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit District"
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
      >
        {selectedDistrict && (
          <DistrictForm
            initialValue={selectedDistrict.districtName}
            label="Save Changes"
            onSave={(data) => updateDistrict(selectedDistrict._id, data)}
            onCancel={() => setShowEditModal(false)}
          />
        )}
      </Modal>
    </DashboardLayout>
  );
}
