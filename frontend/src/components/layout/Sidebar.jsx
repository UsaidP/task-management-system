import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FiHome, FiFolder, FiPlusSquare } from "react-icons/fi";
import apiService from "../../../service/apiService.js";
import CreateProjectModal from "../project/CreateProjectModal";

const Sidebar = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiService.getAllProjects();
        if (response.success) {
          setProjects(response.data.projects);
        }
      } catch (err) {
        console.error("Failed to fetch projects for sidebar");
      }
    };
    fetchProjects();
  }, []);

  const handleProjectCreated = (newProject) => {
    setProjects((prevProjects) => [newProject, ...prevProjects]);
  };

  const NavLinkClasses = ({ isActive }) =>
    `flex items-center px-4 py-2 rounded-md text-text-secondary hover:bg-primary hover:text-text-primary transition-colors duration-200 ${
      isActive ? "bg-primary text-text-primary" : ""
    }`;

  return (
    <>
      <div className="w-64 h-screen bg-primary/50 backdrop-blur-lg text-white flex flex-col border-r border-secondary">
        <div className="p-4 border-b border-secondary flex items-center justify-between">
          <h1 className="text-2xl font-bold text-accent">TMS</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavLink to="/dashboard" className={NavLinkClasses}>
            <FiHome className="mr-3" />
            Dashboard
          </NavLink>
          <h2 className="px-4 pt-4 text-lg font-semibold text-text-primary">
            Projects
          </h2>
          {projects.map((project) => (
            <NavLink
              to={`/project/${project._id}`}
              key={project._id}
              className={NavLinkClasses}
            >
              <FiFolder className="mr-3" />
              {project.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-secondary">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center px-4 py-2 font-medium text-white bg-accent/80 rounded-md hover:bg-accent"
          >
            <FiPlusSquare className="mr-2" />
            Create Project
          </button>
        </div>
      </div>
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </>
  );
};

export default Sidebar;
