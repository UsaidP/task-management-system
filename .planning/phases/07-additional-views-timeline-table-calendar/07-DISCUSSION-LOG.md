# Phase 7: Additional Views — Timeline, Table, Calendar - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 7-Additional Views — Timeline, Table, Calendar
**Areas discussed:** Approach, Table Library, Timeline Zoom, Sidebar Filters

---

## Approach: Retrofit vs Rebuild

| Option | Description | Selected |
|--------|-------------|----------|
| Refactor in place | Fix colors, patch bugs, add missing features to existing ~1,300 lines | |
| Rebuild from scratch | Rewrite all three views with proper patterns, design tokens, and features | ✓ |

**User's choice:** Rebuild from scratch
**Notes:** Existing code has hardcoded colors, broken zoom, debug styles, missing features. Use as API reference only.

---

## Table Library

| Option | Description | Selected |
|--------|-------------|----------|
| Keep custom sort/filter | Current TableView uses manual sort/filter — works but limited | |
| Install @tanstack/react-table | Headless table library — matches prior research decision in STATE.md | ✓ |

**User's choice:** Install & use @tanstack/react-table
**Notes:** Aligns with prior research decision. Provides sorting, filtering, column management out of the box.

---

## Timeline Zoom

| Option | Description | Selected |
|--------|-------------|----------|
| Month only | Simplify to single granularity — month view only | |
| Full day/week/month | Implement all three zoom levels with actual grid rendering changes | ✓ |

**User's choice:** Implement full zoom (day/week/month)
**Notes:** Buttons already exist in current UI but don't function. Need real rendering differences per granularity.

---

## Sidebar Filter Integration

| Option | Description | Selected |
|--------|-------------|----------|
| Views have own filters | Each view manages its own filter state independently | |
| Integrate sidebar filters | All views respect sidebar project/sprint selectors | ✓ |

**User's choice:** Integrate sidebar filters
**Notes:** Sidebar currently has no filter state — project list navigates to project page, sprint selector is hardcoded mockup. Need shared filter context or URL-based state.

---

## Agent's Discretion

- Filter state mechanism (URL params vs React context) — agent decides
- Timeline visual rendering details — agent decides
- Table row density and pagination — agent decides
- Calendar overflow handling — agent decides

## Deferred Ideas

- Drag to resize task bars on timeline (v2)
- Task dependency arrows on timeline (v2)
- Custom columns in table view (v2)
- Virtual scrolling for large task sets
