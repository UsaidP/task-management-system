import { lazy, StrictMode, Suspense, useEffect } from "react"
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
import { AuthProvider } from "./contexts/AuthContext.jsx"
import { FilterProvider } from "./contexts/FilterContext.jsx"
import { SidebarProvider } from "./contexts/SidebarContext.jsx"
import AppLayout from "./layouts/AppLayout.jsx"
import { deferInitialization } from "./utils/deferredInit.js"

// Lazy load admin pages (they import recharts which is heavy)
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"))
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage.jsx"))
const AdminProjectsPage = lazy(() => import("./pages/admin/AdminProjectsPage.jsx"))
const AdminTasksPage = lazy(() => import("./pages/admin/AdminTasksPage.jsx"))
const AdminTeamPage = lazy(() => import("./pages/admin/AdminTeamPage.jsx"))

// Lazy load other page-level routes
const Home = lazy(() => import("./pages/Home.jsx"))
const Overview = lazy(() => import("./pages/Overview.jsx"))
const ProjectPage = lazy(() => import("./components/project/ProjectPage.jsx"))
const ProjectAdminPage = lazy(() => import("./pages/ProjectAdminPage.jsx"))
const Settings = lazy(() => import("./pages/Settings.jsx"))
const MyTasks = lazy(() => import("./components/task/MyTasks.jsx"))

// Lazy load heavy components
const CalendarView = lazy(() => import("./components/date/CalendarView.jsx"))
const TimelineView = lazy(() => import("./components/date/TimelineView.jsx"))
const SprintView = lazy(() => import("./components/sprint/SprintView.jsx"))
const TableView = lazy(() => import("./components/table/TableView.jsx"))

// Import styles (eagerly loaded)
import "./App.css"
import "./index.css"

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary" />
  </div>
)

const App = () => {
  useEffect(() => {
    // Run deferred init after component mounts
    // This ensures analytics and non-critical init don't block initial render
    deferInitialization()
  }, [])

  return (
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <FilterProvider>
            <SidebarProvider>
              <Routes>
                {/* Public Routes accessible to everyone */}
                <Route
                  path="/"
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Home />
                    </Suspense>
                  }
                />
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

                    <Route
                      path="overview"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <Overview />
                        </Suspense>
                      }
                    />
                    <Route
                      path="my-tasks"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <MyTasks />
                        </Suspense>
                      }
                    />
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
                    <Route
                      path="setting"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <Settings />
                        </Suspense>
                      }
                    />
                    <Route path="settings" element={<Navigate to="/setting" replace />} />
                    <Route
                      path="project/:projectId/admin"
                      element={
                        <ProjectAdminRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <ProjectAdminPage />
                          </Suspense>
                        </ProjectAdminRoute>
                      }
                    />
                    <Route
                      path="project/:projectId"
                      element={
                        <Suspense fallback={<LoadingFallback />}>
                          <ProjectPage />
                        </Suspense>
                      }
                    />
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
                  <Route
                    path="admin"
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <AdminDashboard />
                      </Suspense>
                    }
                  />
                  <Route
                    path="admin/tasks"
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <AdminTasksPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="admin/projects"
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <AdminProjectsPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="admin/team"
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <AdminTeamPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="admin/analytics"
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <AdminAnalyticsPage />
                      </Suspense>
                    }
                  />
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
