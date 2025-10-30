import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FiChevronDown,
  FiFolder,
  FiHome,
  FiPlusSquare,
  FiSettings,
  FiCalendar,
} from "react-icons/fi";
import { NavLink } from "react-router-dom";
import apiService from "../../../service/apiService.js";
import { useAuth } from "../context/customHook.js";
import CreateProjectModal from "../project/CreateProjectModal";
import { NetworkError, EmptyState } from "../ErrorStates.jsx";

const getNavLinkClasses = ({ isActive }) =>
  `flex items-center px-4 py-3 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-all duration-200 group ${isActive ? "bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary" : ""}`;

const Sidebar = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchProjects = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getAllProjects();
      if (response.success) {
        setProjects(response.data?.projects || []);
      }
    } catch (err) {
      console.error("Failed to fetch projects for sidebar", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const handleProjectCreated = (newProject) => {
    setProjects((prevProjects) => [newProject, ...prevProjects]);
    if (!isProjectMenuOpen) {
      setIsProjectMenuOpen(true);
    }
  };

  const renderProjectList = () => {
    if (isLoading) {
      return <div className="px-4 py-2 text-light-text-tertiary dark:text-dark-text-tertiary">Loading projects...</div>;
    }
    if (error) {
      return <NetworkError onRetry={fetchProjects} />;
    }
    if (projects.length === 0) {
      return <EmptyState message="No projects yet." />;
    }
    return (
      <AnimatePresence>
        {projects.map((project, index) => (
          <motion.div
            key={project._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: index * 0.05 }}
          >
            <NavLink
              to={`/project/${project._id}`}
              className={getNavLinkClasses}
            >
              <FiFolder className="mr-3 w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">{project.name}</span>
            </NavLink>
          </motion.div>
        ))}
      </AnimatePresence>
    );
  };

  return (
    <>
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-80 h-screen bg-light-bg-secondary dark:bg-dark-bg-secondary flex flex-col border-r border-light-border dark:border-dark-border"
      >
        <div className="p-6 border-b border-light-border dark:border-dark-border">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary"
          >
            TaskFlow
          </motion.h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mt-1">Manage with style</p>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <NavLink to="/dashboard" className={getNavLinkClasses}>
              <FiHome className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
              Dashboard
            </NavLink>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <button
              className="flex w-full items-center justify-between px-4 py-3 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover transition-all duration-200 group"
              onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
            >
              <div className="flex items-center">
                <FiFolder className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
                Projects
              </div>
              <div className="flex items-center">
                {!isLoading && !error && (
                  <span className="text-xs bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-primary dark:text-dark-text-primary px-2 py-0.5 rounded-full mr-2">
                    {projects.length}
                  </span>
                )}
                <FiChevronDown
                  className={`w-4 h-4 text-light-text-tertiary dark:text-dark-text-tertiary transition-transform duration-200 ${isProjectMenuOpen ? "rotate-180" : ""}`}
                />
              </div>
            </button>
          </motion.div>

          <AnimatePresence>
            {isProjectMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pl-4 pt-2 space-y-1 max-h-96 overflow-y-auto">
                  {renderProjectList()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
          >
            <NavLink to="/calendar" className={getNavLinkClasses}>
              <FiCalendar className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
              Calendar
            </NavLink>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
          >
            <NavLink to="/settings" className={getNavLinkClasses}>
              <FiSettings className="mr-3 w-5 h-5 group-hover:scale-110 transition-transform" />
              Settings
            </NavLink>
          </motion.div>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 pt-2 border-t border-light-border dark:border-dark-border"
        >
          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex w-full items-center justify-center rounded-md btn-primary px-4 py-2 text-white transition-colors"
          >
            <FiPlusSquare className="mr-2 transition-transform duration-200 group-hover:rotate-90" />
            Create Project
          </button>
        </motion.div>
      </motion.div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </>
  );
};

export default Sidebar;