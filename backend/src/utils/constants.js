// ============================================
// User Roles - Global Level (System-wide)
// ============================================
export const UserRoleEnum = {
  ADMIN: "admin", // Global platform admin - can do anything
  MEMBER: "member", // Regular user
}

// ============================================
// Project Roles - Per Project Level
// ============================================
export const ProjectRoleEnum = {
  MEMBER: "member", // Regular project member - limited permissions
  OWNER: "owner", // Project creator/owner - full control
  PROJECT_ADMIN: "project_admin", // Project manager - almost full control
}

// Available project roles for validation
export const AvailableProjectRole = Object.values(ProjectRoleEnum)

// Combined available roles for validation
export const AvailableUserRole = [...Object.values(UserRoleEnum), ...Object.values(ProjectRoleEnum)]

// ============================================
// Role Hierarchy (higher number = more permissions)
// ============================================
export const ROLE_HIERARCHY = {
  [UserRoleEnum.ADMIN]: 10, // Global admin - highest
  [ProjectRoleEnum.OWNER]: 5, // Project owner
  [ProjectRoleEnum.PROJECT_ADMIN]: 3, // Project admin
  [ProjectRoleEnum.MEMBER]: 1, // Member
  [UserRoleEnum.MEMBER]: 1, // Global member (lowest)
}

// Helper function to compare roles
export const hasHigherOrEqualRole = (userRole, requiredRole) => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0
  return userLevel >= requiredLevel
}

// ============================================
// Permission Matrix
// ============================================
export const PERMISSIONS = {
  MEMBER_ADD: "member:add",
  MEMBER_REMOVE: "member:remove",
  PROJECT_DELETE: "project:delete",
  PROJECT_EDIT: "project:edit",
  PROJECT_LEAVE: "project:leave",
  PROJECT_TRANSFER: "project:transfer",
  PROJECT_VIEW: "project:view",
  TASK_CREATE: "task:create",
  TASK_DELETE: "task:delete",
}

// ============================================
// Role to Permissions Mapping
// Matches your permission table exactly
// ============================================
export const ROLE_PERMISSIONS = {
  // Global Admin - Can do everything
  [UserRoleEnum.ADMIN]: Object.values(PERMISSIONS),

  // Project Owner - Full project control
  [ProjectRoleEnum.OWNER]: [
    PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.PROJECT_TRANSFER,
    PERMISSIONS.PROJECT_EDIT,
    PERMISSIONS.MEMBER_ADD,
    PERMISSIONS.MEMBER_REMOVE,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.PROJECT_VIEW,
  ],

  // Project Admin - Almost full control (can't delete/transfer project)
  [ProjectRoleEnum.PROJECT_ADMIN]: [
    PERMISSIONS.PROJECT_EDIT,
    PERMISSIONS.MEMBER_ADD,
    PERMISSIONS.MEMBER_REMOVE,
    PERMISSIONS.TASK_DELETE,
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.PROJECT_VIEW,
  ],

  // Member - Basic permissions only
  [ProjectRoleEnum.MEMBER]: [
    PERMISSIONS.TASK_CREATE,
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.PROJECT_LEAVE,
  ],
}

// ============================================
// Task Status
// ============================================
export const TaskStatusEnum = {
  DONE: "done",
  IN_PROGRESS: "in-progress",
  TODO: "todo",
  UNDER_REVIEW: "under review",
}

export const AvailableTaskStatus = Object.values(TaskStatusEnum)

// ============================================
// Priority
// ============================================
export const PriorityEnum = {
  HIGH: "high",
  LOW: "low",
  MEDIUM: "medium",
  URGENT: "urgent",
}

export const AvailablePriority = Object.values(PriorityEnum)
