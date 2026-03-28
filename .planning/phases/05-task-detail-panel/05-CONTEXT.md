# Phase 5: Task Detail Panel - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the side panel for task interactions — replaces modal pattern. Clicking any task in any view opens a side panel from the right. Panel shows all task fields with inline editing capability, subtask checklist, comments, attachments, assignee management, and closes cleanly without state loss.

</domain>

<decisions>
## Implementation Decisions

### Existing Implementation
- **Keep existing TaskDetailPanel.jsx pattern** — It already implements most requirements with framer-motion slide-in from right
- Use existing apiService for all CRUD operations

### Attachments (TDP-06)
- Use existing ImageKit integration for uploads (backend already supports it)
- Agent discretion on UI (thumbnails vs list view, upload button placement)

### Comments Delete (TDP-05)
- Allow users to delete their own comments only
- Agent discretion on UI (trash icon vs swipe-to-delete)

### Mobile Behavior
- Agent discretion on responsive handling
- Accept existing 500px max-width as-is for phase 1

### Panel State
- Agent discretion on scroll position/filters preservation

### Agent's Discretion
- Specific attachment UI (thumbnails vs list)
- Specific comment delete UI pattern
- Mobile breakpoint handling (at what width to change behavior)
- Animation timing/easing refinements

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Components
- `frontend/src/components/task/TaskDetailPanel.jsx` — Current implementation to extend
- `frontend/src/components/task/SubtaskView.jsx` — Subtask component
- `frontend/src/components/task/AddSubtask.jsx` — Add subtask input
- `frontend/src/service/apiService.js` — API calls for task updates
- `frontend/src/components/kanban/TaskCard.jsx` — Click handler that opens panel

### Design System (from Phase 1)
- `frontend/tailwind.config.js` — Color tokens, shadows, animations
- `frontend/src/index.css` — Component classes

### Backend (already integrated)
- ImageKit for attachments — `backend/src/utils/imagekit.js`

</canonical_refs>

<codebase_context>
## Existing Code Insights

### Reusable Assets
- TaskDetailPanel.jsx (359 lines) — Full panel with framer-motion animations
- SubtaskView.jsx — Handles subtask display/management
- HeadlessUI Listbox components — Used for status/priority dropdowns
- apiService.updateTask — Handles all field updates

### Established Patterns
- Inline editing with optimistic UI updates
- Toast notifications for success/error
- Framer-motion AnimatePresence for open/close
- Color tokens from Phase 1 used throughout

### Integration Points
- Panel opened from TaskCard.jsx, Board.jsx, MyTasks.jsx via inline onClick
- Uses existing task data structure from backend API
- Assignee dropdown populates from project members API

</codebase_context>

<specifics>
## Specific Ideas

No specific requirements — user chose to use existing standard patterns throughout. Agent has discretion to refine implementation details.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-task-detail-panel*
*Context gathered: 2026-03-28*