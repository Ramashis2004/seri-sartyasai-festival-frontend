import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authApi from "../api/authApi";
import { uiToApiRole } from "../utils/roles";
import "../styles/global.css";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !role) return;
    try {
      const apiRole = uiToApiRole(role);
      await authApi.forgotPassword(apiRole, email);
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send reset link");
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
          <h2>Reset Password</h2>
          {/* ✅ Cross button inside the card header */}
          <button className="close-btn" onClick={() => navigate("/")}>
            &times;
          </button>
        </div>

        {!sent ? (
          <>
            <p>Enter your registered email to receive reset instructions.</p>
            <form className="auth-form" onSubmit={onSubmit}>
              <select
                className="select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="">Select Role</option>
                <option value="school">School</option>
                <option value="it-admin">IT Admin</option>
                <option value="event-coordinator">Event Coordinator</option>
                <option value="district-coordinator">
                  District Education Coordinator
                </option>
                <option value="admin">Admin</option>
              </select>

              <input
                type="email"
                className="input"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {error && <div className="error-text">{error}</div>}

              <button type="submit" className="btn primary full">
                Send Reset Link
              </button>
            </form>
          </>
        ) : (
          <>
            <p>We have sent a password reset link to:</p>
            <p>
              <strong>{email}</strong>
            </p>
            <div className="auth-links">
              <Link to="/login" className="link">
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
