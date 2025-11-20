import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../api/authApi";
import districtApi from "../api/districtApi";
import { uiToApiRole } from "../utils/roles";
import { toast } from "react-toastify";
import "../styles/form.css";

export default function RegisterSchool() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    repeatPassword: "",
    districtId: "",
    schoolName: "",
    roleInSchool: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [districts, setDistricts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const navigate = useNavigate();

  // -----------------
  // Input Change Handler
  // -----------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error on change
  };

  // -----------------
  // Load Districts
  // -----------------
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

  // Load School Roles
  useEffect(() => {
    (async () => {
      try {
        setLoadingRoles(true);
        const r = await districtApi.getSchoolRoles();
        setRoles(r || []);
      } catch {
        setRoles([]);
      } finally {
        setLoadingRoles(false);
      }
    })();
  }, []);

  // -----------------
  // Load Schools based on District
  // -----------------
  useEffect(() => {
    const loadSchools = async () => {
      if (!formData.districtId) {
        setSchools([]);
        return;
      }
      try {
        setLoadingSchools(true);
        const s = await districtApi.getAllSchools({ districtId: formData.districtId });
        setSchools(s || []);
      } catch {
        setSchools([]);
      } finally {
        setLoadingSchools(false);
      }
    };
    loadSchools();
  }, [formData.districtId]);

  // -----------------
  // Validation Function
  // -----------------
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[6-9]\d{9}$/; // Indian mobile numbers
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{4,}$/;

    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Enter a valid email address.";

    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required.";
    else if (!mobileRegex.test(formData.mobile)) newErrors.mobile = "Enter a valid 10-digit mobile number.";

    if (!formData.districtId) newErrors.districtId = "Please select a district.";
    if (!formData.schoolName) newErrors.schoolName = "Please select a school.";
    if (!formData.roleInSchool.trim()) newErrors.roleInSchool = "Role in school is required.";

    if (!formData.password) newErrors.password = "Password is required.";
    else if (!passwordRegex.test(formData.password))
      newErrors.password = "Password must be 4+ chars with 1 uppercase, 1 lowercase, and 1 number.";

    if (!formData.repeatPassword) newErrors.repeatPassword = "Please confirm your password.";
    else if (formData.password !== formData.repeatPassword)
      newErrors.repeatPassword = "Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -----------------
  // Submit Handler
  // -----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) return;

    try {
      const apiRole = uiToApiRole("school_user");
      const res = await authApi.register(apiRole, formData);
      toast.success(res.message || "Registration successful!");
      navigate("/login");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong.");
    }
  };

  // -----------------
  // JSX
  // -----------------
  return (
    <div className="form-container">
      <div className="form-header">
        <h2>Register as School</h2>
        <button className="close-btn" onClick={() => navigate(-1)} aria-label="Close">
          ×
        </button>
      </div>

      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <input
          type="text"
          name="name"
          placeholder="Name of the Person"
          value={formData.name}
          onChange={handleChange}
          required
        />
        {errors.name && <p className="error">{errors.name}</p>}

        <input
          type="email"
          name="email"
          placeholder="Mail ID"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <input
          type="text"
          name="mobile"
          placeholder="Mobile Number"
          value={formData.mobile}
          onChange={(e) => {
            const value = e.target.value;
            // Allow only numbers and max 10 digits
            if (/^\d{0,10}$/.test(value)) {
              setFormData({ ...formData, mobile: value });
            }
          }}
          inputMode="numeric"
          pattern="\d{10}"
          maxLength="10"
          required
        />

        {errors.mobile && <p className="error">{errors.mobile}</p>}

        <select
          name="districtId"
          value={formData.districtId}
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
        {errors.districtId && <p className="error">{errors.districtId}</p>}

        <select
          name="schoolName"
          value={formData.schoolName}
          onChange={handleChange}
          className="input"
          disabled={!formData.districtId || loadingSchools}
          required
        >
          <option value="">
            {loadingSchools ? "Loading schools..." : "Select School"}
          </option>
          {schools.map((s) => (
            <option key={s._id} value={s.schoolName}>
              {s.schoolName}
            </option>
          ))}
        </select>
        {errors.schoolName && <p className="error">{errors.schoolName}</p>}

        {roles.length > 0 ? (
          <select
            name="roleInSchool"
            value={formData.roleInSchool}
            onChange={handleChange}
            className="input"
            disabled={loadingRoles}
            required
          >
            <option value="">{loadingRoles ? "Loading roles..." : "Select Role in School"}</option>
            {roles.map((r) => (
              <option key={r._id} value={r.name}>{r.name}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            name="roleInSchool"
            placeholder="Your Role in School (e.g., Principal)"
            value={formData.roleInSchool}
            onChange={handleChange}
            required
          />
        )}
        {errors.roleInSchool && <p className="error">{errors.roleInSchool}</p>}

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
        {errors.password && <p className="error">{errors.password}</p>}

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
        {errors.repeatPassword && <p className="error">{errors.repeatPassword}</p>}

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
