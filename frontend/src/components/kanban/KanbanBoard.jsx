import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import toast from "react-hot-toast";
import { FiFilter, FiPlus, FiSearch } from "react-icons/fi";
import apiService from "../../../service/apiService"; // Adjust path if needed
import Column from "./Column";
import ColumnHeader from "./ColumnHeader";
import TaskCard from "./TaskCard";

const KanbanBoard = ({
	columns,
	setColumns,
	projectId,
	members,
	openEditModal,
	openDeleteModal,
	onCreateTask,
}) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [filterPriority, setFilterPriority] = useState("all");
	const [filterAssignee, setFilterAssignee] = useState("all");
	const [showFilters, setShowFilters] = useState(false);

	const membersMap = useMemo(() => {
		if (!members) return {};
		return members.reduce((acc, member) => {
			if (member.user) {
				acc[member.user._id] = member.user;
			}
			return acc;
		}, {});
	}, [members]);

	const filteredColumns = useMemo(() => {
		return Object.entries(columns).reduce((acc, [status, column]) => {
			const filteredTasks = column.tasks.filter((task) => {
				if (!task) return false;
				const matchesSearch =
					searchTerm === "" ||
					task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					task.description?.toLowerCase().includes(searchTerm.toLowerCase());
				const matchesPriority =
					filterPriority === "all" ||
					task.priority?.toLowerCase() === filterPriority.toLowerCase();
				const matchesAssignee =
					filterAssignee === "all" || task.assignedTo?.includes(filterAssignee);
				return matchesSearch && matchesPriority && matchesAssignee;
			});

			acc[status] = { ...column, tasks: filteredTasks };
			return acc;
		}, {});
	}, [columns, searchTerm, filterPriority, filterAssignee]);

	const handleTaskDrop = useCallback(
		async (item, newStatus, destinationIndex) => {
			const { id: taskId, status: originalStatus } = item;

			if (originalStatus === newStatus) {
				// Reordering within the same column
				const newColumns = { ...columns };
				const column = newColumns[originalStatus];
				const newTasks = Array.from(column.tasks);
				const [removed] = newTasks.splice(item.index, 1);
				newTasks.splice(destinationIndex, 0, removed);
				newColumns[originalStatus] = { ...column, tasks: newTasks };
				setColumns(newColumns);
				// Here you might want to call an API to save the new order
				return;
			}

			// Moving to a different column
			const previousColumns = JSON.parse(JSON.stringify(columns));

			const newColumns = { ...columns };
			const sourceColumn = { ...newColumns[originalStatus] };
			const destColumn = { ...newColumns[newStatus] };
			const sourceTasks = [...sourceColumn.tasks];
			const destTasks = [...destColumn.tasks];

			const taskIndex = sourceTasks.findIndex((t) => t._id === taskId);
			if (taskIndex === -1) return;

			const [movedTask] = sourceTasks.splice(taskIndex, 1);
			movedTask.status = newStatus;

			destTasks.splice(destinationIndex, 0, movedTask);

			newColumns[originalStatus] = { ...sourceColumn, tasks: sourceTasks };
			newColumns[newStatus] = { ...destColumn, tasks: destTasks };

			setColumns(newColumns);

			try {
				await apiService.updateTask(projectId, taskId, { status: newStatus });
				toast.success("Task moved successfully!");
			} catch (error) {
				setColumns(previousColumns);
				toast.error("Failed to move task.");
			}
		},
		[columns, setColumns, projectId],
	);

	const clearFilters = () => {
		setSearchTerm("");
		setFilterPriority("all");
		setFilterAssignee("all");
	};

	const hasActiveFilters =
		searchTerm !== "" || filterPriority !== "all" || filterAssignee !== "all";

	return (
		<div className="flex h-full flex-col">
			<div className="flex-shrink-0 px-1 pb-4">
				<div className="glass rounded-xl p-4">
					<div className="flex items-center gap-3 mb-3">
						<div className="flex-1 relative">
							<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
							<input
								type="text"
								placeholder="Search tasks..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="input-field pl-10"
							/>
						</div>
						<button
							onClick={() => setShowFilters(!showFilters)}
							className={`btn-secondary ${
								showFilters || hasActiveFilters ? "bg-primary text-white" : ""
							}`}
						>
							<FiFilter className="w-4 h-4" />
							Filters
							{hasActiveFilters && !showFilters && (
								<span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
									Active
								</span>
							)}
						</button>
						{onCreateTask && (
							<button onClick={onCreateTask} className="btn-primary group">
								<FiPlus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
								New Task
							</button>
						)}
					</div>
					<AnimatePresence>
						{showFilters && (
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								className="overflow-hidden"
							>
								<div className="flex items-center gap-3 pt-3 border-t border-border">
									<div className="flex-1">
										<label className="input-label">Priority</label>
										<select
											value={filterPriority}
											onChange={(e) => setFilterPriority(e.target.value)}
											className="select-field"
										>
											<option value="all">All Priorities</option>
											<option value="low">Low</option>
											<option value="medium">Medium</option>
											<option value="high">High</option>
											<option value="urgent">Urgent</option>
										</select>
									</div>
									<div className="flex-1">
										<label className="input-label">Assignee</label>
										<select
											value={filterAssignee}
											onChange={(e) => setFilterAssignee(e.target.value)}
											className="select-field"
										>
											<option value="all">All Members</option>
											{members?.map((member) => (
												<option key={member._id} value={member._id}>
													{member.fullname || member.email}
												</option>
											))}
										</select>
									</div>
									{hasActiveFilters && (
										<div className="pt-5">
											<button
												onClick={clearFilters}
												className="btn-ghost text-sm text-error"
											>
												Clear All
											</button>
										</div>
									)}
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>

			{hasActiveFilters && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex flex-wrap gap-2 mt-3 px-1"
				>
					{searchTerm && (
						<span className="filter-pill">
							Search: "{searchTerm}"
							<button
								onClick={() => setSearchTerm("")}
								className="filter-pill-close"
							>
								×
							</button>
						</span>
					)}
					{filterPriority !== "all" && (
						<span className="filter-pill">
							Priority: {filterPriority}
							<button
								onClick={() => setFilterPriority("all")}
								className="filter-pill-close"
							>
								×
							</button>
						</span>
					)}
					{filterAssignee !== "all" && (
						<span className="filter-pill">
							Assignee:{" "}
							{
								// ✅ THIS IS THE FIX ✅
								members?.find((m) => m._id === filterAssignee)?.fullname ||
									"Unknown"
							}
							<button
								onClick={() => setFilterAssignee("all")}
								className="filter-pill-close"
							>
								×
							</button>
						</span>
					)}
				</motion.div>
			)}

			<DndProvider backend={HTML5Backend}>
				<div className="flex h-full flex-1 items-stretch gap-6 overflow-x-auto px-1 pb-6 pt-4">
					{Object.entries(columns).map(([status, column]) => {
						const tasksToRender = filteredColumns[status]?.tasks || [];
						const totalTasks = columns[status]?.tasks?.length || 0;
						return (
							<Column key={status} status={status} onDrop={handleTaskDrop}>
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.5,
										delay: Object.keys(columns).indexOf(status) * 0.08,
									}}
									className="xl:w-[300px] flex-shrink-0"
								>
									<div className="flex p-5 h-full flex-col rounded-xl glass">
										<ColumnHeader
											title={column.title}
											count={tasksToRender.length}
											totalCount={totalTasks}
											color={column.color}
											icon={column.icon}
											showFilterCount={
												hasActiveFilters && tasksToRender.length !== totalTasks
											}
										/>
										<div className="flex-grow space-y-3 overflow-y-auto p-1 -mr-2 pr-2">
											<AnimatePresence mode="popLayout">
												{tasksToRender.length > 0 ? (
													tasksToRender.map((task, index) => (
														<TaskCard
															key={task._id}
															task={task}
															index={index}
															onEdit={openEditModal}
															onDelete={openDeleteModal}
															membersMap={membersMap}
														/>
													))
												) : (
													<motion.div
														layout
														className="flex items-center justify-center text-sm text-text-muted text-center h-full p-10 border-2 border-dashed border-border rounded-lg"
													>
														{hasActiveFilters
															? "No tasks match your filters."
															: "Drag tasks here or create one."}
													</motion.div>
												)}
											</AnimatePresence>
										</div>
									</div>
								</motion.div>
							</Column>
						);
					})}
				</div>
			</DndProvider>
		</div>
	);
};

export default KanbanBoard;
