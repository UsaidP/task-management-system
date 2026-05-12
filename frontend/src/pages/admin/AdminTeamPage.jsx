import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MailIcon as Mail,
  SearchIcon as Search,
  ShieldCheckIcon,
  UserCheckIcon,
  UserXIcon,
} from "@animateicons/react/lucide"
import { motion, useReducedMotion } from "framer-motion"
import { ShieldIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import apiService from "../../../service/apiService"
import Avatar from "../../components/auth/Avatar"

const ITEMS_PER_PAGE = 10

export default function AdminTeamPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [actionLoading, setActionLoading] = useState(null)
  const reduceMotion = useReducedMotion()

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
        (u) => u.fullname.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      )
    }

    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter)
    }

    return result
  }, [users, search, roleFilter])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleRoleToggle = async (userId, currentRole) => {
    try {
      setActionLoading(userId)
      const newRole = currentRole === "admin" ? "member" : "admin"
      const res = await apiService.updateUserRole(userId, newRole)
      if (res.success) {
        setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)))
      }
    } catch (err) {
      console.error("Failed to update role:", err)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="w-48 h-10 rounded-xl animate-pulse bg-bg-elevated" />
        <div className="h-14 rounded-2xl animate-pulse bg-bg-elevated" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-xl animate-pulse bg-bg-elevated" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-text-primary">
            Team Members
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {filtered.length} member{filtered.length !== 1 ? "s" : ""} across the platform
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2.5 border rounded-xl border-border bg-bg-surface">
            <UserCheckIcon size={16} className="text-success" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
                Admins
              </p>
              <p className="font-serif text-lg font-bold text-text-primary">
                {users.filter((u) => u.role === "admin").length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="p-4 border shadow-sm rounded-2xl border-border bg-bg-surface"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute text-sm -translate-y-1/2 left-3 top-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-xl border border-border bg-bg-canvas py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-light-text-tertiary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-border bg-bg-canvas px-3 py-2.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
        </div>
      </motion.div>

      {/* User List */}
      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden border shadow-sm rounded-2xl border-border bg-bg-surface"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-light-border/60 dark:border-dark-border/60 bg-light-bg-tertiary/30 dark:bg-dark-bg-tertiary/30">
                {["User", "Email", "Role", "Joined", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border/40 dark:divide-dark-border/40">
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-sm text-center text-text-muted">
                    No users found
                  </td>
                </tr>
              )}
              {paginated.map((user) => {
                const _initials = (user.fullname || "U")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)

                return (
                  <tr
                    key={user._id}
                    className="transition-colors duration-150 group hover:bg-light-bg-hover/30 dark:hover:bg-dark-bg-hover/30"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.avatar?.url || user.avatar}
                          alt={user.fullname || "User"}
                          size="md"
                        />
                        <span className="text-sm font-medium text-text-primary">
                          {user.fullname}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                        <Mail size={14} className="text-text-muted" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${user.role === "admin" ? "bg-accent-primary/10 text-accent-primary" : "bg-light-bg-tertiary text-text-muted dark:text-dark-text-tertiary"}`}
                      >
                        {user.role === "admin" && <ShieldIcon size={10} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm text-text-muted">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleRoleToggle(user._id, user.role)}
                        disabled={actionLoading === user._id}
                        className="flex items-center justify-center w-8 h-8 text-sm transition-all duration-150 border rounded-lg cursor-pointer border-border text-text-muted hover:bg-bg-hover hover:text-accent-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        title={user.role === "admin" ? "Remove admin" : "Make admin"}
                      >
                        {actionLoading === user._id ? (
                          <div className="w-4 h-4 border-2 rounded-full animate-spin border-accent-primary/30 border-t-accent-primary" />
                        ) : user.role === "admin" ? (
                          <UserXIcon size={16} />
                        ) : (
                          <ShieldCheckIcon size={16} />
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-light-border/60 dark:border-dark-border/60">
            <p className="text-sm text-text-muted">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center justify-center w-8 h-8 text-sm transition-all duration-150 border rounded-lg cursor-pointer border-border text-text-secondary hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
              >
                <ChevronLeftIcon size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1
                  return (
                    <span key={p} className="flex items-center">
                      {showEllipsis && <span className="px-1 text-text-muted">…</span>}
                      <button
                        type="button"
                        onClick={() => setPage(p)}
                        className={`flex items-center justify-center w-8 h-8 text-sm font-medium rounded-lg cursor-pointer transition-all duration-150 ${p === page ? "bg-accent-primary text-white shadow-sm shadow-accent-primary/20" : "text-light-text-secondary hover:bg-bg-hover dark:hover:bg-dark-bg-hover"}`}
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
                className="flex items-center justify-center w-8 h-8 text-sm transition-all duration-150 border rounded-lg cursor-pointer border-border text-text-secondary hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
              >
                <ChevronRightIcon size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
