import React from 'react';
import { useAuth } from './auth/AuthContext';
import { motion } from 'framer-motion';
import { FiCheckSquare, FiClock, FiClipboard } from 'react-icons/fi';

const StatCard = ({ icon, label, value, color }) => (
  <motion.div 
    className="bg-primary/50 backdrop-blur-lg p-6 rounded-lg border border-secondary flex items-center space-x-4"
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.2 }}
  >
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-3xl font-bold text-text-primary">{value}</p>
      <p className="text-text-secondary">{label}</p>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h1 className="text-4xl font-bold mb-2 text-text-primary">Welcome, {user?.fullname || 'User'}!</h1>
      <p className="text-lg text-text-secondary mb-8">Here's a glance at your productivity.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<FiClipboard size={24} />} label="Total Tasks" value="12" color="bg-accent/20 text-accent" />
        <StatCard icon={<FiClock size={24} />} label="In Progress" value="3" color="bg-yellow-500/20 text-yellow-500" />
        <StatCard icon={<FiCheckSquare size={24} />} label="Completed" value="5" color="bg-green-500/20 text-green-500" />
      </div>

      {/* Future components can be added here, e.g., recent activity, upcoming deadlines */}
    </motion.div>
  );
};

export default Dashboard;
