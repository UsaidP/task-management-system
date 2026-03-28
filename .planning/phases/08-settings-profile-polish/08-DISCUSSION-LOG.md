# Phase 8: Settings, Profile & Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 08-Settings, Profile & Polish
**Areas discussed:** Loading Skeletons

---

## Loading Skeletons

### Q1: Skeleton Detail Level

| Option | Description | Selected |
|--------|-------------|----------|
| View-specific skeletons | Board shows column skeletons, Table shows row skeletons, Calendar shows grid skeletons. Most polished, but more components to build. | ✓ |
| Section-level skeletons | Generic header + content area shapes per view. Good middle ground. | |
| Simple block shimmer | One or two rectangular shimmer blocks per view. Minimal effort. | |

**User's choice:** A — View-specific skeletons
**Notes:** Mirrors actual layout of each view

### Q2: Views Receiving Skeletons

| Option | Description | Selected |
|--------|-------------|----------|
| All 8 views | Overview, My Tasks, Board, Table, Timeline, Calendar, Settings, Profile. Full coverage. | ✓ |
| Core workspace views only | Overview, My Tasks, Board, Table, Timeline, Calendar. Skip Settings/Profile. | |
| Data-heavy views only | Board, Table, Timeline, Calendar, My Tasks. Skip Overview, Settings, Profile. | |

**User's choice:** A — All 8 views get dedicated skeletons

### Q3: Shimmer Animation Style

| Option | Description | Selected |
|--------|-------------|----------|
| Pulse | CSS opacity fade (`animate-pulse`). Simple, CSS-only, matches existing pattern. | ✓ |
| Gradient shimmer | Left-to-right light sweep. More polished (Linear/Notion style), needs CSS gradient animation. | |
| Your call | Agent picks based on warm aesthetic. | |

**User's choice:** A — Pulse animation

---

## Agent's Discretion

The following areas were not discussed and are left to agent discretion:
- Settings page visual redesign (structure and refinements)
- Profile page layout (visual refinements)
- View transitions (route transition approach)
- Error & empty states (per-view vs shared)
- Skeleton loading duration thresholds
- Responsive behavior refinements

## Deferred Ideas

None — discussion stayed within phase scope.
