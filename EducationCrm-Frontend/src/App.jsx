import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AuthLayout from "./auth/AuthLayout";
import WalletMainLayout from "./layout/WalletMainLayout";
import "./App.css";

// check if the user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return token && token !== "undefined"; // Ensure token is valid
};

// PrivateRoute protect route
// const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   return isAuthenticated() ? <>{children}</> : <Navigate to="/auth" replace />;
// };

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/auth/*" element={<AuthLayout />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <WalletMainLayout />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
