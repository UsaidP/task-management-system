import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import apiService from "../../../service/apiService"

const ITEMS_PER_PAGE = 10

export default function AdminTeamPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiService.getAdminAllUsers()
        setUsers(res.data || [])
      } catch (err) {
        console.error("Failed to fetch users:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered = useMemo(() => {
    let result = [...users]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (u) =>
          u.fullname.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.username?.toLowerCase().includes(q)
      )
    }

    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter)
    }

    return result
  }, [users, search, roleFilter])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const toggleRole = async (userId, currentRole) => {
    setActionLoading(userId)
    try {
      const newRole = currentRole === "admin" ? "member" : "admin"
      const res = await apiService.updateUserRole(userId, newRole)
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, ...res.data } : u)))
    } catch (err) {
      console.error("Failed to update user role:", err)
    } finally {
      setActionLoading(null)
    }
  }

  const avatarColors = [
    "bg-accent-primary",
    "bg-accent-info",
    "bg-accent-success",
    "bg-accent-warning",
    "bg-accent-purple",
    "bg-accent-danger",
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse h-10 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg w-48" />
        <div className="animate-pulse h-14 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-xl" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="animate-pulse h-20 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-xl"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary font-serif">
            Team Management
          </h1>
          <p className="text-sm text-light-text-tertiary mt-1">
            {filtered.length} member{filtered.length !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary/10 text-accent-primary">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="text-sm text-light-text-tertiary">Total Members</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary font-serif">
                {users.length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-success/10 text-accent-success">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm text-light-text-tertiary">Admins</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary font-serif">
                {users.filter((u) => u.role === "admin").length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-warning/10 text-accent-warning">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-sm text-light-text-tertiary">Verified</p>
              <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary font-serif">
                {users.filter((u) => u.isEmailVerified).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-tertiary"
            />
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary py-2 pl-10 pr-4 text-sm text-light-text-primary dark:text-dark-text-primary placeholder:text-light-text-tertiary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/20"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setPage(1)
            }}
            className="rounded-lg border border-light-border dark:border-dark-border bg-light-bg-primary dark:bg-dark-bg-primary px-3 py-2 text-sm text-light-text-primary dark:text-dark-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/20"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-light-border dark:border-dark-border bg-light-bg-secondary dark:bg-dark-bg-secondary shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-light-border dark:border-dark-border bg-light-bg-tertiary/50 dark:bg-dark-bg-tertiary/50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-light-text-tertiary">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-light-text-tertiary">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-light-text-tertiary">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-light-text-tertiary">
                  Tasks
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-light-text-tertiary">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-light-text-tertiary">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-light-text-tertiary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {paginated.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-sm text-light-text-tertiary"
                  >
                    No members found
                  </td>
                </tr>
              )}
              {paginated.map((user, index) => {
                const initials = (user.fullname || "U")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
                const progress =
                  user.totalTasks > 0
                    ? Math.round((user.completedTasks / user.totalTasks) * 100)
                    : 0
                const colorClass = avatarColors[index % avatarColors.length]

                return (
                  <tr
                    key={user._id}
                    className="group hover:bg-light-bg-hover/50 dark:hover:bg-dark-bg-hover/50"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-light-text-inverse flex-shrink-0 ${colorClass}`}
                        >
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                            {user.fullname}
                          </p>
                          <p className="text-xs text-light-text-tertiary">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-accent-primary/10 text-accent-primary"
                            : "bg-light-bg-tertiary text-light-text-tertiary"
                        }`}
                      >
                        {user.role === "admin" && <Shield size={12} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.isEmailVerified
                            ? "bg-accent-success/10 text-accent-success"
                            : "bg-accent-warning/10 text-accent-warning"
                        }`}
                      >
                        {user.isEmailVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {user.totalTasks || 0}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary">
                          <div
                            className="h-full rounded-full bg-accent-primary"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-light-text-tertiary">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm text-light-text-tertiary">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => toggleRole(user._id, user.role)}
                          disabled={actionLoading === user._id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-light-text-tertiary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover hover:text-accent-primary disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                          title={user.role === "admin" ? "Remove admin" : "Make admin"}
                        >
                          {user.role === "admin" ? <UserX size={16} /> : <ShieldCheck size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-light-border dark:border-dark-border px-6 py-3">
            <p className="text-sm text-light-text-tertiary">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-light-border dark:border-dark-border text-light-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p, idx, arr) => idx === 0 || idx === arr.length - 1 || Math.abs(p - page) <= 1
                )
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1
                  return (
                    <span key={p} className="flex items-center">
                      {showEllipsis && <span className="px-1 text-light-text-tertiary">…</span>}
                      <button
                        type="button"
                        onClick={() => setPage(p)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium cursor-pointer ${
                          p === page
                            ? "bg-accent-primary text-light-text-inverse"
                            : "text-light-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover"
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  )
                })}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-light-border dark:border-dark-border text-light-text-secondary hover:bg-light-bg-hover dark:hover:bg-dark-bg-hover disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
