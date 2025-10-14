import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
	FiArrowRight,
	FiCalendar,
	FiCheckSquare,
	FiClipboard,
	FiClock,
	FiEye,
	FiPlus,
	FiUsers,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import apiService from "../../service/apiService.js";
import { useAuth } from "./context/customHook.js";
import CreateProjectModal from "./project/CreateProjectModal";
import ProjectCardSkeleton from "./project/ProjectCardSkeleton";

// --- Skeleton Component for the Header ---
// Mimics the header layout while the user object is loading.
const HeaderSkeleton = () => (
	<div className="flex animate-pulse items-center justify-between">
		<div>
			<div className="mb-3 h-10 w-64 rounded-lg bg-gray-200 dark:bg-gray-700" />
			<div className="h-6 w-80 rounded-lg bg-gray-200 dark:bg-gray-700" />
		</div>
		<div className="hidden h-6 w-48 rounded-lg bg-gray-200 dark:bg-gray-700 md:block" />
	</div>
);

// --- Reusable UI Card Components ---
const StatCard = ({ icon, label, value, color, delay = 0 }) => (
	<motion.div
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.6, delay }}
		className="bento-card-interactive group p-6"
	>
		<div className="mb-4 flex items-center justify-between ">
			<div
				className={`p-3 rounded-xl ${color} transition-transform duration-200 group-hover:scale-110`}
			>
				{icon}
			</div>
		</div>
		<div>
			<p className="text-bento-text-primary mb-1 text-3xl font-bold p-2">
				{value}
			</p>
			<p className="text-bento-text-secondary">{label}</p>
		</div>
	</motion.div>
);

const ProjectCard = ({ project, delay = 0 }) => (
	<motion.div
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.6, delay }}
	>
		<Link to={`/project/${project._id}`} className="block">
			<div className="bento-card-interactive group">
				<div className="mb-4 flex items-center justify-between">
					<h3 className="text-lg font-semibold text-bento-text-primary transition-colors group-hover:text-primary">
						{project.name}
					</h3>
					<FiArrowRight className="h-5 w-5 text-text-muted transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary" />
				</div>
				<p className="text-bento-text-secondary line-clamp-2 mb-4 text-sm">
					{project.description}
				</p>
				<div className="flex items-center justify-between text-xs text-text-muted">
					<span>
						Updated{" "}
						{new Date(project.updatedAt).toLocaleDateString("en-US", {
							year: "numeric",
							month: "short",
							day: "numeric",
						})}
					</span>
					<div className="flex items-center">
						<FiUsers className="mr-1 h-3 w-3" />
						{project.members ? `${project.members.length} Members` : "Team"}
					</div>
				</div>
			</div>
		</Link>
	</motion.div>
);

const QuickAction = ({ icon, label, onClick, color, delay = 0 }) => (
	<motion.button
		initial={{ opacity: 0, scale: 0.8 }}
		animate={{ opacity: 1, scale: 1 }}
		transition={{ duration: 0.4, delay }}
		onClick={onClick}
		className={`bento-card-interactive group text-left ${color}`}
	>
		<div className="flex items-center">
			<div className="mr-3 rounded-lg bg-white/10 p-2 transition-transform duration-200 group-hover:scale-110">
				{icon}
			</div>
			<span className="font-medium">{label}</span>
		</div>
	</motion.button>
);

