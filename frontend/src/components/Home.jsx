import React from 'react';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className="text-white">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gray-800 rounded-lg">
        <h1 className="text-5xl font-bold">Welcome to the Task Management System</h1>
        <p className="mt-4 text-xl text-gray-300">The ultimate solution for organizing projects and boosting productivity.</p>
        <Link to="/register">
          <button className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition duration-300">
            Get Started for Free
          </button>
        </Link>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Project Management</h3>
            <p className="text-gray-400">Create, organize, and track all your projects in one place. Get a clear overview of your progress at a glance.</p>
          </div>
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Task Collaboration</h3>
            <p className="text-gray-400">Assign tasks, set deadlines, and collaborate with your team in real-time. Keep everyone on the same page.</p>
          </div>
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Kanban Boards</h3>
            <p className="text-gray-400">Visualize your workflow with intuitive Kanban boards. Drag and drop tasks to update their status effortlessly.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 border-t border-gray-700">
        <p className="text-gray-500">© {new Date().getFullYear()} TMS. All rights reserved.</p>
      </footer>
    </div>
  );
};
