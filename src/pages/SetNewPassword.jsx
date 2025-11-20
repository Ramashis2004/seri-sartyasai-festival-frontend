import React, { useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import authApi from "../api/authApi";
import "../styles/global.css";

export default function SetNewPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = params.get("token") || "";
  const role = params.get("role") || "";

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!token || !role) {
      setError("Invalid or missing reset link.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await authApi.resetPasswordWithToken(role, { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="form-header">
          <h2>Set New Password</h2>
          {/* Close (×) icon inside the card */}
          <button
            className="close-btn"
            onClick={() => navigate("/")}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {!success ? (
          <form className="auth-form" onSubmit={onSubmit}>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                className="input"
                placeholder="New Password"
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
            <div className="password-field">
              <input
                type={showConfirm ? "text" : "password"}
                className="input"
                placeholder="Confirm New Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
            {error && <div className="error-text">{error}</div>}
            <button type="submit" className="btn primary full" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
            <div className="auth-links">
              <Link to="/login" className="link">
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <>
            <p>Your password has been updated successfully.</p>
            <div className="auth-links">
              <Link to="/login" className="link">
                Go to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
