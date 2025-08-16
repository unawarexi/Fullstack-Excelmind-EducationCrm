import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import StudentLayout from "./layouts/StudentLayout";
import LecturerLayout from "./layouts/LecturerLayout";
import AdminLayout from "./layouts/AdminLayout";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth/*" element={<AuthLayoutRoute />} />

          {/* Protected Home Route with Dynamic Layout */}
          <Route path="/" element={<DynamicLayoutRoute />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

function AuthLayoutRoute() {
  return (
    <AuthLayout>
      <Routes>
        <Route path="login" element={<LoginWrapper />} />
        <Route path="register" element={<RegisterWrapper />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </AuthLayout>
  );
}

// This chooses the layout based on role
function DynamicLayoutRoute() {
  // Example: role from localStorage (replace with Redux/context if needed)
  // const role = localStorage.getItem("role"); // "student", "lecturer", "admin"
  const role = ["student", "lecturer", "admin"]

  if (role === "student") return <StudentLayout />;
  if (role === "lecturer") return <LecturerLayout />;
  if (role === "admin") return <AdminLayout />;

  // If no role (not logged in), send to login
  return <Navigate to="/auth/login" replace />;
}

// Wrap Login to handle switching to Register
function LoginWrapper() {
  const navigate = useNavigate();
  return <Login onSwitchToRegister={() => navigate("/auth/register")} />;
}

// Wrap Register to handle switching to Login
function RegisterWrapper() {
  const navigate = useNavigate();
  return <Register onSwitchToLogin={() => navigate("/auth/login")} />;
}

export default App;
