import { StrictMode } from "react"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import { AuthProvider } from "./components/AuthContext.jsx"
import { ConfirmEmail } from "./components/auth/ConfirmEmail.jsx"
import { Forget } from "./components/auth/Forget.jsx"
import { Login } from "./components/auth/Login.jsx"
import Me from "./components/auth/Me.jsx"
import { Reset } from "./components/auth/Reset.jsx"
import { Signup } from "./components/auth/Signup.jsx"
import Overview from "./components/Overview.jsx" // Renamed from Dashboard
import MyTasks from "./components/task/MyTasks.jsx"
import Board from "./components/Board.jsx"
import TimelineView from "./components/date/TimelineView.jsx"
import TableView from "./components/table/TableView.jsx"
import PlaceholderView from "./components/PlaceholderView.jsx" // Mocks the other views
import { Home } from "./components/Home.jsx"
import AppLayout from "./components/layout/AppLayout.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import ProjectPage from "./components/project/ProjectPage.jsx"
import "./index.css"
import "./App.css"

import { SidebarProvider } from "./components/context/SidebarContext.jsx"
import CalendarView from "./components/date/CalenderView.jsx"
import GuestRoute from "./components/GuestRoute.jsx"
import { AppThemeProvider } from "./theme/ThemeContext.jsx"
import Settings from "./components/Settings.jsx"
import SprintView from "./components/sprint/SprintView.jsx"

const App = () => {
  return (
    <StrictMode>
      <BrowserRouter>
        <AppThemeProvider>
          <AuthProvider>
            <SidebarProvider>
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
                    {/* Redirect old dashboard to overview */}
                    <Route path="dashboard" element={<Navigate to="/overview" replace />} />
                    
                    <Route path="overview" element={<Overview />} />
                    <Route path="my-tasks" element={<MyTasks />} />
                    <Route path="board" element={<Board />} />
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
          </AuthProvider>
        </AppThemeProvider>
      </BrowserRouter>
    </StrictMode>
  )
}

export default App
