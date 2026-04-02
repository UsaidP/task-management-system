import { Listbox } from "@headlessui/react" // 1. Import Listbox
import React, { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { FiUserPlus, FiX } from "react-icons/fi"
import apiService from "../../../service/apiService.js"
import Modal from "../Modal"

/** @param {{ user?: unknown }} member */
const getMemberUserId = (member) => {
  const u = member?.user
  if (u == null) return ""
  if (typeof u === "object" && u !== null && "_id" in u) return String(u._id)
  return String(u)
}

/** @param {{ user?: unknown }} member */
const getAvatarSrc = (member) => {
  const u = member?.user
  if (!u || typeof u !== "object") {
    const id = getMemberUserId(member)
    return id ? `https://i.pravatar.cc/150?u=${id}` : "https://placehold.co/72"
  }
  const a = u.avatar
  if (typeof a === "string") return a
  if (a && typeof a === "object" && "url" in a && typeof a.url === "string") return a.url
  const id = u._id != null ? String(u._id) : ""
  return id ? `https://i.pravatar.cc/150?u=${id}` : "https://placehold.co/72"
}

/** @param {{ user?: unknown }} member */
const getAvatarAlt = (member) => {
  const u = member?.user
  if (u && typeof u === "object") {
    const name = [u.fullname, u.username, u.email].find(Boolean)
    if (typeof name === "string") return name
  }
  return "Member"
}

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
      setMembers(members.filter((member) => getMemberUserId(member) !== userId))
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
              <Listbox.Options className="absolute z-[100] mt-1 w-full max-h-60 overflow-auto rounded-md border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-secondary shadow-lg focus:outline-none">
                {availableRoles.map((roleItem) => (
                  <Listbox.Option
                    key={roleItem.id}
                    value={roleItem.id}
                    className={({ active }) =>
                      `cursor-pointer select-none relative py-2 px-4 text-light-text-primary dark:text-dark-text-primary ${
                        active
                          ? "bg-light-bg-hover dark:bg-dark-bg-hover"
                          : "bg-light-bg-primary dark:bg-dark-bg-secondary"
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
          {members.map((member) => {
            const rowKey = getMemberUserId(member) || member._id
            return (
              <li
                key={rowKey}
                className="flex justify-between items-center rounded-xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-tertiary p-3 shadow-sm"
              >
                <div className="flex min-w-0 items-center">
                  <img
                    src={getAvatarSrc(member)}
                    alt={getAvatarAlt(member)}
                    className="mr-3 h-9 w-9 flex-shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-light-text-primary dark:text-dark-text-primary">
                      {typeof member?.user === "object" && member.user?.email
                        ? member.user.email
                        : "—"}
                    </p>
                    <p className="text-sm capitalize text-light-text-secondary dark:text-dark-text-secondary">
                      {member.role.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(getMemberUserId(member))}
                  className="flex-shrink-0 rounded-full p-1 text-light-text-secondary transition-colors hover:bg-rose-red/10 hover:text-rose-red dark:text-dark-text-secondary"
                  aria-label={`Remove ${getAvatarAlt(member)}`}
                >
                  <FiX size={20} />
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </Modal>
  )
}

export default ProjectMembers
