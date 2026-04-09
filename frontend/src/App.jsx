import { lazy, StrictMode, Suspense } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import AdminLayout from "./components/admin/AdminLayout.jsx"
import AdminRoute from "./components/admin/AdminRoute.jsx"
import { ConfirmEmail } from "./components/auth/ConfirmEmail.jsx"
import { Forget } from "./components/auth/Forget.jsx"
import { Login } from "./components/auth/Login.jsx"
import Me from "./components/auth/Me.jsx"
import { Reset } from "./components/auth/Reset.jsx"
import { Signup } from "./components/auth/Signup.jsx"
import { Verify } from "./components/auth/Verify.jsx"
import GuestRoute from "./components/GuestRoute.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import ProjectAdminRoute from "./components/project/ProjectAdminRoute.jsx"
import ProjectPage from "./components/project/ProjectPage.jsx"
import MyTasks from "./components/task/MyTasks.jsx"
import { AuthProvider } from "./contexts/AuthContext.jsx"
import { FilterProvider } from "./contexts/FilterContext.jsx"
import { SidebarProvider } from "./contexts/SidebarContext.jsx"
import AppLayout from "./layouts/AppLayout.jsx"
import AdminDashboard from "./pages/AdminDashboard.jsx"
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage.jsx"
import AdminProjectsPage from "./pages/admin/AdminProjectsPage.jsx"
import AdminTasksPage from "./pages/admin/AdminTasksPage.jsx"
import AdminTeamPage from "./pages/admin/AdminTeamPage.jsx"
import { Home } from "./pages/Home.jsx"
import Overview from "./pages/Overview.jsx"
import ProjectAdminPage from "./pages/ProjectAdminPage.jsx"
import Settings from "./pages/Settings.jsx"
import "./App.css"
import "./index.css"

// Lazy load heavy components
const CalendarView = lazy(() => import("./components/date/CalendarView.jsx"))
const TimelineView = lazy(() => import("./components/date/TimelineView.jsx"))
const SprintView = lazy(() => import("./components/sprint/SprintView.jsx"))
const TableView = lazy(() => import("./components/table/TableView.jsx"))

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary" />
  </div>
)

const App = () => {
  return (
    <StrictMode>
      <BrowserRouter>
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
                    <Route
                      path="timeline"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <TimelineView />
                        </Suspense>
                      }
                    />
                    <Route
                      path="table"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <TableView />
                        </Suspense>
                      }
                    />
                    <Route
                      path="calendar"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <CalendarView />
                        </Suspense>
                      }
                    />
                    <Route
                      path="sprint"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <SprintView />
                        </Suspense>
                      }
                    />

                    <Route path="profile" element={<Me />} />
                    <Route path="setting" element={<Settings />} />
                    <Route path="settings" element={<Navigate to="/setting" replace />} />
                    <Route
                      path="project/:projectId/admin"
                      element={
                        <ProjectAdminRoute>
                          <ProjectAdminPage />
                        </ProjectAdminRoute>
                      }
                    />
                    <Route path="project/:projectId" element={<ProjectPage />} />
                  </Route>
                </Route>

                {/* Admin-only routes */}
                <Route
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route path="admin" element={<AdminDashboard />} />
                  <Route path="admin/tasks" element={<AdminTasksPage />} />
                  <Route path="admin/projects" element={<AdminProjectsPage />} />
                  <Route path="admin/team" element={<AdminTeamPage />} />
                  <Route path="admin/analytics" element={<AdminAnalyticsPage />} />
                </Route>
              </Routes>
            </SidebarProvider>
          </FilterProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  )
}

export default App
