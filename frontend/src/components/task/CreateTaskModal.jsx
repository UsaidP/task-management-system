import React, { useState } from "react";
import Modal from "../Modal";
import apiService from "../../../service/apiService";
import toast from "react-hot-toast";

const CreateTaskModal = ({
  isOpen,
  onClose,
  onTaskCreated,
  projectId,
  members,
}) => {
  const initialFormState = {
    title: "",
    description: "",
    status: "todo",
    priority: "Medium",
    assignedTo: [],
    dueDate: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({ ...prev, assignedTo: selectedOptions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Creating task...");
    try {
      const response = await apiService.createTask(projectId, formData);
      if (response.success) {
        onTaskCreated(response.task); // Ensure the correct data is passed up
        toast.success("Task created!", { id: toastId });
        onClose();
        setFormData(initialFormState); // Reset the form
      } else {
        toast.error(response.message || "Failed to create task", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error("An error occurred.", { id: toastId });
      console.error("Failed to create task", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="input-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input-field"
            rows="3"
          ></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="select-field"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="under-review">Under Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="input-label">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="select-field"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>
        <div>
          <label className="input-label">Assign To</label>
          <select
            multiple
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleMultiSelectChange}
            className="input-field h-32"
          >
            {members?.map((member) => (
              <option key={member.user._id} value={member.user._id}>
                {member.user.email}
              </option>
            ))}
          </select>
          <p className="text-xs text-text-muted mt-1">
            Hold Ctrl or Cmd to select multiple members.
          </p>
        </div>
        <div>
          <label className="input-label">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
