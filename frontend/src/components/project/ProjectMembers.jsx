import { Listbox } from "@headlessui/react" // 1. Import Listbox
import React, { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { FiUserPlus, FiX } from "react-icons/fi"
import apiService from "../../../service/apiService.js"
import Modal from "../Modal"

const ProjectMembers = ({ isOpen, onClose, projectId, members, setMembers }) => {
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  // This useState had a bug with two arguments, it's now fixed.
  const [role, setRole] = useState("member")

  // 2. Define roles for the Listbox
  const availableRoles = [
    { id: "member", name: "Member" },
    { id: "project_admin", name: "Project Admin" },
  ]

  // Find the full object for the currently selected role string
  const selectedRoleObject = availableRoles.find((r) => r.id === role)

  useEffect(() => {
    if (!isOpen) {
      setEmail("")
      setRole("member") // Reset to default
      setError("")
    }
  }, [isOpen])

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter an email address.")
      return
    }
    setError("")
    const toastId = toast.loading("Adding member...")

    try {
      // No change here, 'role' is still a string ("member" or "project_admin")
      const response = await apiService.addMember(projectId, email, role)
      if (response.success) {
        toast.success("Member added successfully!", { id: toastId })
        setMembers((prevMembers) => [...prevMembers, response.data])
        setEmail("")
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to add member"
      toast.error(errorMessage, { id: toastId })
      setError(errorMessage)
    }
  }

  const handleRemoveMember = async (userId) => {
    const toastId = toast.loading("Removing member...")
    try {
      await apiService.removeMember(projectId, userId)
      toast.success("Member removed successfully!", { id: toastId })
      setMembers(members.filter((member) => member.user._id !== userId))
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to remove member"
      toast.error(errorMessage, { id: toastId })
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Project Members">
      <div className="mt-4">
        {/* Add Member Form */}
        <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Member's email"
            className="input-field"
            required
          />

          {/* 3. Replaced <select> with Headless UI <Listbox> */}
          <Listbox value={role} onChange={setRole}>
            <div className="relative">
              <Listbox.Button className="input-field w-full sm:w-40 text-left">
                <span className="block truncate">{selectedRoleObject?.name}</span>
                {/* You can add a chevron icon here if you want */}
              </Listbox.Button>
              <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg focus:outline-none">
                {availableRoles.map((roleItem) => (
                  <Listbox.Option
                    key={roleItem.id}
                    value={roleItem.id}
                    className={({ active }) =>
                      `cursor-pointer select-none relative py-2 px-4 ${
                        active ? "bg-slate-200 text-slate-900" : "text-slate-700"
                      }`
                    }
                  >
                    {({ selected }) => (
                      <span
                        className={`block truncate ${selected ? "font-semibold" : "font-normal"}`}
                      >
                        {roleItem.name}
                      </span>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>

          <button
            type="submit"
            className="btn-primary flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-lg transition-colors"
          >
            <FiUserPlus />
            Add
          </button>
        </form>

        {error && <p className="text-rose-red text-sm text-center mb-4">{error}</p>}

        {/* Members List */}
        <ul className="space-y-2 max-h-80 overflow-y-auto pr-2">
          {members.map((member) => (
            <li
              key={member.user._id}
              className="flex justify-between items-center p-3 card"
            >
              <div className="flex items-center">
                <img
                  src={member.user.avatar || `https://i.pravatar.cc/150?u=${member.user._id}`}
                  alt={member.user.username}
                  className="w-9 h-9 rounded-full mr-3 object-cover"
                />
                <div>
                  <p className="font-semibold text-slate-900">{member?.user?.email}</p>
                  <p className="text-sm text-slate-700 capitalize">
                    {member.role.replace("_", " ")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveMember(member.user._id)}
                className="p-1 rounded-full text-slate-700 hover:text-rose-red hover:bg-rose-red/10 transition-colors"
                aria-label={`Remove ${member.user.username}`}
              >
                <FiX size={20} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  )
}

export default ProjectMembers
