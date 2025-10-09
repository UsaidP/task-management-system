import { AnimatePresence, motion } from "framer-motion"
import React, { useEffect, useState } from "react"
import {
	FiChevronDown,
	FiFolder,
	FiHome,
	FiLogOut,
	FiPlusSquare,
	FiSettings,
	FiUser,
} from "react-icons/fi"
import { NavLink, useNavigate } from "react-router-dom"
import apiService from "../../../service/apiService.js"
import { useAuth } from "../context/customHook.js"
import CreateProjectModal from "../project/CreateProjectModal"

const Sidebar = () => {
	const [projects, setProjects] = useState([])
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
	const { user, logout } = useAuth()
	const navigate = useNavigate()
	const userdata = JSON.stringify(user)

	console.log("USER", user.username)
	useEffect(() => {
		const fetchProjects = async () => {
			try {
				const response = await apiService.getAllProjects()
				if (response.success) {
					setProjects(response.data.projects)
				}
			} catch (err) {
				console.error("Failed to fetch projects for sidebar")
			}
		}
		fetchProjects()
	}, [])

	const handleProjectCreated = (newProject) => {
		setProjects((prevProjects) => [newProject, ...prevProjects])
	}

	const handleLogout = async () => {
		try {
			await logout()
			navigate("/")
		} catch (error) {
			console.error("Logout failed:", error)
		}
	}

	const NavLinkClasses = ({ isActive }) =>
		`flex items-center px-4 py-3 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-light transition-all duration-200 group ${
			isActive ? "bg-primary text-white shadow-glow" : ""
		}`

	return (
		<>
			<motion.div
				initial={{ x: -300 }}
				animate={{ x: 0 }}
				transition={{ duration: 0.3 }}
				className="w-80 h-screen glass flex flex-col border-r border-border"
			>
				{/* Header */}
				<div className="p-6 border-b border-border">
					<motion.h1
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
						className="text-3xl font-bold gradient-text"
					>
						TaskFlow
					</motion.h1>
					<p className="text-text-muted text-sm mt-1">Manage with style</p>
				</div>

				{/* Navigation */}
				<nav className="flex-1 p-6 space-y-2 overflow-y-auto">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<NavLink to="/dashboard" className={NavLinkClasses}>
							<FiHome className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
							Dashboard
						</NavLink>
					</motion.div>

					{/* Projects Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						className="pt-6"
					>
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-semibold text-text-primary">Projects</h2>
							<span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
								{projects.length}
							</span>
						</div>

						<div className="space-y-1 max-h-96 overflow-y-auto">
							<AnimatePresence>
								{projects.map((project, index) => (
									<motion.div
										key={project._id}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -20 }}
										transition={{ delay: index * 0.05 }}
									>
										<NavLink to={`/project/${project._id}`} className={NavLinkClasses}>
											<FiFolder className="mr-3 w-4 h-4 group-hover:scale-110 transition-transform" />
											<span className="truncate">{project.name}</span>
										</NavLink>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					</motion.div>
				</nav>

				{/* Create Project Button */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}
					className="p-6 border-t border-border"
				>
					<button
						onClick={() => setIsModalOpen(true)}
						className="group flex w-full items-center justify-center rounded-md btn-primary px-4 py-2 text-white transition-colors hover:btn-primary-hover"
					>
						<FiPlusSquare className="mr-2 transition-transform duration-200 group-hover:rotate-90" />
						Create Project
					</button>
				</motion.div>

				{/* User Menu */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6 }}
					className="p-6 border-t border-border relative"
				>
					<button
						onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
						className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-surface-light transition-colors duration-200"
					>
						<div className="flex items-center">
							<div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold mr-3">
								{user?.fullname?.charAt(0) || "U"}
							</div>
							<div className="text-left">
								<div className="text-sm font-medium text-text-primary truncate max-w-32">
									{user?.fullname || "User"}
								</div>
								<div className="text-xs text-text-muted truncate max-w-32">{user?.email}</div>
							</div>
						</div>
						<FiChevronDown
							className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
								isUserMenuOpen ? "rotate-180" : ""
							}`}
						/>
					</button>

					<AnimatePresence>
						{isUserMenuOpen && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.2 }}
								className="absolute bottom-full left-6 right-6 mb-2 glass rounded-lg shadow-xl border border-border overflow-hidden"
							>
								<NavLink
									to="/profile"
									className="flex items-center px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors duration-200"
									onClick={() => setIsUserMenuOpen(false)}
								>
									<FiUser className="mr-3 w-4 h-4" />
									Profile
								</NavLink>
								<button
									onClick={() => {
										setIsUserMenuOpen(false)
										// Add settings functionality later
									}}
									className="w-full flex items-center px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors duration-200"
								>
									<FiSettings className="mr-3 w-4 h-4" />
									Settings
								</button>
								<button
									onClick={() => {
										setIsUserMenuOpen(false)
										handleLogout()
									}}
									className="w-full flex items-center px-4 py-3 text-error hover:bg-error/10 transition-colors duration-200"
								>
									<FiLogOut className="mr-3 w-4 h-4" />
									Sign Out
								</button>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>
			</motion.div>

			<CreateProjectModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onProjectCreated={handleProjectCreated}
			/>
		</>
	)
}

export default Sidebar
