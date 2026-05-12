import { CheckIcon, ChevronDownIcon, UserPlusIcon, XIcon } from "@animateicons/react/lucide"
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react"
import { useId, useState } from "react"
import toast from "react-hot-toast"
import apiService from "../../../../service/apiService.js"
import Avatar from "../../auth/Avatar.jsx"
import Modal from "../../Modal.jsx"

const MemberAvatar = ({ member }) => {
  const u = member?.user
  const user = typeof u === "object" ? u : null
  const name = user ? [user.fullname, user.username, user.email].find(Boolean) : "Member"

  return <Avatar src={user?.avatar?.url || user?.avatar} alt={name} size="md" />
}

const roleColors = {
  owner:
    "bg-accent-primary/10 text-accent-primary dark:bg-accent-primary/20 dark:text-accent-primary-light",
  project_admin:
    "bg-accent-warning/10 text-accent-warning dark:bg-accent-warning/20 dark:text-accent-warning-light",
  member:
    "bg-light-bg-tertiary text-light-text-secondary dark:bg-dark-bg-tertiary dark:text-dark-text-secondary",
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
          <h2 className="text-lg font-semibold text-text-primary">
            Project Members ({members.length})
          </h2>
          <p className="text-sm text-text-secondary">Manage who has access to this project</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer flex items-center gap-2"
        >
          <UserPlusIcon className="h-4 w-4" />
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
          className="w-full px-4 py-3 bg-bg-surface text-text-primary border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
      </div>

      {/* Members List */}
      <div className="space-y-2">
        {filteredMembers.length === 0 ? (
          <div className="rounded-xl border border-border bg-bg-surface p-8 text-center">
            <p className="text-text-secondary">No members found</p>
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
                className="flex items-center justify-between rounded-xl border border-border bg-bg-surface p-4 transition-colors hover:bg-bg-hover"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <MemberAvatar member={member} />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-text-primary">{userName}</p>
                    <p className="truncate text-sm text-text-secondary">{userEmail}</p>
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
                        <ChevronDownIcon className="w-3 h-3" />
                      </ListboxButton>
                      <ListboxOptions className="absolute z-[100] mt-1 right-0 w-40 bg-bg-surface border border-border rounded-lg shadow-lg focus:outline-none max-h-60 overflow-auto">
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
                                  className={`block truncate text-text-primary capitalize ${selected ? "font-semibold" : "font-normal"}`}
                                >
                                  {option.name}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <CheckIcon
                                      className="w-4 h-4 text-primary"
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
                      className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-accent-danger/10 hover:text-accent-danger"
                      aria-label={`Remove ${userName}`}
                    >
                      <XIcon className="h-4 w-4" />
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
              className="mb-1 block text-sm font-medium text-text-primary"
            >
              Email
            </label>
            <input
              id={`${uid}-member-email`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@example.com"
              className="w-full px-4 py-3 bg-bg-surface text-text-primary border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              required
            />
          </div>
          <div>
            <label
              htmlFor={`${uid}-member-role`}
              className="mb-1 block text-sm font-medium text-text-primary"
            >
              Role
            </label>
            <Listbox value={role} onChange={setRole}>
              <div className="relative">
                <ListboxButton
                  id={`${uid}-member-role`}
                  className="w-full px-4 py-3 bg-bg-surface text-text-primary border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all w-full text-left flex items-center justify-between"
                >
                  <span className="truncate">{selectedRoleObject?.name}</span>
                  <ChevronDownIcon className="w-4 h-4 text-text-secondary" />
                </ListboxButton>
                <ListboxOptions className="absolute z-[100] mt-1 w-full bg-bg-surface border border-border rounded-lg shadow-lg focus:outline-none max-h-60 overflow-auto">
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
                              className={`block truncate text-text-primary ${selected ? "font-semibold" : "font-normal"}`}
                            >
                              {option.name}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <CheckIcon className="w-5 h-5 text-primary" aria-hidden="true" />
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
              className="bg-bg-surface hover:bg-bg-hover text-text-primary border border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
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
