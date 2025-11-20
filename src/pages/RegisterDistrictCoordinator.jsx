import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../api/authApi";
import districtApi from "../api/districtApi";
import { uiToApiRole } from "../utils/roles";
import { toast } from "react-toastify";
import "../styles/form.css";

function RegisterDistrictCoordinator() {
  const [form, setForm] = useState({
    name: "",
    districtId: "",
    email: "",
    mobile: "",
    password: "",
    repeatPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [districts, setDistricts] = useState([]);
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  // ✅ Validation Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[0-9]{10}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

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

  // ✅ Validation function
  const validateForm = () => {
    const newErrors = [];

    if (!form.name.trim()) newErrors.push("Name is required.");

    if (!form.districtId) newErrors.push("Please select a district.");

    if (!form.email) newErrors.push("Email is required.");
    else if (!emailRegex.test(form.email))
      newErrors.push("Invalid email format.");

    if (!form.mobile) newErrors.push("Mobile number is required.");
    else if (!mobileRegex.test(form.mobile))
      newErrors.push("Mobile number must be exactly 10 digits.");

    if (!form.password) newErrors.push("Password is required.");
    else if (!passwordRegex.test(form.password))
      newErrors.push(
        "Password must be 8+ characters with 1 uppercase, 1 lowercase, and 1 number."
      );

    if (!form.repeatPassword) newErrors.push("Please confirm your password.");
    else if (form.password !== form.repeatPassword)
      newErrors.push("Passwords do not match.");

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // ✅ Handle input change + restrict mobile field
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile" && !/^\d{0,10}$/.test(value)) return;
    setForm({ ...form, [name]: value });
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const apiRole = uiToApiRole("district-coordinator");
      const res = await authApi.register(apiRole, form);
      toast.success(res.message || "Registered successfully!");
      navigate("/login");
    } catch (err) {
      setErrors([
        err.response?.data?.message || "Registration failed. Please try again.",
      ]);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Register as District Education Coordinator</h2>
        <button
          className="close-btn"
          onClick={() => navigate(-1)}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* 🔴 Show all error messages */}
      {errors.length > 0 && (
        <div className="alert-box">
          <ul>
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <input
          name="name"
          type="text"
          placeholder="Name of the Person"
          onChange={handleChange}
          value={form.name}
          required
        />

        <select
          name="districtId"
          value={form.districtId}
          onChange={handleChange}
          className="input"
          required
        >
          <option value="">Select District</option>
          {districts.map((d) => (
            <option key={d._id} value={d._id}>
              {d.districtName}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="mobile"
          placeholder="Mobile Number"
          value={form.mobile}
          onChange={handleChange}
          inputMode="numeric"
          pattern="\d{10}"
          maxLength="10"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Mail ID"
          value={form.email}
          onChange={handleChange}
          required
        />

        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
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
            type={showRepeatPassword ? "text" : "password"}
            name="repeatPassword"
            placeholder="Repeat Password"
            value={form.repeatPassword}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowRepeatPassword((v) => !v)}
          >
            {showRepeatPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button type="button" onClick={() => navigate(-1)} className="btn secondary">
            Back
          </button>
          <button type="submit" className="btn primary">
            Register
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegisterDistrictCoordinator;
