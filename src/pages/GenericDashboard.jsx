import React, { useState } from "react";
import { getUser } from "../utils/auth";
import DashboardLayout from "../components/DashboardLayout";

export default function GenericDashboard() {
  const user = getUser();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <DashboardLayout title="Dashboard" onSelectItem={setActiveTab}>
      <p>Thanks for logging in{user?.name ? `, ${user.name}` : ""}.</p>
      <p>Your account is active and you can proceed with your tasks.</p>
    </DashboardLayout>
  );
}
