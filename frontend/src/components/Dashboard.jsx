import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./context/customHook.js";
import { motion } from "framer-motion";
import {
  FiCheckSquare,
  FiClock,
  FiClipboard,
  FiTrendingUp,
  FiUsers,
  FiCalendar,
  FiArrowRight,
  FiPlus,
} from "react-icons/fi";
import ProjectCardSkeleton from "./project/ProjectCardSkeleton";
import CreateProjectModal from "./project/CreateProjectModal";
import apiService from "../../service/apiService.js";

const StatCard = ({ icon, label, value, color, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="card-interactive group"
  >
    <div className="flex items-center justify-between mb-4">
      <div
        className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-200`}
      >
        {icon}
      </div>
      {trend && (
        <div className="flex items-center text-success text-sm">
          <FiTrendingUp className="w-4 h-4 mr-1" />+{trend}%
        </div>
      )}
    </div>
    <div>
      <p className="text-3xl font-bold text-text-primary mb-1">{value}</p>
      <p className="text-text-secondary">{label}</p>
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
      <div className="card-interactive group">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          <FiArrowRight className="w-5 h-5 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
        </div>
        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
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
            <FiUsers className="w-3 h-3 mr-1" />
            {/* {console.log(project)} */}
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
    className={`card-interactive text-left group ${color}`}
  >
    <div className="flex items-center">
      <div className="p-2 rounded-lg bg-white/10 mr-3 group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </div>
  </motion.button>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    inProgress: 0,
    completed: 0,
    totalProjects: 0,
  });

  const [isCreateProjectModalOpen, setCreateProjectModalOpen] = useState(false);

  const handleProjectCreated = (newProject) => {
    setProjects([newProject, ...projects]);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiService.getAllProjects();
        console.log(response);
        if (response.success) {
          const projectsData = response.data.projects;
          setProjects(projectsData.slice(0, 6)); // Show only first 6 projects

          // TODO: Calculate stats with actual task data
          setStats({
            totalTasks: 0,
            inProgress: 0,
            completed: 0,
            totalProjects: projectsData.length,
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2 text-text-primary">
            {getGreeting()}{" "}
            {/* <span className="gradient-text">{user.fullname || "User"}</span>! */}
          </h1>
          <p className="text-lg text-text-secondary">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-text-muted">
          <FiCalendar className="w-5 h-5" />
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FiClipboard className="w-6 h-6 text-white" />}
          label="Total Tasks"
          value={loading ? "..." : stats.totalTasks}
          color="bg-gradient-to-r from-primary to-primary-light"
          trend={12}
          delay={0.1}
        />
        <StatCard
          icon={<FiClock className="w-6 h-6 text-white" />}
          label="In Progress"
          value={loading ? "..." : stats.inProgress}
          color="bg-gradient-to-r from-warning to-yellow-400"
          trend={8}
          delay={0.2}
        />
        <StatCard
          icon={<FiCheckSquare className="w-6 h-6 text-white" />}
          label="Completed"
          value={loading ? "..." : stats.completed}
          color="bg-gradient-to-r from-success to-accent-light"
          trend={15}
          delay={0.3}
        />
        <StatCard
          icon={<FiUsers className="w-6 h-6 text-white" />}
          label="Projects"
          value={loading ? "..." : stats.totalProjects}
          color="bg-gradient-to-r from-secondary to-secondary-light"
          trend={5}
          delay={0.4}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-text-primary">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            icon={<FiPlus className="w-5 h-5 text-white" />}
            label="Create New Project"
            onClick={() => setCreateProjectModalOpen(true)}
            color="bg-gradient-to-r from-primary to-primary-light text-white"
            delay={0.1}
          />
          <QuickAction
            icon={<FiClipboard className="w-5 h-5 text-white" />}
            label="Add Quick Task"
            onClick={() => console.log("Add Quick Task clicked")}
            color="bg-gradient-to-r from-success to-accent-light text-white"
            delay={0.2}
          />
          <QuickAction
            icon={<FiUsers className="w-5 h-5 text-white" />}
            label="Invite Team Member"
            onClick={() => console.log("Invite Team Member clicked")}
            color="bg-gradient-to-r from-secondary to-secondary-light text-white"
            delay={0.3}
          />
        </div>
      </motion.div>

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setCreateProjectModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* Recent Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            Recent Projects
          </h2>
          <Link
            to="/projects"
            className="text-primary hover:text-primary-light transition-colors duration-200 flex items-center"
          >
            View All
            <FiArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            className="card text-center py-12"
          >
            <FiClipboard className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              No Projects Yet
            </h3>
            <p className="text-text-secondary mb-6">
              Create your first project to get started with task management.
            </p>
            <button className="btn-primary">
              <FiPlus className="mr-2" />
              Create Project
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
