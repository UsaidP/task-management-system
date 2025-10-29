import React, { useState, useEffect, useMemo, Fragment } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { Listbox } from "@headlessui/react";
import toast from "react-hot-toast";

// --- Helper Function ---
const formatDateForInput = (date) => {
  if (!date) return "";
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
  return adjustedDate.toISOString().split("T")[0];
};

// --- Mock API (Replace with real API later) ---
const apiService = {
  createTask: async (projectId, formData) => {
    await new Promise((res) => setTimeout(res, 1000));
    return {
      success: true,
      task: {
        id: Date.now(),
        date: new Date(formData.dueDate.replace(/-/g, "/")),
        ...formData,
      },
    };
  },
};

// --- Modal Component ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// --- Options ---
const priorityOptions = [
  { id: "low", name: "Low" },
  { id: "medium", name: "Medium" },
  { id: "high", name: "High" },
  { id: "urgent", name: "Urgent" },
];
const statusOptions = [
  { id: "todo", name: "To Do" },
  { id: "in-progress", name: "In Progress" },
  { id: "under-review", name: "Under Review" },
  { id: "completed", name: "Completed" },
];

const mockMembers = [
  { _id: "member-1", user: { fullname: "Alice Smith" } },
  { _id: "member-2", user: { fullname: "Bob Johnson" } },
  { _id: "member-3", user: { fullname: "Charlie Brown" } },
];

