import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus } from 'react-icons/fi';
import apiService from '../../../service/apiService';
import toast from 'react-hot-toast';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated, projectId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const toastId = toast.loading('Creating task...');

    try {
      const response = await apiService.createTask(projectId, { 
        title, 
        description, 
        status,
        priority 
      });
      if (response.success) {
        toast.success('Task created successfully!', { id: toastId });
        onTaskCreated(response.task);
        // Reset form
        setTitle('');
        setDescription('');
        setStatus('todo');
        setPriority('medium');
        onClose();
      }
    } catch (err) {
      const errorMessage = err.data?.message || 'Failed to create task';
      toast.error(errorMessage, { id: toastId });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setStatus('todo');
    setPriority('medium');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg glass rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-text-primary">Create New Task</h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-surface-light transition-colors duration-200 group"
              >
                <FiX className="w-5 h-5 text-text-muted group-hover:text-text-primary" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter task title..."
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the task..."
                    rows="4"
                    required
                    className="input-field resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-text-primary mb-2">
                      Status
                    </label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="input-field"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-text-primary mb-2">
                      Priority
                    </label>
                    <select
                      id="priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="input-field"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary group"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="loading-dots mr-2">
                          <div></div>
                          <div></div>
                          <div></div>
                          <div></div>
                        </div>
                        Creating...
                      </div>
                    ) : (
                      <>
                        <FiPlus className="mr-2 group-hover:rotate-90 transition-transform duration-200" />
                        Create Task
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateTaskModal;