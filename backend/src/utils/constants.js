export const UserRoleEnum = {
	ADMIN: "admin",
	MEMBER: "member",
	PROJECT_ADMIN: "project_admin",
}
export const ROLE_HIERARCHY = {
	[UserRoleEnum.ADMIN]: 3,
	[UserRoleEnum.PROJECT_ADMIN]: 2,
	[UserRoleEnum.MEMBER]: 1,
}
export const AvailableUserRole = Object.values(UserRoleEnum)

export const TaskStatusEnum = {
	DONE: "done",
	IN_PROGRESS: "in-progress",
	TODO: "todo",
}
export const AvailableTaskStatus = Object.values(TaskStatusEnum)
