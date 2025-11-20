import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/global.css";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");

  const roles = [
    { value: "school", label: "Register as School", path: "/register/school" },
    { value: "it-admin", label: "Register as IT Admin", path: "/register/it-admin" },
    { value: "event-coordinator", label: "Register as Event Coordinator", path: "/register/event-coordinator" },
    { value: "district-coordinator", label: "Register as District Coordinator", path: "/register/district-coordinator" },
    { value: "master-admin", label: "Register as Master Admin", path: "/register/master-admin" },
  ];

  const selected = roles.find(r => r.value === role);

  function onContinue(e) {
    e.preventDefault();
    if (selected) navigate(selected.path);
  }

  return (
    <div
      className="auth-container"
      style={{
        backgroundImage: "url('/images/15.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="auth-card">
        <div className="form-header">
          <h2>Ready To Register</h2>
          <button
            className="close-btn"
            onClick={() => navigate(-1)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p>Select your role</p>

        <div className="dropdown">
          <select
            className="select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">Select Role</option>
            {roles.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <form className="auth-form" onSubmit={onContinue}>
          <button type="submit" className="btn primary full" disabled={!selected}>
            {selected ? `Continue to ${selected.label}` : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
