import { useState } from "react"
import toast from "react-hot-toast"
import { FiUserPlus, FiX } from "react-icons/fi"
import apiService from "../../../../service/apiService.js"
import Modal from "../../Modal.jsx"

const getAvatarSrc = (member) => {
  const u = member?.user
  if (!u || typeof u !== "object") {
    const id = u ? String(u) : ""
    return id ? `https://i.pravatar.cc/150?u=${id}` : "https://placehold.co/72"
  }
  const a = u.avatar
  if (typeof a === "string") return a
  if (a && typeof a === "object" && "url" in a && typeof a.url === "string") return a.url
  const id = u._id != null ? String(u._id) : ""
  return id ? `https://i.pravatar.cc/150?u=${id}` : "https://placehold.co/72"
}

const getAvatarAlt = (member) => {
  const u = member?.user
  if (u && typeof u === "object") {
    const name = [u.fullname, u.username, u.email].find(Boolean)
    if (typeof name === "string") return name
  }
  return "Member"
}

const roleColors = {
  owner: "bg-accent-danger/10 text-accent-danger",
  project_admin: "bg-accent-warning/10 text-accent-warning",
  member: "bg-accent-info/10 text-accent-info",
}

const ProjectAdminMembers = ({ members, setMembers, projectId, onRefresh }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("member")
  const [searchQuery, setSearchQuery] = useState("")

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter an email address.")
      return
    }
    const toastId = toast.loading("Adding member...")
    try {
      const response = await apiService.addMember(projectId, email, role)
      if (response.success) {
        toast.success("Member added successfully!", { id: toastId })
        setMembers((prev) => [...prev, response.data])
        setEmail("")
        setRole("member")
        setIsAddModalOpen(false)
        if (onRefresh) onRefresh()
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to add member"
      toast.error(errorMessage, { id: toastId })
    }
  }

  const handleRemoveMember = async (memberId, memberName) => {
    if (!confirm(`Remove ${memberName} from this project?`)) return
    const toastId = toast.loading("Removing member...")
    try {
      await apiService.removeMember(projectId, memberId)
      toast.success("Member removed successfully!", { id: toastId })
      setMembers((prev) => prev.filter((m) => m._id !== memberId))
      if (onRefresh) onRefresh()
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to remove member"
      toast.error(errorMessage, { id: toastId })
    }
  }

  const handleChangeRole = async (memberId, newRole) => {
    const toastId = toast.loading("Updating role...")
    try {
      await apiService.customFetch(`/members/update/${projectId}`, {
        method: "PUT",
        body: JSON.stringify({ userId: memberId, role: newRole }),
      })
      toast.success("Role updated!", { id: toastId })
      setMembers((prev) =>
        prev.map((m) =>
          m.user?._id === memberId || m.user === memberId ? { ...m, role: newRole } : m
        )
      )
      if (onRefresh) onRefresh()
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update role"
      toast.error(errorMessage, { id: toastId })
    }
  }

  const filteredMembers = members.filter((m) => {
    const email = m.user?.email || ""
    const name = m.user?.fullname || ""
    const q = searchQuery.toLowerCase()
    return email.toLowerCase().includes(q) || name.toLowerCase().includes(q)
  })

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
            Project Members ({members.length})
          </h2>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            Manage who has access to this project
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-accent-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-primary-dark"
        >
          <FiUserPlus className="h-4 w-4" />
          Add Member
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-light-border bg-light-bg-secondary px-4 py-2.5 text-sm text-light-text-primary placeholder:text-light-text-tertiary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 dark:border-dark-border dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:placeholder:text-dark-text-tertiary"
        />
      </div>

      {/* Members List */}
      <div className="space-y-2">
        {filteredMembers.length === 0 ? (
          <div className="rounded-xl border border-light-border bg-light-bg-secondary p-8 text-center dark:border-dark-border dark:bg-dark-bg-tertiary">
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              No members found
            </p>
          </div>
        ) : (
          filteredMembers.map((member) => {
            const userId = member.user?._id || member.user
            const userName =
              member.user?.fullname || member.user?.username || member.user?.email || "Unknown"
            const userEmail = member.user?.email || ""
            return (
              <div
                key={member._id}
                className="flex items-center justify-between rounded-xl border border-light-border bg-light-bg-secondary p-4 transition-colors hover:bg-light-bg-hover dark:border-dark-border dark:bg-dark-bg-tertiary dark:hover:bg-dark-bg-hover"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={getAvatarSrc(member)}
                    alt={getAvatarAlt(member)}
                    className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-light-text-primary dark:text-dark-text-primary">
                      {userName}
                    </p>
                    <p className="truncate text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      {userEmail}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    value={member.role}
                    onChange={(e) => handleChangeRole(userId, e.target.value)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${roleColors[member.role] || roleColors.member}`}
                    aria-label={`Change role for ${userName}`}
                  >
                    <option value="owner">Owner</option>
                    <option value="project_admin">Project Admin</option>
                    <option value="member">Member</option>
                  </select>
                  {member.role !== "owner" && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member._id, userName)}
                      className="rounded-full p-1.5 text-light-text-tertiary transition-colors hover:bg-accent-danger/10 hover:text-accent-danger"
                      aria-label={`Remove ${userName}`}
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add Member Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Member">
        <form onSubmit={handleAddMember} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="member-email"
              className="mb-1 block text-sm font-medium text-light-text-primary dark:text-dark-text-primary"
            >
              Email
            </label>
            <input
              id="member-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@example.com"
              className="w-full rounded-lg border border-light-border bg-light-bg-primary px-4 py-2.5 text-sm text-light-text-primary placeholder:text-light-text-tertiary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 dark:border-dark-border dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:placeholder:text-dark-text-tertiary"
              required
            />
          </div>
          <div>
            <label
              htmlFor="member-role"
              className="mb-1 block text-sm font-medium text-light-text-primary dark:text-dark-text-primary"
            >
              Role
            </label>
            <select
              id="member-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-light-border bg-light-bg-primary px-4 py-2.5 text-sm text-light-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 dark:border-dark-border dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
            >
              <option value="member">Member</option>
              <option value="project_admin">Project Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-lg border border-light-border px-4 py-2 text-sm font-medium text-light-text-secondary transition-colors hover:bg-light-bg-hover dark:border-dark-border dark:text-dark-text-secondary dark:hover:bg-dark-bg-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-primary-dark"
            >
              Add Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ProjectAdminMembers
