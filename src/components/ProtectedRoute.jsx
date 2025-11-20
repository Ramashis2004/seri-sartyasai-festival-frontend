import React from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../utils/auth";

const decodeRole = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.role;
  } catch {
    return null;
  }
};

export default function ProtectedRoute({ children, allowRoles }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  if (allowRoles && allowRoles.length) {
    const role = decodeRole(token);
    if (!allowRoles.includes(role)) return <Navigate to="/dashboard" replace />;
  }
  return children;
}
