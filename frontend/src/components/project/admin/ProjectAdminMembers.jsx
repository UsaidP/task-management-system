import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react"
import { useId, useState } from "react"
import toast from "react-hot-toast"
import { FiCheck, FiChevronDown, FiUserPlus, FiX } from "react-icons/fi"
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

const roleOptions = [
  { id: "member", name: "Member" },
  { id: "project_admin", name: "Project Admin" },
  { id: "owner", name: "Owner" },
]

const ProjectAdminMembers = ({ members, setMembers, projectId, onRefresh }) => {
  const uid = useId()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("member")
  const [searchQuery, setSearchQuery] = useState("")

  const selectedRoleObject = roleOptions.find((r) => r.id === role)

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
          className="btn-primary flex items-center gap-2"
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
          className="input-field"
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
                  <Listbox
                    value={member.role}
                    onChange={(newRole) => handleChangeRole(userId, newRole)}
                  >
                    <div className="relative">
                      <ListboxButton
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${roleColors[member.role] || roleColors.member} flex items-center gap-1`}
                        aria-label={`Change role for ${userName}`}
                      >
                        <span className="capitalize">{member.role.replace("_", " ")}</span>
                        <FiChevronDown className="w-3 h-3" />
                      </ListboxButton>
                      <ListboxOptions className="absolute z-[100] mt-1 right-0 w-40 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg shadow-lg focus:outline-none max-h-60 overflow-auto">
                        {roleOptions.map((option) => (
                          <ListboxOption
                            key={option.id}
                            value={option.id}
                            className={({ active }) =>
                              `cursor-pointer select-none relative py-2 pl-10 pr-4 transition-colors ${
                                active
                                  ? "bg-light-bg-hover dark:bg-dark-bg-hover"
                                  : "hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={`block truncate text-light-text-primary dark:text-dark-text-primary capitalize ${
                                    selected ? "font-semibold" : "font-normal"
                                  }`}
                                >
                                  {option.name}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <FiCheck
                                      className="w-4 h-4 text-accent-primary"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </div>
                  </Listbox>
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
              htmlFor={`${uid}-member-email`}
              className="mb-1 block text-sm font-medium text-light-text-primary dark:text-dark-text-primary"
            >
              Email
            </label>
            <input
              id={`${uid}-member-email`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@example.com"
              className="input-field"
              required
            />
          </div>
          <div>
            <label
              htmlFor={`${uid}-member-role`}
              className="mb-1 block text-sm font-medium text-light-text-primary dark:text-dark-text-primary"
            >
              Role
            </label>
            <Listbox value={role} onChange={setRole}>
              <div className="relative">
                <ListboxButton
                  id={`${uid}-member-role`}
                  className="input-field w-full text-left flex items-center justify-between"
                >
                  <span className="truncate">{selectedRoleObject?.name}</span>
                  <FiChevronDown className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
                </ListboxButton>
                <ListboxOptions className="absolute z-[100] mt-1 w-full bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-lg shadow-lg focus:outline-none max-h-60 overflow-auto">
                  {roleOptions
                    .filter((r) => r.id !== "owner")
                    .map((option) => (
                      <ListboxOption
                        key={option.id}
                        value={option.id}
                        className={({ active }) =>
                          `cursor-pointer select-none relative py-2 pl-10 pr-4 transition-colors ${
                            active
                              ? "bg-light-bg-hover dark:bg-dark-bg-hover"
                              : "hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate text-light-text-primary dark:text-dark-text-primary ${
                                selected ? "font-semibold" : "font-normal"
                              }`}
                            >
                              {option.name}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <FiCheck
                                  className="w-5 h-5 text-accent-primary"
                                  aria-hidden="true"
                                />
                              </span>
                            ) : null}
                          </>
                        )}
                      </ListboxOption>
                    ))}
                </ListboxOptions>
              </div>
            </Listbox>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ProjectAdminMembers
