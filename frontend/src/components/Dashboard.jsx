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
import { ServerError, NetworkError, EmptyState } from "./ErrorStates.jsx";

const HeaderSkeleton = () => (
  <div className="flex animate-pulse items-center justify-between">
    <div>
      <div className="mb-3 h-10 w-64 rounded-lg bg-light-bg-hover dark:bg-dark-bg-hover" />
      <div className="h-6 w-80 rounded-lg bg-light-bg-hover dark:bg-dark-bg-hover" />
    </div>
    <div className="hidden h-6 w-48 rounded-lg bg-light-bg-hover dark:bg-dark-bg-hover md:block" />
  </div>
);

const StatCard = ({ icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="card group p-6"
  >
    <div className="mb-4 flex items-center justify-between">
      <div
        className={`p-3 rounded-xl ${color} transition-transform duration-200 group-hover:scale-110`}
      >
        {icon}
      </div>
    </div>
    <div>
      <p className="text-light-text-primary dark:text-dark-text-primary mb-1 text-3xl font-bold p-2">{value}</p>
      <p className="text-light-text-secondary dark:text-dark-text-secondary">{label}</p>
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
      <div className="card-interactive group p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary transition-colors group-hover:text-accent-primary">
            {project.name}
          </h3>
          <FiArrowRight className="h-5 w-5 text-light-text-tertiary dark:text-dark-text-tertiary transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent-primary" />
        </div>
        <p className="text-light-text-secondary dark:text-dark-text-secondary line-clamp-2 mb-4 text-sm">{project.description}</p>
        <div className="flex items-center justify-between text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
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
    className={`card-interactive group text-left ${color}`}
  >
    <div className="flex items-center">
      <div className="mr-3 rounded-lg bg-white/10 p-2 transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </div>
  </motion.button>
);

const Dashboard = () => {
  const { user } = useAuth();
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
  const [error, setError] = useState(null);
  const [isCreateProjectModalOpen, setCreateProjectModalOpen] = useState(false);

  const handleProjectCreated = (newProject) => {
    setProjects([newProject, ...projects]);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
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
          inProgress: tasksData.filter((t) => t.status === "in-progress").length,
          underReview: tasksData.filter((t) => t.status === "under-review").length,
          completed: tasksData.filter((t) => t.status === "completed").length,
          totalProjects: projectsData.length,
        });
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (error) {
    if (error.name === 'NetworkError') {
      return <NetworkError onRetry={fetchDashboardData} />;
    }
    return <ServerError onRetry={fetchDashboardData} />;
  }

  return (
    <div className="space-y-8">
      {user ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-light-text-primary dark:text-dark-text-primary mb-2 text-4xl font-bold">
              {getGreeting()}{' '}
              <span className="text-light-text-primary dark:text-dark-text-primary">{user.fullname || 'User'}</span>!
            </h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-lg">
              Here's what's happening with your projects today.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-light-text-secondary dark:text-dark-text-secondary">
            <FiCalendar className="h-5 w-5" />
            <span>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </motion.div>
      ) : (
        <HeaderSkeleton />
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5 p-6">
        <StatCard
          icon={<FiClipboard className="h-6 w-6 text-white" />}
          label="Total Tasks"
          value={loading ? '...' : stats.totalTasks}
          color="bg-accent-primary"
          delay={0.1}
        />
        <StatCard
          icon={<FiClock className="h-6 w-6 text-white" />}
          label="In Progress"
          value={loading ? '...' : stats.inProgress}
          color="bg-accent-warning"
          delay={0.2}
        />
        <StatCard
          icon={<FiEye className="h-6 w-6 text-white" />}
          label="Under Review"
          value={loading ? '...' : stats.underReview}
          color="bg-accent-info"
          delay={0.3}
        />
        <StatCard
          icon={<FiCheckSquare className="h-6 w-6 text-white" />}
          label="Completed"
          value={loading ? '...' : stats.completed}
          color="bg-accent-success"
          delay={0.4}
        />
        <StatCard
          icon={<FiUsers className="h-6 w-6 text-white" />}
          label="Projects"
          value={loading ? '...' : stats.totalProjects}
          color="bg-light-bg-secondary dark:bg-dark-bg-secondary"
          delay={0.5}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <h2 className="text-light-text-primary dark:text-dark-text-primary mb-6 text-2xl font-bold">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <QuickAction
            icon={<FiPlus className="h-5 w-5 text-white" />}
            label="Create New Project"
            onClick={() => setCreateProjectModalOpen(true)}
            color="bg-accent-primary text-white"
            delay={0.1}
          />
        </div>
      </motion.div>

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setCreateProjectModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-light-text-primary dark:text-dark-text-primary text-2xl font-bold">Recent Projects</h2>
          <Link
            to="/projects"
            className="flex items-center text-light-text-primary dark:text-dark-text-primary transition-colors duration-200 hover:text-accent-primary "
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
              <ProjectCard key={project._id} project={project} delay={index * 0.1} />
            ))}
          </div>
        ) : (
          <EmptyState message="Create your first project to get started." />
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
