export const UserRoleEnum = {
	ADMIN: "admin",
	PROJECT_ADMIN: "project_admin",
	MEMBER: "member",
};
export const ROLE_HIERARCHY = {
	[UserRoleEnum.ADMIN]: 3,
	[UserRoleEnum.PROJECT_ADMIN]: 2,
	[UserRoleEnum.MEMBER]: 1,
};
export const AvailableUserRole = Object.values(UserRoleEnum);

export const TaskStatusEnum = {
	TODO: "todo",
	IN_PROGRESS: "in-progress",
	DONE: "done",
};
export const AvailableTaskStatus = Object.values(TaskStatusEnum);
