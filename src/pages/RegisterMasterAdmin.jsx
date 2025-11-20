import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../api/authApi";
import { toast } from "react-toastify";
import "../styles/form.css";

const RegisterMasterAdmin = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    repeatPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  // Validation Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[0-9]{10}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

  // Handle input changes (restrict mobile to 10 digits)
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile" && !/^\d{0,10}$/.test(value)) return;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Form validation function
  const validateForm = () => {
    const newErrors = [];

    if (!formData.name.trim()) newErrors.push("Name is required.");

    if (!formData.email) newErrors.push("Email is required.");
    else if (!emailRegex.test(formData.email))
      newErrors.push("Invalid email format.");

    if (!formData.mobile) newErrors.push("Mobile number is required.");
    else if (!mobileRegex.test(formData.mobile))
      newErrors.push("Mobile number must be exactly 10 digits.");

    if (!formData.password) newErrors.push("Password is required.");
    else if (!passwordRegex.test(formData.password))
      newErrors.push(
        "Password must be 6+ characters with 1 uppercase, 1 lowercase, and 1 number."
      );

    if (!formData.repeatPassword) newErrors.push("Please confirm your password.");
    else if (formData.password !== formData.repeatPassword)
      newErrors.push("Passwords do not match.");

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await authApi.register("admin", formData);
      toast.success("Admin registered successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setErrors([
        err.response?.data?.message || "Error registering admin. Please try again.",
      ]);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Master Admin Registration</h2>
        <button
          className="close-btn"
          onClick={() => navigate(-1)}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Error Display Box */}
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
          type="text"
          name="name"
          placeholder="Name of the Person"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Mail ID"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="mobile"
          placeholder="Mobile Number"
          value={formData.mobile}
          onChange={handleChange}
          inputMode="numeric"
          pattern="\d{10}"
          maxLength="10"
          required
        />

        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
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
            value={formData.repeatPassword}
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
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn secondary"
          >
            Back
          </button>
          <button type="submit" className="btn primary">
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterMasterAdmin;
