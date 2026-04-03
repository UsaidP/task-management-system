import { StrictMode } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { ConfirmEmail } from "./components/auth/ConfirmEmail.jsx"
import { Forget } from "./components/auth/Forget.jsx"
import { Login } from "./components/auth/Login.jsx"
import Me from "./components/auth/Me.jsx"
import { Reset } from "./components/auth/Reset.jsx"
import { Signup } from "./components/auth/Signup.jsx"
import { Verify } from "./components/auth/Verify.jsx"
import CalendarView from "./components/date/CalendarView.jsx"
import TimelineView from "./components/date/TimelineView.jsx"
import GuestRoute from "./components/GuestRoute.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import ProjectPage from "./components/project/ProjectPage.jsx"
import SprintView from "./components/sprint/SprintView.jsx"
import TableView from "./components/table/TableView.jsx"
import MyTasks from "./components/task/MyTasks.jsx"
import { AuthProvider } from "./contexts/AuthContext.jsx"
import { FilterProvider } from "./contexts/FilterContext.jsx"
import { SidebarProvider } from "./contexts/SidebarContext.jsx"
import AppLayout from "./layouts/AppLayout.jsx"
import { Home } from "./pages/Home.jsx"
import Overview from "./pages/Overview.jsx"
import Settings from "./pages/Settings.jsx"
import { AppThemeProvider } from "./theme/ThemeContext.jsx"
import "./App.css"
import "./index.css"

const App = () => {
  return (
    <StrictMode>
      <BrowserRouter>
        <AppThemeProvider>
          <AuthProvider>
            <FilterProvider>
              <SidebarProvider>
                <Routes>
                  {/* Public Routes accessible to everyone */}
                  <Route path="/" element={<Home />} />
                  <Route path="/forget-password" element={<Forget />} />
                  <Route path="/reset-password/:token" element={<Reset />} />
                  <Route path="/confirm" element={<ConfirmEmail />} />
                  <Route path="/verify/:token" element={<Verify />} />

                  {/* --- Routes for Guests Only --- */}
                  <Route element={<GuestRoute />}>
                    <Route path="/register" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                  </Route>

                  {/* --- Protected Routes for Logged-in Users --- */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                      {/* Redirect old dashboard to overview */}
                      <Route path="dashboard" element={<Navigate to="/overview" replace />} />

                      <Route path="overview" element={<Overview />} />
                      <Route path="my-tasks" element={<MyTasks />} />
                      <Route path="timeline" element={<TimelineView />} />
                      <Route path="table" element={<TableView />} />
                      <Route path="calendar" element={<CalendarView />} />
                      <Route path="sprint" element={<SprintView />} />

                      <Route path="profile" element={<Me />} />
                      <Route path="setting" element={<Settings />} />
                      <Route path="settings" element={<Navigate to="/setting" replace />} />
                      <Route path="project/:projectId" element={<ProjectPage />} />
                    </Route>
                  </Route>
                </Routes>
              </SidebarProvider>
            </FilterProvider>
          </AuthProvider>
        </AppThemeProvider>
      </BrowserRouter>
    </StrictMode>
  )
}

export default App
