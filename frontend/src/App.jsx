import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
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

const App = () => {
	return (
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
	)
}

export default App
