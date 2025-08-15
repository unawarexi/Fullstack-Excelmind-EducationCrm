import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth/*" element={<AuthLayoutRoute />} />
        
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

function AuthLayoutRoute() {
  return (
    <AuthLayout>
      {" "}
      <Routes>
        {" "}
        <Route path="login" element={<LoginWrapper/>} />
        <Route path="register" element={<RegisterWrapper />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />{" "}
      </Routes>{" "}
    </AuthLayout>
  );
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
