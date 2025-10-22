import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiChevronDown } from "react-icons/fi";
import apiService from "../../../service/apiService";
import Modal from "../Modal";

const EditTaskModal = ({ isOpen, onClose, onTaskUpdated, task, members }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    assignedTo: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const statusOptions = [
    { id: "todo", name: "To Do" },
    { id: "in-progress", name: "In Progress" },
    { id: "under-review", name: "Under Review" },
    { id: "completed", name: "Completed" },
  ];
  const priorityOptions = [
    { id: "low", name: "Low" },
    { id: "medium", name: "Medium" },
    { id: "high", name: "High" },
    { id: "urgent", name: "Urgent" },
  ]

  const assigneeOptions = useMemo(() => {
    if (!members) return [];
    return members.map((member) => ({
      id: member._id,
      name:
        member.user?.fullname || member.fullname || member.email || "Unknown",
    }));
  }, [members]);
  const selectedStatusObject = statusOptions.find(
    (s) => s.id === formData.status,
  );
  const selectedPriorityObject = priorityOptions.find(
    (p) => p.id === formData.priority,
  );
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "Medium",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "",
        assignedTo: task.assignedTo || [],
      });
    }
  }, [task]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMultiSelectChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    setFormData((prev) => ({ ...prev, assignedTo: selectedOptions }));
  };
  // Specific handler for Headless UI Listbox (works for single and multi-select)
  const handleListboxChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Updating task...");
    try {
      const response = await apiService.updateTask(
        task.project,
        task._id,
        formData,
      );
      if (response.success) {
        onTaskUpdated(response.data);
        toast.success("Task updated!", { id: toastId });
        onClose();
      } else {
        toast.error(response.message || "Failed to update task", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error("An error occurred.", { id: toastId });
      console.error("Failed to update task", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title " className="input-label">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            className="input-field"
            required
          />
        </div>
        <div>
          <label htmlFor="description " className="input-label">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input-field"
            rows="3"
          />
        </div>
        <div>
          <label htmlFor="status " className="text-slate-900">
            Status
          </label>
          <Listbox
            value={formData.status}
            onChange={(value) => handleListboxChange("status", value)}
          >
            <div className="relative">
              <ListboxButton className="input-field w-full text-left flex items-center justify-between">
                <span className="truncate capitalize">
                  {selectedStatusObject?.name}
                </span>
                <FiChevronDown className="w-4 h-4 text-slate-700" />
              </ListboxButton>
              <ListboxOptions className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg focus:outline-none max-h-60 overflow-auto">
                {statusOptions.map((option) => (
                  <ListboxOption
                    key={option.id}
                    value={option.id}
                    className={({ active }) =>
                      `cursor-pointer select-none relative py-2 px-4 ${active
                        ? "bg-slate-200 text-slate-900"
                        : "text-slate-700"
                      }`
                    }
                  >
                    {({ selected }) => (
                      <span
                        className={`block truncate ${selected ? "font-semibold" : "font-normal"}`}
                      >
                        {option.name}
                      </span>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>
        <div>
          <label htmlFor="priority" className="text-slate-900">
            Priority
          </label>
          <Listbox
            value={formData.priority}
            onChange={(value) => handleListboxChange("priority", value)}
          >
            <div className="relative">
              <ListboxButton className="input-field w-full text-left flex items-center justify-between">
                <span className=" truncate capitalize">
                  {selectedPriorityObject?.name}
                </span>
                <FiChevronDown className="w-4 h-4 text-slate-700" />
              </ListboxButton>
              <ListboxOptions className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg focus:outline-none max-h-60 overflow-auto">
                {priorityOptions.map((option) => (
                  <ListboxOption
                    key={option.id}
                    value={option.id}
                    className={({ active }) =>
                      `cursor-pointer select-none relative py-2 px-4 ${active
                        ? "bg-slate-200 text-slate-900"
                        : "text-slate-700"
                      }`
                    }
                  >
                    {({ selected }) => (
                      <span
                        className={`block truncate ${selected ? "font-bold" : "font-normal"}`}
                      >
                        {option.name}
                      </span>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>
        <div>
          <label htmlFor="Assign To" className="text-slate-900">
            Assign To
          </label>
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
          <p className="text-xs text-slate-500 mt-1">
            Hold Ctrl or Cmd to select multiple members.
          </p>
        </div>
        <div>
          <label htmlFor="Due Date" className="input-label">
            Due Date
          </label>
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
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditTaskModal;