// --- Create Task Modal ---
const CreateTaskModal = ({
  isOpen,
  onClose,
  onTaskCreated,
  projectId,
  members,
  selectedDate,
}) => {
  const initialFormState = {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignedTo: [],
    dueDate: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && selectedDate) {
      setFormData({
        ...initialFormState,
        dueDate: formatDateForInput(selectedDate),
      });
    } else if (!isOpen) {
      setFormData(initialFormState);
      setIsSubmitting(false);
    }
  }, [isOpen, selectedDate]);

  const assigneeOptions = useMemo(() => {
    return members.map((m) => ({
      id: m._id,
      name: m.user?.fullname || "Unknown",
    }));
  }, [members]);

  const selectedPriorityObject = priorityOptions.find(
    (p) => p.id === formData.priority
  );
  const selectedStatusObject = statusOptions.find(
    (s) => s.id === formData.status
  );

  const getAssigneeButtonText = () => {
    const count = formData.assignedTo.length;
    if (count === 0) return "Select members";
    if (count === 1)
      return assigneeOptions.find((a) => a.id === formData.assignedTo[0])
        ?.name;
    return `${count} members selected`;
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleListboxChange = (name, value) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Creating task...");
    try {
      const response = await apiService.createTask(projectId, formData);
      if (response.success) {
        onTaskCreated(response.task);
        toast.success("Task created!", { id: toastId });
        onClose();
      } else {
        toast.error("Failed to create task", { id: toastId });
      }
    } catch {
      toast.error("An error occurred.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputLabelClass =
    "block text-sm font-medium text-slate-700 mb-1";
  const inputFieldClass =
    "block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={inputLabelClass}>Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={inputFieldClass}
            required
          />
        </div>

        <div>
          <label className={inputLabelClass}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={inputFieldClass}
            rows="3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label className={inputLabelClass}>Status</label>
            <Listbox
              value={formData.status}
              onChange={(v) => handleListboxChange("status", v)}
            >
              <div className="relative">
                <Listbox.Button
                  className={`${inputFieldClass} flex items-center justify-between`}
                >
                  <span>{selectedStatusObject?.name}</span>
                  <FiChevronDown />
                </Listbox.Button>
                <Listbox.Options className="absolute z-50 w-full bg-white border border-slate-200 rounded-md mt-1 shadow-lg">
                  {statusOptions.map((opt) => (
                    <Listbox.Option key={opt.id} value={opt.id}>
                      {({ selected }) => (
                        <li
                          className={`cursor-pointer py-2 px-4 ${selected ? "bg-slate-100 font-semibold" : ""
                            }`}
                        >
                          {opt.name}
                        </li>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>

          {/* Priority */}
          <div>
            <label className={inputLabelClass}>Priority</label>
            <Listbox
              value={formData.priority}
              onChange={(v) => handleListboxChange("priority", v)}
            >
              <div className="relative">
                <Listbox.Button
                  className={`${inputFieldClass} flex items-center justify-between`}
                >
                  <span>{selectedPriorityObject?.name}</span>
                  <FiChevronDown />
                </Listbox.Button>
                <Listbox.Options className="absolute z-50 w-full bg-white border border-slate-200 rounded-md mt-1 shadow-lg">
                  {priorityOptions.map((opt) => (
                    <Listbox.Option key={opt.id} value={opt.id}>
                      {({ selected }) => (
                        <li
                          className={`cursor-pointer py-2 px-4 ${selected ? "bg-slate-100 font-semibold" : ""
                            }`}
                        >
                          {opt.name}
                        </li>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>

          {/* Assign To */}
          <div className="md:col-span-2">
            <label className={inputLabelClass}>Assign To</label>
            <Listbox
              value={formData.assignedTo}
              onChange={(v) => handleListboxChange("assignedTo", v)}
              multiple
            >
              <div className="relative">
                <Listbox.Button
                  className={`${inputFieldClass} flex items-center justify-between`}
                >
                  <span>{getAssigneeButtonText()}</span>
                  <FiChevronDown />
                </Listbox.Button>
                <Listbox.Options className="absolute z-50 w-full bg-white border border-slate-200 rounded-md mt-1 shadow-lg">
                  {assigneeOptions.map((opt) => (
                    <Listbox.Option key={opt.id} value={opt.id}>
                      {({ selected }) => (
                        <li
                          className={`cursor-pointer py-2 px-4 ${selected ? "bg-slate-100 font-semibold" : ""
                            }`}
                        >
                          <div className="flex items-center">
                            {selected && (
                              <FiCheck className="w-5 h-5 mr-2 text-blue-500" />
                            )}
                            {opt.name}
                          </div>
                        </li>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>

          {/* Due Date */}
          <div className="md:col-span-2">
            <label className={inputLabelClass}>Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className={inputFieldClass}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// --- Main Calendar ---
const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = new Date();
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const goToNextMonth = () =>
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const goToPrevMonth = () =>
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleDayClick = (day) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
    setIsModalOpen(true);
  };

  const handleTaskCreated = (task) => setEvents([...events, task]);

  const getEventsForDay = (day) =>
    events.filter(
      (e) =>
        new Date(e.date).toDateString() ===
        new Date(currentYear, currentMonth, day).toDateString()
    );

  return (
    <div className="flex flex-col w-full h-full bg-white p-8 overflow-y-auto">
      <div className="w-full rounded-2xl bg-white shadow-sm p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {currentDate.toLocaleString("default", { month: "long" })}{" "}
            <span className="text-slate-500">{currentYear}</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100"
            >
              Today
            </button>
            <button
              onClick={goToPrevMonth}
              className="rounded-full p-2 hover:bg-slate-200"
            >
              <FiChevronLeft />
            </button>
            <button
              onClick={goToNextMonth}
              className="rounded-full p-2 hover:bg-slate-200"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500 uppercase">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Calendar */}
        <div className="grid grid-cols-7 gap-2 mt-2">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`blank-${i}`} className="h-10"></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday =
              day === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear();
            const dayEvents = getEventsForDay(day);

            return (
              <div
                key={day}
                onClick={() => handleDayClick(day)}
                className={`relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer transition-colors ${isToday
                  ? "bg-blue-600 text-white font-bold"
                  : "hover:bg-slate-200 text-slate-700"
                  }`}
              >
                {day}
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1">
                    {dayEvents.slice(0, 3).map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                      ></div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal */}
        <CreateTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTaskCreated={handleTaskCreated}
          projectId="mock-project"
          members={mockMembers}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
};

export default CalendarView;
