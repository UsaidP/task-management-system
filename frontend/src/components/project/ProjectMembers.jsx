import { UserPlusIcon, XIcon } from "@animateicons/react/lucide"
import { Listbox } from "@headlessui/react" // 1. Import Listbox
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import apiService from "../../../service/apiService.js"
import Avatar from "../auth/Avatar"
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

  const handleRemoveMember = async (memberId) => {
    const toastId = toast.loading("Removing member...")
    try {
      await apiService.removeMember(projectId, memberId)
      toast.success("Member removed successfully!", { id: toastId })
      setMembers(members.filter((member) => member._id !== memberId))
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
        <form onSubmit={handleAddMember} className="flex flex-col gap-3 mb-6 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Member's email"
            className="w-full px-4 py-3 bg-bg-surface text-text-primary border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            required
          />

          {/* 3. Replaced <select> with Headless UI <Listbox> */}
          <Listbox value={role} onChange={setRole}>
            <div className="relative">
              <Listbox.Button
                aria-label="Select role"
                className="w-full text-left w-full px-4 py-3 bg-bg-surface text-text-primary border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all sm:w-40"
              >
                <span className="block truncate">{selectedRoleObject?.name}</span>
                {/* You can add a chevron icon here if you want */}
              </Listbox.Button>
              <Listbox.Options className="absolute z-[100] mt-1 w-full max-h-60 overflow-auto rounded-md border border-border bg-bg-canvas shadow-lg focus:outline-none">
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
            className="flex items-center justify-center gap-2 px-4 py-2 font-semibold transition-colors rounded-lg bg-primary hover:bg-primary/90 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
          >
            <UserPlusIcon aria-hidden="true" />
            Add
          </button>
        </form>

        {error && <p className="mb-4 text-sm text-center text-danger">{error}</p>}

        {/* Members List */}
        <ul className="pr-2 space-y-2 overflow-y-auto max-h-80" aria-label="Project members list">
          {members.map((member) => {
            const rowKey = member._id
            return (
              <li
                key={rowKey}
                className="flex items-center justify-between p-3 border shadow-sm rounded-xl border-border bg-bg-surface"
              >
                <div className="flex items-center min-w-0">
                  <Avatar
                    src={member.user?.avatar?.url || member.user?.avatar}
                    alt={
                      typeof member.user === "object"
                        ? member.user?.fullname || member.user?.email || "Member"
                        : "Member"
                    }
                    size="sm"
                    className="mr-3"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold truncate text-text-primary">
                      {typeof member?.user === "object" && member.user?.email
                        ? member.user.email
                        : "—"}
                    </p>
                    <p className="text-sm capitalize text-text-secondary">
                      {member.role.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(member._id)}
                  className="flex-shrink-0 p-1 transition-colors rounded-full text-text-secondary hover:bg-accent-danger/10 hover:text-accent-danger"
                  aria-label={`Remove ${typeof member.user === "object" ? member.user?.fullname || member.user?.email || "member" : "member"}`}
                >
                  <XIcon size={20} aria-hidden="true" />
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
