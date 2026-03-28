# Phase 7: Additional Views — Timeline, Table, Calendar - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Rebuild all three remaining workspace views (Timeline, Table, Calendar) from scratch to match the warm design system and integrate with sidebar project/sprint filters. All three views already exist with ~1,300 lines of code but have hardcoded colors, broken features, and missing filter integration. This phase delivers fully functional, design-system-compliant views that complete the 6-view workspace.

</domain>

<decisions>
## Implementation Decisions

### Approach
- **D-01:** Rebuild all three views from scratch — existing code has hardcoded colors, broken zoom, missing features, debug styles
- **D-02:** Use existing code as reference for API patterns (apiService calls, TaskDetailPanel integration) but not as starting point

### Table View
- **D-03:** Install and use `@tanstack/react-table` (headless table library) — matches prior research decision in STATE.md
- **D-04:** Columns: Title, Status, Priority, Assignee, Project, Sprint, Due Date (per TB-02 requirement)
- **D-05:** All columns sortable, all specified columns filterable (per TB-03, TB-04)

### Timeline View
- **D-06:** Implement full zoom with day/week/month granularity that actually changes the grid rendering (per TL-05)
- **D-07:** Support grouping by project OR sprint (per TL-03) — toggle in header
- **D-08:** Tasks positioned by startDate and dueDate — use existing task model fields (`startDate`, `dueDate`)
- **D-09:** For tasks without startDate, derive from dueDate minus 3 days (existing pattern worth keeping)

### Calendar View
- **D-10:** Fix filename: rename `CalenderView.jsx` → `CalendarView.jsx` and update import in App.jsx
- **D-11:** Month view primary, week view secondary (keep both, fix week view bugs)
- **D-12:** Task chips show title and priority color (per CAL-03)

### Sidebar Filter Integration
- **D-13:** All three views must respect sidebar project and sprint filters
- **D-14:** Sidebar needs filter state exposed — currently project list navigates to project page (not filter), sprint selector is hardcoded mockup
- **D-15:** Filter state should be shared context (or URL-based) so switching views preserves filter selection

### Design System Compliance
- **D-16:** Use Phase 1 design tokens exclusively — no hardcoded Tailwind colors (slate, blue, amber, emerald)
- **D-17:** Status colors from Phase 1: Todo `#8B8178`, In Progress `#C4654A`, In Review `#D4A548`, Done `#7A9A6D`
- **D-18:** Priority colors mapped to warm palette
- **D-19:** Remove debug inline styles (e.g., `boxShadow: "0px 0px 1px 0.1px #000000"`)

### Agent's Discretion
- Whether to use URL params or React context for shared filter state
- Timeline visual rendering details (grid lines, today indicator style, task bar hover effects)
- Table row density and pagination threshold
- Calendar overflow handling (>3 tasks per day cell)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `frontend/tailwind.config.js` — Warm earth-tone color tokens, shadows, animations (Phase 1)
- `frontend/src/index.css` — Global styles, component classes, dark mode overrides
- `.planning/phases/01-design-system-foundation/01-CONTEXT.md` — Color palette, typography, component conventions

### Existing View Code (reference only — being rebuilt)
- `frontend/src/components/date/TimelineView.jsx` — Current timeline (279 lines, has bugs)
- `frontend/src/components/table/TableView.jsx` — Current table (351 lines, no @tanstack/react-table)
- `frontend/src/components/date/CalenderView.jsx` — Current calendar (468 lines, filename misspelled)

### Task Detail Panel (reuse, don't rebuild)
- `frontend/src/components/task/TaskDetailPanel.jsx` — Side panel for task interactions (Phase 5)
- `.planning/phases/05-task-detail-panel/05-CONTEXT.md` — Panel integration patterns

### Data Layer
- `frontend/src/service/apiService.js` — API calls (`getAllTaskOfUser`, `getAllProjects`, `getSprintsByProject`)
- `backend/src/models/task.model.js` — Task schema: `startDate`, `dueDate`, `project`, `sprint`, `status`, `priority`
- `frontend/src/components/context/customHook.js` — `useAuth()` hook

### Sidebar (filter integration target)
- `frontend/src/components/layout/Sidebar.jsx` — Current sidebar (380 lines, project list + hardcoded sprint selector)
- `frontend/src/components/context/SidebarContext.jsx` — Sidebar open/collapse state only (no filter state yet)

### Sprint Data
- `frontend/src/components/sprint/SprintView.jsx` — Sprint view with `useSprint` hook pattern (reference for sprint data fetching)

### App Routing
- `frontend/src/App.jsx` — Routes for `/timeline`, `/table`, `/calendar` already registered

### Project References
- `.planning/ROADMAP.md` — Phase 7 definition and success criteria
- `.planning/REQUIREMENTS.md` — TL-01–05, TB-01–05, CAL-01–04 requirements

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `TaskDetailPanel.jsx` — All three views must open this panel on task click (pattern already exists in Board, MyTasks)
- `apiService.getAllTaskOfUser()` — Fetches all user tasks with project populated
- `apiService.getAllProjects()` — For project filter dropdown
- `apiService.getSprintsByProject(projectId)` — For sprint filter dropdown
- `dayjs` — Already installed, used throughout for date manipulation
- `framer-motion` — For animations (fade-in rows, slide transitions)
- `react-icons/fi` — FiIcon set used across all existing views

### Established Patterns
- Views fetch data with `useEffect` + `apiService` in component body
- Loading state: centered spinner with `animate-spin` + descriptive text
- Empty states: icon + heading + description text
- Task click → `setSelectedTask(task)` → `<TaskDetailPanel isOpen={!!selectedTask} .../>`
- Status badges: pill-shaped with background color + text
- Priority: text-only colored labels or left-border accent
- All views: `h-full flex flex-col` layout with sticky header

### Integration Points
- App.jsx already imports and routes TimelineView, TableView, CalendarView
- Sidebar has nav items for all three views (`/timeline`, `/table`, `/calendar`)
- Task model has `startDate`, `dueDate`, `project` (populated object), `sprint` (ID)
- Sidebar project list currently navigates to `/project/:projectId` — need filter behavior instead
- Sprint selector is hardcoded mockup — needs real sprint data and filter state

### Key Gaps in Existing Code
- Timeline: zoom buttons don't change grid, hardcoded colors, no sprint grouping
- Table: no @tanstack/react-table, only sorts title/dueDate, no sprint column/filter, title says "List View"
- Calendar: filename misspelled, week view has `task.projectId` (should be `task.project` object), hover tooltip uses broken fixed center positioning, no sprint filter
- All: ignore sidebar filters, use hardcoded status/priority colors instead of design tokens

</code_context>

<specifics>
## Specific Ideas

- Timeline today-line indicator (vertical line on current date) — keep from existing implementation
- Table should feel like Linear/Notion table — clean, minimal borders, row hover highlights
- Calendar task chips should use priority color as background tint (existing pattern in CalenderView is good, just needs design tokens)
- Week view in calendar: show time-aware layout or simple day columns — user's discretion
- Timeline task bars should show task title + due date when wide enough (existing pattern)

</specifics>

<deferred>
## Deferred Ideas

- **VIEW-V2-01:** Drag to resize task bars on timeline (v2 requirement)
- **VIEW-V2-02:** Task dependency arrows on timeline (v2 requirement)
- **VIEW-V2-03:** Custom columns in table view (v2 requirement)
- **Virtual scrolling** for table when task count exceeds ~200 — not needed for v1, revisit if performance issues arise

</deferred>

---

*Phase: 07-additional-views-timeline-table-calendar*
*Context gathered: 2026-03-28*
