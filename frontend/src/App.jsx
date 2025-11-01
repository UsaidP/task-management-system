import { StrictMode } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AuthProvider } from "./components/AuthContext.jsx"
import { ConfirmEmail } from "./components/auth/ConfirmEmail.jsx"
import { Forget } from "./components/auth/Forget.jsx"
import { Login } from "./components/auth/Login.jsx"
import Me from "./components/auth/Me.jsx"
import { Reset } from "./components/auth/Reset.jsx"
import { Signup } from "./components/auth/Signup.jsx"
import Dashboard from "./components/Dashboard.jsx"
import { Home } from "./components/Home.jsx"
import AppLayout from "./components/layout/AppLayout.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import ProjectPage from "./components/project/ProjectPage.jsx"
import "./index.css"
import "./App.css"
import GuestRoute from "./components/GuestRoute.jsx"
import CalendarView from "./components/date/CalenderView.jsx"
// This import is for Emotion. If you are ONLY using your custom theme, you might not need it.
import { ThemeProvider } from "@emotion/react"
// This is your custom theme provider for dark/light mode
import { AppThemeProvider } from "./theme/ThemeContext.jsx"

import { SidebarProvider } from "./components/context/SidebarContext.jsx";

const App = () => {
  return (
    <StrictMode>
      <BrowserRouter>
        <AppThemeProvider>
          <SidebarProvider>
            <AuthProvider>
              <Routes>
                {/* Public Routes accessible to everyone */}
                <Route path="/" element={<Home />} />
                <Route path="/forget-password" element={<Forget />} />
                <Route path="/reset-password/:token" element={<Reset />} />
                <Route path="/confirm" element={<ConfirmEmail />} />

                {/* --- Routes for Guests Only --- */}
                <Route element={<GuestRoute />}>
                  <Route path="/register" element={<Signup />} />
                  <Route path="/login" element={<Login />} />
                </Route>

                {/* --- Protected Routes for Logged-in Users --- */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="calendar" element={<CalendarView />} />
                    <Route path="profile" element={<Me />} />
                    <Route path="project/:projectId" element={<ProjectPage />} />
                  </Route>
                </Route>
              </Routes>
            </AuthProvider>
          </SidebarProvider>
        </AppThemeProvider>
      </BrowserRouter>
    </StrictMode>
  )
}

export default App
