import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import RegisterSchool from "./pages/RegisterSchool";
import RegisterITAdmin from "./pages/RegisterITAdmin";
import RegisterEventCoordinator from "./pages/RegisterEventCoordinator";
import RegisterDistrictCoordinator from "./pages/RegisterDistrictCoordinator";
import RegisterMasterAdmin from "./pages/RegisterMasterAdmin";
import AdminOverview from "./pages/AdminOverview";
import AdminDistricts from "./pages/AdminDistricts";
import AdminSchools from "./pages/AdminSchools";
import AdminUsers from "./pages/AdminUsers";
import AdminSettings from "./pages/AdminSettings";
import AdminEvents from "./pages/AdminEvents";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AdminEvaluation from "./pages/AdminEvaluation";
import ITAdminParticipants from "./pages/ITAdminParticipants";
import ITAdminOverview from "./pages/ITAdminOverview";
import ITAdminTeachers from "./pages/ITAdminTeachers";
import ITAdminParticipantsReport from "./pages/ITAdminParticipantsReport";
import ITAdminTeachersReport from "./pages/ITAdminTeachersReport";
import ITAdminTeachersSchoolReport from "./pages/ITAdminTeachersSchoolReport";
import ITAdminDetailedList from "./pages/ITAdminDetailedList";
import DistrictDashboard from "./pages/DistrictDashboard";
import SchoolDashboard from "./pages/SchoolDashboard";
import EventCoordinatorMarks from "./pages/EventCoordinatorMarks";
import EventCoordinatorJudgeSheet from "./pages/EventCoordinatorJudgeSheet";
import "./styles/global.css";
import ContactUs from "./pages/ContactUs";
import Guidelines from "./pages/Guidelines";
import Gallery from "./pages/Gallery";
import Announcements from "./pages/Announcements";
import Events from "./pages/Events";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import SetNewPassword from "./pages/SetNewPassword";
import Register from "./pages/Register";
import GenericDashboard from "./pages/GenericDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/set-new-password" element={<SetNewPassword />} />
        <Route path="/register/school" element={<RegisterSchool />} />
        <Route path="/events" element={<Events />} />
        <Route path="/register/it-admin" element={<RegisterITAdmin />} />
        <Route path="/register/event-coordinator" element={<RegisterEventCoordinator />} />
        <Route path="/register/district-coordinator" element={<RegisterDistrictCoordinator />} />
        <Route path="/register/master-admin" element={<RegisterMasterAdmin />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/guidelines" element={<Guidelines />} />
        <Route
          path="/district/dashboard"
          element={
            <ProtectedRoute allowRoles={["district_coordinator"]}>
              <DistrictDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/dashboard"
          element={
            <ProtectedRoute allowRoles={["school_user"]}>
              <SchoolDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/event-coordinator/marks"
          element={
            <ProtectedRoute allowRoles={["event_coordinator"]}>
              <EventCoordinatorMarks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/event-coordinator/judge-sheet"
          element={
            <ProtectedRoute allowRoles={["event_coordinator"]}>
              <EventCoordinatorJudgeSheet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <GenericDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/dashboard" element={<ProtectedRoute allowRoles={["admin"]}><AdminOverview /></ProtectedRoute>} />
        <Route path="/admin/overview" element={<ProtectedRoute allowRoles={["admin"]}><AdminOverview /></ProtectedRoute>} />
        <Route path="/admin/districts" element={<ProtectedRoute allowRoles={["admin"]}><AdminDistricts /></ProtectedRoute>} />
        <Route path="/admin/schools" element={<ProtectedRoute allowRoles={["admin"]}><AdminSchools /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowRoles={["admin"]}><AdminSettings /></ProtectedRoute>} />
        <Route path="/admin/events" element={<ProtectedRoute allowRoles={["admin"]}><AdminEvents /></ProtectedRoute>} />
        <Route path="/admin/announcements" element={<ProtectedRoute allowRoles={["admin"]}><AdminAnnouncements /></ProtectedRoute>} />
        <Route path="/admin/evaluation" element={<ProtectedRoute allowRoles={["admin"]}><AdminEvaluation /></ProtectedRoute>} />
        <Route
          path="/it-admin/participants"
          element={
            <ProtectedRoute allowRoles={["it_admin"]}>
              <ITAdminParticipants />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it-admin/teachers"
          element={
            <ProtectedRoute allowRoles={["it_admin"]}>
              <ITAdminTeachers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it-admin/overview"
          element={
            <ProtectedRoute allowRoles={["it_admin"]}>
              <ITAdminOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it-admin/reports/participants"
          element={
            <ProtectedRoute allowRoles={["it_admin"]}>
              <ITAdminParticipantsReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it-admin/reports/teachers"
          element={
            <ProtectedRoute allowRoles={["it_admin"]}>
              <ITAdminTeachersReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it-admin/reports/teachers-by-school"
          element={
            <ProtectedRoute allowRoles={["it_admin"]}>
              <ITAdminTeachersSchoolReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/it-admin/detailed-list"
          element={
            <ProtectedRoute allowRoles={["it_admin"]}>
              <ITAdminDetailedList />
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnHover theme="colored" />
    </Router>
  );
}

export default App;
