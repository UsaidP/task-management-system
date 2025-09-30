import React, { useState, useEffect } from "react";
import apiService from "../../../service/apiService.js";
import toast from "react-hot-toast";

const ProjectMembers = ({ projectId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await apiService.getAllMembers(projectId);
        if (response.success) {
          setMembers(response.data);
        }
      } catch (err) {
        setError("Failed to fetch members");
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [projectId]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Adding member...");
    try {
      const response = await apiService.addMember(projectId, email, role);
      if (response.success) {
        toast.success("Member added successfully!", { id: toastId });
        setMembers([...members, response.data]);
        setEmail("");
      }
    } catch (err) {
      const errorMessage = err.data?.message || "Failed to add member";
      toast.error(errorMessage, { id: toastId });
      setError(errorMessage);
    }
  };

  const handleRemoveMember = async (userId) => {
    const toastId = toast.loading("Removing member...");
    try {
      await apiService.removeMember(projectId, userId);
      toast.success("Member removed successfully!", { id: toastId });
      setMembers(members.filter((member) => member.user._id !== userId));
    } catch (err) {
      const errorMessage = err.data?.message || "Failed to remove member";
      toast.error(errorMessage, { id: toastId });
      setError(errorMessage);
    }
  };

  if (loading) return <p>Loading members...</p>;
  if (error && !members.length) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">Project Members</h3>
      {error && <p className="text-red-500 py-2">{error}</p>}
      <form onSubmit={handleAddMember} className="flex gap-2 mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Member's email"
          className="w-full px-3 py-2 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-3 py-2 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="member">Member</option>
          <option value="project_admin">Project Admin</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Add
        </button>
      </form>
      <ul>
        {members.map((member) => (
          <li
            key={member._id}
            className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm dark:bg-gray-700 mb-2"
          >
            <div>
              <p className="font-bold">{member.user.email}</p>
              <p className="text-sm text-gray-500">{member.role}</p>
            </div>
            <button
              onClick={() => handleRemoveMember(member.user._id)}
              className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectMembers;
