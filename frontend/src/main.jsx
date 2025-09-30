import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Signup } from "./components/auth/Signup.jsx";
import { Login } from "./components/auth/Login.jsx";
import { Forget } from "./components/auth/Forget.jsx";
import { Reset } from "./components/auth/Reset.jsx";
import { ConfirmEmail } from "./components/auth/ConfirmEmail.jsx";
import Me from "./components/auth/Me.jsx";
import { AuthProvider } from "./components/auth/AuthContext.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import { Home } from "./components/Home.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ProjectPage from "./components/project/ProjectPage.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forget-password" element={<Forget />} />
          <Route path="/reset-password/:token" element={<Reset />} />
          <Route path="/confirm" element={<ConfirmEmail />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Me />} />
              <Route path="project/:projectId" element={<ProjectPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
