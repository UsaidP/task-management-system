# Phase 8: Settings, Profile & Polish - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign the Settings and Profile pages with the warm earth-tone aesthetic, and polish the entire app experience — loading skeletons for all views, smooth transitions, error/empty states, and final responsive audit. This is the final phase that makes the whole app feel cohesive and production-ready.

</domain>

<decisions>
## Implementation Decisions

### Loading Skeletons (Discussed)
- **D-01:** View-specific skeletons — each view gets a skeleton that mirrors its actual layout (Board shows column skeletons, Table shows row skeletons, Calendar shows grid skeletons, etc.)
- **D-02:** All 8 views get dedicated skeletons: Overview, My Tasks, Board, Table, Timeline, Calendar, Settings, Profile
- **D-03:** CSS `animate-pulse` for shimmer animation (opacity fade, not gradient sweep). Simple, CSS-only, consistent with existing pattern
- **D-04:** Rebuild `Skeleton.jsx` as a base component library — replace hardcoded `bg-slate-100` with warm design tokens (`bg-light-bg-tertiary` / `dark:bg-dark-bg-tertiary`)

### Settings Page (Agent's Discretion)
- Keep existing 6-section structure: Appearance, Localization, Notifications, Preferences, Account, Danger Zone
- Visual redesign with warm tokens — card styles, spacing, typography to match the rest of the app
- Keep localStorage persistence (no backend settings API exists)
- Agent has discretion on visual refinements and any section restructuring

### Profile Page (Agent's Discretion)
- Keep existing card-based layout: avatar + stats + info grid + settings menu + danger zone
- Fix "TaskFlow v1.0.0" → "Taskly v1.0.0" (Me.jsx line 390)
- Remove debug inline `boxShadow` style (Me.jsx line 196)
- Visual refinements with warm design tokens
- Agent has discretion on layout improvements

### View Transitions (Agent's Discretion)
- Agent decides on route transition approach (fade, slide, or instant)
- Keep consistent with existing framer-motion patterns used across the app

### Error & Empty States (Agent's Discretion)
- Rebuild `ErrorStates.jsx` with warm design tokens (currently has no dark mode, basic styling)
- Agent decides whether to create per-view empty states or use a shared styled component
- Agent decides on empty state illustrations (icon-based is sufficient for v1)

### Agent's Discretion
- Skeleton loading duration thresholds (when to show vs skip for fast loads)
- Whether Settings/Profile skeletons need to be as detailed as workspace view skeletons
- Specific responsive behavior refinements
- Any additional polish items discovered during implementation

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `frontend/tailwind.config.js` — Warm earth-tone color tokens, shadows, animations (Phase 1)
- `frontend/src/index.css` — Global styles, component classes, dark mode overrides
- `.planning/phases/01-design-system-foundation/01-CONTEXT.md` — Color palette, typography, component conventions
- `design-system/taskly/MASTER.md` — Generated design system reference (if exists)

### Existing Components to Redesign/Polish
- `frontend/src/components/Settings.jsx` — Settings page (418 lines, 6 sections)
- `frontend/src/components/Settings.css` — Settings page CSS (unused classes, can be removed)
- `frontend/src/components/auth/Me.jsx` — Profile page (435 lines, has debug styles + old brand name)
- `frontend/src/components/auth/EditProfileModal.jsx` — Profile edit modal (253 lines)

### Existing Components to Rebuild
- `frontend/src/components/Skeleton.jsx` — Current skeleton uses hardcoded `bg-slate-100` (22 lines)
- `frontend/src/components/ErrorStates.jsx` — Generic error/empty states (43 lines, no dark mode)
- `frontend/src/components/ErrorFallback.jsx` — Error boundary fallback
- `frontend/src/components/ErrorBoundary.jsx` — React error boundary wrapper

### Workspace Views (need skeletons)
- `frontend/src/components/Overview.jsx` — Dashboard view
- `frontend/src/components/task/MyTasks.jsx` — Personal task list
- `frontend/src/components/Board.jsx` — Kanban board
- `frontend/src/components/table/TableView.jsx` — Spreadsheet table
- `frontend/src/components/date/TimelineView.jsx` — Gantt timeline
- `frontend/src/components/date/CalenderView.jsx` — Month calendar

### Data Layer
- `frontend/src/service/apiService.js` — API calls used by all views
- `frontend/src/components/context/customHook.js` — `useAuth()` hook
- `frontend/src/theme/ThemeContext.jsx` — Dark/light mode context

### Project References
- `.planning/ROADMAP.md` — Phase 8 definition and success criteria
- `.planning/REQUIREMENTS.md` — SET-01 through SET-03 requirements
- `.planning/PROJECT.md` — Design direction, constraints

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `framer-motion` — Used throughout for animations (fade-up, slide-in, stagger). Skeletons should use `motion.div` for appearance
- Tailwind `animate-pulse` — Built-in pulse animation, already available
- Warm color tokens — `bg-light-bg-tertiary`, `dark:bg-dark-bg-tertiary` for skeleton base color
- `react-icons/fi` — FiIcon set for empty state icons

### Established Patterns
- Views use `useEffect` + `apiService` with `loading` state boolean
- Loading: centered spinner with `animate-spin` + descriptive text (inconsistent across views)
- Empty states: `EmptyState` component from ErrorStates.jsx (icon + message)
- Task click → `setSelectedTask(task)` → `<TaskDetailPanel />` pattern (used in Board, MyTasks, Table, Calendar, Timeline)
- All views: `h-full flex flex-col` layout with sticky header

### Skeleton Color Issue
- Current `Skeleton.jsx` uses `bg-slate-100` — hardcoded old color, no dark mode support
- Must use warm tokens: `bg-light-bg-tertiary dark:bg-dark-bg-tertiary` or `bg-light-bg-hover dark:bg-dark-bg-hover`

### Integration Points
- Each view imports loading logic independently — skeletons replace the spinner section in each view's JSX
- `App.jsx` routes all views inside `<AppLayout />` — no route transition wrapper exists yet
- Sidebar navigation doesn't have loading indicators for route transitions

### Known Issues to Fix During Polish
- `Me.jsx:196` — Debug inline `boxShadow: "0px 0px 1px 0.1px #000000"` on container
- `Me.jsx:390` — Says "TaskFlow v1.0.0" instead of "Taskly v1.0.0"
- `Skeleton.jsx:3` — Uses `bg-slate-100` instead of warm tokens
- `ErrorStates.jsx` — No dark mode support, generic styling
- `Settings.css` — Contains unused CSS classes (component uses inline Tailwind)

</code_context>

<specifics>
## Specific Ideas

- Board skeleton: 3-4 column placeholders with 2-3 card-shaped blocks per column
- Table skeleton: header row + 8-10 thin row placeholders
- Calendar skeleton: 7-column grid with date placeholders and 1-2 task chip shapes per cell
- Timeline skeleton: horizontal date axis + 4-5 task bar placeholders at varying widths
- Overview skeleton: stat cards row + activity list placeholders
- My Tasks skeleton: filter bar + task row list
- Settings skeleton: section card placeholders matching the 6-section layout
- Profile skeleton: avatar circle + stat cards + info grid placeholders

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 08-settings-profile-polish*
*Context gathered: 2026-03-28*
