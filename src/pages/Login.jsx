import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/global.css";
import authApi from "../api/authApi";
import { uiToApiRole } from "../utils/roles";
import { setAuth } from "../utils/auth";

export default function Login() {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roles = [
    { value: "school", label: "Login as School" },
    { value: "it-admin", label: "Login as IT Admin" },
    { value: "event-coordinator", label: "Login as Event Coordinator" },
    { value: "district-coordinator", label: "Login as District Education Coordinator" },
    { value: "admin", label: "Login as Admin" }
  ];

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!role || !email || !password) return;
    const apiRole = uiToApiRole(role);
    try {
      setLoading(true);
      const data = await authApi.login(apiRole, { email, password });
      setAuth({ token: data.token, user: data.user });
      if (apiRole === "admin") navigate("/admin/dashboard");
      else if (apiRole === "district_coordinator") navigate("/district/dashboard");
      else if (apiRole === "school_user") navigate("/school/dashboard");
      else if (apiRole === "event_coordinator") navigate("/event-coordinator/marks");
      else if (apiRole === "it_admin") navigate("/it-admin/participants");
      else navigate("/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="auth-container login-page"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/images/15.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      
      <div className="auth-card">
        <div className="form-header">
  <h2> Ready To Login</h2>
  <button
    className="close-btn"
    onClick={() => navigate(-1)}
    aria-label="Close"
  >
    ×
  </button>
</div>

        {/* <h2>Welcome Back</h2> */}
        <p>Select your role to continue</p>

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

        {role && (
          <form className="auth-form" onSubmit={onSubmit}>
            <input
              type="email"
              // className="input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                className="input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {error && <div className="error-text">{error}</div>}
            <button type="submit" className="btn primary full" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
            <div className="auth-links">
              <Link to="/reset-password" className="link">Forgot Password?</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
