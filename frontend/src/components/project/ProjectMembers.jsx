import React, { useState, useEffect } from "react";
import apiService from "../../../service/apiService.js";
import toast from "react-hot-toast";
import Modal from "../Modal";
import { FiX, FiUserPlus } from "react-icons/fi";
import { m } from "framer-motion";

const ProjectMembers = ({
  isOpen,
  onClose,
  projectId,
  members,
  setMembers,
}) => {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member", "project_admin");

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setRole("member", "project_admin");
      setError("");
    }
  }, [isOpen]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email address.");
      return;
    }
    setError("");
    const toastId = toast.loading("Adding member...");

    try {
      const response = await apiService.addMember(projectId, email, role);
      if (response.success) {
        toast.success("Member added successfully!", { id: toastId });
        setMembers([...members, response.data]);
        setEmail("");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to add member";
      toast.error(errorMessage, { id: toastId });
      setError(errorMessage);
    }
  };

  const handleRemoveMember = async (userId) => {
    // console.log(userId);
    const toastId = toast.loading("Removing member...");
    try {
      await apiService.removeMember(projectId, userId);
      toast.success("Member removed successfully!", { id: toastId });
      setMembers(members.filter((member) => member.user._id !== userId));
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to remove member";
      toast.error(errorMessage, { id: toastId });
    }
  };
  {
  }
  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Project Members">
      <div className="mt-4">
        {/* Add Member Form */}
        <form
          onSubmit={handleAddMember}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Member's email"
            className="flex-grow px-3 py-2 bg-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition"
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-3 py-2 bg-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition"
          >
            <option value="member">Member</option>
            <option value="project_admin">Project Admin</option>
          </select>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-4 py-2 font-semibold text-background bg-primary rounded-lg hover:bg-primary-hover transition-colors"
          >
            <FiUserPlus />
            Add
          </button>
        </form>

        {error && (
          <p className="text-danger text-sm text-center mb-4">{error}</p>
        )}

        {/* Members List */}
        <ul className="space-y-2 max-h-80 overflow-y-auto pr-2">
          {members.map(
            (member) => (
              console.log(member),
              (
                <li
                  key={member.user._id}
                  className="flex justify-between items-center p-3 bg-surface border border-border rounded-lg"
                >
                  <div className="flex items-center">
                    <img
                      src={
                        member.user.avatar ||
                        `https://i.pravatar.cc/150?u=${member.user._id}`
                      }
                      alt={member.user.username}
                      className="w-9 h-9 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <p className="font-semibold text-text-primary">
                        {member?.user?.email}
                      </p>
                      <p className="text-sm text-text-secondary capitalize">
                        {member.role.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.user._id)}
                    className="p-1 rounded-full text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                    aria-label={`Remove ${member.user.username}`}
                  >
                    <FiX size={20} />
                  </button>
                </li>
              )
            )
          )}
        </ul>
      </div>
    </Modal>
  );
};

export default ProjectMembers;
