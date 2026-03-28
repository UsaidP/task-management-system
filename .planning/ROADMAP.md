# Roadmap: Taskly

**Created:** 2026-03-28
**Granularity:** Standard (5-8 phases)
**Total Requirements:** 57

## Milestone 1: Design + UX Overhaul

### Phase 1: Design System Foundation
**Goal:** Establish warm, human design language — color tokens, typography, base components
**Requirements:** DS-01, DS-02, DS-03, DS-04, DS-05, DS-06
**UI hint**: yes

**Success Criteria:**
1. TailwindCSS config rebuilt with warm earth-tone palette (Linen, Terracotta, Sage, Ochre)
2. Lora + DM Sans fonts loaded and applied throughout
3. Base component styles created (buttons, cards, inputs, badges, modals) in both light and dark mode
4. Responsive breakpoints verified at 375px, 768px, 1024px, 1440px
5. Dark mode uses warm dark tones, not pure black

---

### Phase 2: App Shell & Navigation
**Goal:** Build the unified workspace layout — sidebar, routing, app structure
**Requirements:** NAV-01, NAV-02, NAV-03, NAV-04, NAV-05
**UI hint**: yes

**Success Criteria:**
1. Collapsible sidebar with all navigation links renders correctly
2. Project filter in sidebar lists user's projects and filters views
3. Sprint selector in sidebar shows available sprints
4. Sidebar collapses to icon-only mode and restores
5. New routing structure works (/overview, /my-tasks, /board, /timeline, /table, /calendar, /settings, /profile)

---

### Phase 3: Auth Pages Redesign
**Goal:** Redesign all authentication pages with warm aesthetic
**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**UI hint**: yes

**Success Criteria:**
1. Login page fully redesigned with serif headings and warm palette
2. Signup page fully redesigned with matching aesthetic
3. Forgot password page redesigned
4. Reset password page redesigned
5. Email confirmation page redesigned
6. All auth pages responsive and functional with existing backend API

---

### Phase 4: Core Views — Overview, My Tasks, Board
**Goal:** Build the three most-used workspace views
**Requirements:** OV-01, OV-02, OV-03, OV-04, OV-05, MT-01, MT-02, MT-03, MT-04, BRD-01, BRD-02, BRD-03, BRD-04, BRD-05
**UI hint**: yes

**Success Criteria:**
1. Overview dashboard shows task counts by status, upcoming dues, and recent activity
2. My Tasks view lists all assigned tasks with filter/sort by status, priority, project
3. Board view shows Kanban columns with drag-and-drop between statuses
4. Board supports inline quick-create (title only at column bottom)
5. All three views use unified task data and apply project/sprint filters from sidebar

---

### Phase 5: Task Detail Panel
**Goal:** Build the side panel for task interactions — replaces modal pattern
**Requirements:** TDP-01, TDP-02, TDP-03, TDP-04, TDP-05, TDP-06, TDP-07, TDP-08, TDP-09
**UI hint**: yes

**Success Criteria:**
1. Clicking any task in any view opens a side panel from the right
2. Panel shows all task fields with inline editing capability
3. Subtask checklist works (add, complete, delete)
4. Comments section works (add, delete)
5. Attachments section works (upload, download)
6. Assignee management works (add, remove with avatar display)
7. Panel closes cleanly, returning to the current view without state loss

---

### Phase 6: Sprint Management (Backend + Frontend)
**Goal:** Add Jira-style sprint management — backlog, planning, active sprint, completion, reports
**Requirements:** SPR-01, SPR-02, SPR-03, SPR-04, SPR-05, SPR-06, SPR-07, SPR-08

**Success Criteria:**
1. Sprint model and API endpoints created (create, list, start, complete, report)
2. Task model updated with sprint field
3. Backlog view shows tasks not assigned to any sprint
4. User can create sprint with name, goal, dates
5. User can drag tasks from backlog into sprint
6. Starting a sprint sets it as active (one active per project)
7. Sprint completion dialog shows incomplete tasks with move-to-next/backlog options
8. Sprint velocity report shows tasks completed per sprint as a simple chart

---

### Phase 7: Additional Views — Timeline, Table, Calendar
**Goal:** Build remaining three views to complete the 6-view workspace
**Requirements:** TL-01, TL-02, TL-03, TL-04, TL-05, TB-01, TB-02, TB-03, TB-04, TB-05, CAL-01, CAL-02, CAL-03, CAL-04
**UI hint**: yes

**Success Criteria:**
1. Timeline shows tasks as horizontal bars positioned by date with day/week/month zoom
2. Timeline groups tasks by project or sprint
3. Table view shows sortable, filterable spreadsheet with all task columns
4. Table built with @tanstack/react-table
5. Calendar shows tasks on month grid by due date with navigation
6. All three views open task detail panel on click

---

### Phase 8: Settings, Profile & Polish
**Goal:** Redesign remaining pages and polish the entire experience
**Requirements:** SET-01, SET-02, SET-03
**UI hint**: yes

**Success Criteria:**
1. Settings page fully redesigned with warm aesthetic
2. Profile page fully redesigned with avatar upload
3. Loading skeletons for all views
4. Smooth transitions between views
5. Error states and empty states for all views
6. Final responsive audit at all 4 breakpoints

---

## Phase Summary

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Design System Foundation | Warm color tokens, typography, base components | DS-01–06 | 5 |
| 2 | App Shell & Navigation | Sidebar, routing, unified workspace layout | NAV-01–05 | 5 |
| 3 | Auth Pages Redesign | All auth pages with warm aesthetic | AUTH-01–05 | 6 |
| 4 | Core Views | Overview, My Tasks, Board (Kanban) | OV-01–05, MT-01–04, BRD-01–05 | 5 |
| 5 | Task Detail Panel | Side panel replaces modals for task interaction | TDP-01–09 | 7 |
| 6 | Sprint Management | Backend + frontend for Jira-style sprints | Complete    | 2026-03-28 |
| 7 | Additional Views | Timeline, Table, Calendar | TL-01–05, TB-01–05, CAL-01–04 | 6 |
| 8 | Settings, Profile & Polish | Final pages + UX polish | SET-01–03 | 6 |

**Total: 8 phases | 57 requirements mapped | 0 unmapped ✓**

### Phase 9: Project Page Redesign

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 8
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 9 to break down)

---
*Roadmap created: 2026-03-28*
*Last updated: 2026-03-28 after initial creation*