// --- Main Dashboard Component ---
const Dashboard = () => {
	// `user` is provided by the AuthContext. It's guaranteed to be either the user object or null.
	// The AuthContext handles the initial loading state for the user.
	const { user } = useAuth();
	// console.log("2. [Dashboard] COMPONENT RENDERED - Received user:", user);
	// This `loading` state is for the dashboard's specific data (projects, stats).
	const [loading, setLoading] = useState(true);
	const [projects, setProjects] = useState([]);
	const [stats, setStats] = useState({
		totalTasks: 0,
		todo: 0,
		inProgress: 0,
		underReview: 0,
		completed: 0,
		totalProjects: 0,
	});
	const [isCreateProjectModalOpen, setCreateProjectModalOpen] = useState(false);

	const handleProjectCreated = (newProject) => {
		setProjects([newProject, ...projects]);
	};

	// This effect fetches dashboard-specific data.
	// It depends on `user`, so it will only run AFTER the user is authenticated and available.
	useEffect(() => {
		const fetchDashboardData = async () => {
			setLoading(true);
			try {
				// Using Promise.all to fetch data in parallel for better performance.
				const [projectsResponse, tasksResponse] = await Promise.all([
					apiService.getAllProjects(),
					apiService.getAllTaskOfUser(),
				]);

				if (projectsResponse.success && tasksResponse.success) {
					const projectsData = projectsResponse.data.projects;
					const tasksData = tasksResponse.data;

					setProjects(projectsData.slice(0, 6));
					setStats({
						totalTasks: tasksData.length,
						todo: tasksData.filter((t) => t.status === "todo").length,
						inProgress: tasksData.filter((t) => t.status === "in-progress")
							.length,
						underReview: tasksData.filter((t) => t.status === "under-review")
							.length,
						completed: tasksData.filter((t) => t.status === "completed").length,
						totalProjects: projectsData.length,
					});
				}
			} catch (error) {
				console.error("Failed to fetch dashboard data:", error);
			} finally {
				setLoading(false);
			}
		};

		// The guard clause ensures we only fetch data when we have a logged-in user.
		if (user) {
			fetchDashboardData();
		}
	}, [user]); // The dependency array ensures this effect re-runs if the user changes (e.g., re-login).

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 18) return "Good afternoon";
		return "Good evening";
	};

	return (
		<div className="space-y-8">
			{/* Header section: Renders based on the user object. */}
			{user ? (
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="flex items-center justify-between"
				>
					<div>
						<h1 className="text-bento-text-primary mb-2 text-4xl font-bold">
							{getGreeting()}{" "}
							<span className="gradient-text-new">
								{user.fullname || "User"}
							</span>
							!
						</h1>
						<p className="text-bento-text-secondary text-lg">
							Here's what's happening with your projects today.
						</p>
					</div>
					<div className="flex items-center space-x-2 text-text-muted">
						<FiCalendar className="h-5 w-5" />
						<span>
							{new Date().toLocaleDateString("en-US", {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</span>
					</div>
				</motion.div>
			) : (
				<HeaderSkeleton />
			)}

			{/* Stats Grid: Renders based on the dashboard's `loading` state. */}
			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5 p-6">
				<StatCard
					icon={<FiClipboard className="h-6 w-6  text-white" />}
					label="Total Tasks"
					value={loading ? "..." : stats.totalTasks}
					color="bg-gradient-to-r from-primary to-primary-light"
					delay={0.1}
				/>
				<StatCard
					icon={<FiClock className="h-6 w-6 text-white" />}
					label="In Progress"
					value={loading ? "..." : stats.inProgress}
					color="bg-gradient-to-r from-warning to-yellow-400"
					delay={0.2}
				/>
				<StatCard
					icon={<FiEye className="h-6 w-6 text-blue-200" />}
					label="Under Review"
					value={loading ? "..." : stats.underReview} // Assuming you have this value
					color="bg-gradient-to-r from-primary to-accent" // Blue gradient
					delay={0.3}
				/>
				<StatCard
					icon={<FiCheckSquare className="h-6 w-6 text-white" />}
					label="Completed"
					value={loading ? "..." : stats.completed}
					color="bg-gradient-to-r from-success to-accent-light"
					delay={0.4}
				/>
				<StatCard
					icon={<FiUsers className="h-6 w-6 text-white" />}
					label="Projects"
					value={loading ? "..." : stats.totalProjects}
					color="bg-gradient-to-r from-secondary to-secondary-light"
					delay={0.5}
				/>
			</div>

			{/* Quick Actions */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.5 }}
			>
				<h2 className="text-bento-text-primary mb-6 text-2xl font-bold">
					Quick Actions
				</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<QuickAction
						icon={<FiPlus className="h-5 w-5 text-white" />}
						label="Create New Project"
						onClick={() => setCreateProjectModalOpen(true)}
						color="bg-gradient-to-r from-primary to-primary-light text-white"
						delay={0.1}
					/>
				</div>
			</motion.div>

			<CreateProjectModal
				isOpen={isCreateProjectModalOpen}
				onClose={() => setCreateProjectModalOpen(false)}
				onProjectCreated={handleProjectCreated}
			/>

			{/* Recent Projects: Renders based on the dashboard's `loading` state. */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.6 }}
			>
				<div className="mb-6 flex items-center justify-between">
					<h2 className="text-bento-text-primary text-2xl font-bold">
						Recent Projects
					</h2>
					<Link
						to="/projects"
						className="flex items-center text-primary transition-colors duration-200 hover:text-primary-light"
					>
						View All
						<FiArrowRight className="ml-1 h-4 w-4" />
					</Link>
				</div>

				{loading ? (
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{[...Array(6)].map((_, i) => (
							<ProjectCardSkeleton key={i} />
						))}
					</div>
				) : projects.length > 0 ? (
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{projects.map((project, index) => (
							<ProjectCard
								key={project._id}
								project={project}
								delay={index * 0.1}
							/>
						))}
					</div>
				) : (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.8 }}
						className="card py-12 text-center"
					>
						<FiClipboard className="text-text-muted mx-auto mb-4 h-16 w-16" />
						<h3 className="text-bento-text-primary mb-2 text-xl font-semibold">
							No Projects Yet
						</h3>
						<p className="text-bento-text-secondary mb-6">
							Create your first project to get started.
						</p>
						<button
							onClick={() => setCreateProjectModalOpen(true)}
							className="btn-new-primary m-auto flex p-auto"
						>
							<FiPlus className="m-auto mr-2 flex p-auto" />
							Create Project
						</button>
					</motion.div>
				)}
			</motion.div>
		</div>
	);
};

export default Dashboard;
