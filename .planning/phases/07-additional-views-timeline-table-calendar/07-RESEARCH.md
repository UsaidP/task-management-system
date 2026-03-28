# Phase 7 Research: Additional Views — Timeline, Table, Calendar

**Date:** 2026-03-28
**Phase:** 07 — Additional Views — Timeline, Table, Calendar
**Goal:** Build remaining three views to complete the 6-view workspace

## 1. Existing Code Audit

### TimelineView.jsx (292 lines)
- **Bugs:** Zoom buttons set state but `getDatesForZoom()` always returns month dates — day/week zoom does nothing
- **Hardcoded colors:** `bg-slate-400`, `bg-blue-500`, `bg-amber-500`, `bg-emerald-500`, `border-l-blue-500`, etc.
- **Debug styles:** `style={{ boxShadow: "0px 0px 1px 0.1px #000000" }}` on line 120
- **Missing features:** No sprint grouping, no sidebar filter integration
- **Good patterns to keep:** Today-line indicator, task bar positioning logic, `getTaskPosition()` function

### TableView.jsx (366 lines)
- **No @tanstack/react-table** — uses manual sort/filter
- **Only sorts:** title, dueDate (status/priority sort icons shown but not wired — lines 240-249)
- **Missing columns:** Sprint column absent
- **Missing filters:** No sprint filter
- **Title says "List View"** — should say "Table"
- **Hardcoded colors:** Same `bg-slate-100`, `bg-blue-100`, etc. in status/priority badges
- **Debug styles:** Same `boxShadow` on line 163

### CalenderView.jsx (475 lines)
- **Filename misspelled:** `CalenderView.jsx` → needs rename to `CalendarView.jsx`
- **Week view bug:** Uses `task.projectId` (line 289) instead of `task.project` object
- **Hover tooltip bug:** Fixed center positioning (`top: "50%", left: "50%"`) on line 398 — doesn't follow cursor
- **No sprint filter**
- **Good patterns to keep:** Month/week toggle, priority-tinted task chips, overflow "+N more"

### Sidebar.jsx (401 lines)
- **Project links navigate to `/board?project=${id}`** — not a filter state
- **Sprint selector is hardcoded mockup:** "Sprint 4: Q3 Goals" (line 313)
- **SidebarContext only has:** `isSidebarOpen`, `toggleSidebar`, `isCollapsed`, `toggleCollapse`
- **No filter state** for project/sprint

### App.jsx
- **Routes already registered:** `/timeline`, `/table`, `/calendar`
- **Import uses misspelled filename:** `import CalendarView from "./components/date/CalenderView.jsx"` (line 24)

## 2. Technical Decisions

### Shared Filter State
**Decision: React Context** (not URL params)
- Rationale: Sidebar filters need to work across all views without URL changes. Board already uses `?project=` query param but that's view-specific. A shared `FilterContext` is cleaner.
- Pattern: Create `FilterContext.jsx` alongside `SidebarContext.jsx` with `{ selectedProject, selectedSprint, setSelectedProject, setSelectedSprint }`

### @tanstack/react-table for Table View
**Decision: Install and use @tanstack/react-table v8**
- Rationale: STATE.md already records this decision. Headless, unstyled, works with Tailwind. Supports sorting, filtering, column visibility.
- Columns: Title, Status, Priority, Assignee, Project, Sprint, Due Date

### Timeline Zoom Implementation
**Decision: Different date ranges per zoom level**
- Day: Show 14 days, each day gets a column
- Week: Show 12 weeks, each week gets a column
- Month: Show current month (existing behavior)
- The `getDatesForZoom()` function needs to return different date arrays based on `zoom` state

### Calendar Filename Fix
**Decision: Rename CalenderView.jsx → CalendarView.jsx**
- Update import in App.jsx
- Delete old file after rename

### Design Token Migration
**Decision: Replace ALL hardcoded Tailwind colors with design tokens**
- Status: `bg-task-status-todo`, `bg-task-status-progress`, `bg-task-status-review`, `bg-task-status-done`
- Priority: `text-task-priority-urgent`, `text-task-priority-high`, `text-task-priority-medium`, `text-task-priority-low`
- Remove ALL `slate-*`, `blue-*`, `amber-*`, `emerald-*`, `red-*` hardcoded colors
- Remove debug `boxShadow` inline styles from all three views

## 3. Integration Points

### TaskDetailPanel Integration
All three views already use `setSelectedTask(task)` → `<TaskDetailPanel>` pattern. Keep this. Pattern from existing code:
```jsx
const [selectedTask, setSelectedTask] = null
// On click: setSelectedTask(task)
// Render: <TaskDetailPanel isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} task={selectedTask} ... />
```

### Sidebar Filter Integration
1. Create `FilterContext` with `{ projectFilter, sprintFilter, setProjectFilter, setSprintFilter }`
2. Update Sidebar project list: clicking a project sets filter (not navigates)
3. Update Sidebar sprint selector: fetch real sprints, set filter on select
4. All three new views consume filter context to filter displayed tasks

### API Calls
- `apiService.getAllTaskOfUser()` — all views use this (from `frontend/service/apiService.js`)
- `apiService.getAllProjects()` — for project filter dropdown
- `apiService.getSprintsByProject(projectId)` — for sprint filter dropdown

## 4. File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/components/date/TimelineView.jsx` | **Rewrite** | Fix zoom, design tokens, sprint grouping |
| `frontend/src/components/table/TableView.jsx` | **Rewrite** | @tanstack/react-table, all columns/filters |
| `frontend/src/components/date/CalenderView.jsx` | **Rename + Rewrite** | Fix filename, bugs, design tokens |
| `frontend/src/components/date/CalendarView.jsx` | **New** | Replaces misspelled file |
| `frontend/src/components/context/FilterContext.jsx` | **New** | Shared project/sprint filter state |
| `frontend/src/components/layout/Sidebar.jsx` | **Modify** | Wire project/sprint to filter context |
| `frontend/src/App.jsx` | **Modify** | Fix Calendar import, wrap with FilterProvider |
| `frontend/package.json` | **Modify** | Add @tanstack/react-table dependency |

## 5. Risks

| Risk | Mitigation |
|------|------------|
| @tanstack/react-table API complexity | Follow v8 column helper pattern, reference docs |
| Sidebar filter breaking board view's `?project=` param | Board can read from FilterContext AND URL param |
| Calendar rename breaking imports | Update App.jsx import in same commit |

---

*Research completed: 2026-03-28*
