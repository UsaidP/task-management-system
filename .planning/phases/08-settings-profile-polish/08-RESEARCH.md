# Phase 8 Research: Settings, Profile & Polish

**Researched:** 2026-03-28
**Phase:** 08 — Settings, Profile & Polish
**Goal:** Redesign remaining pages and polish the entire experience

## 1. Loading Skeletons — Current State

### Existing Skeleton Infrastructure
- `Skeleton.jsx` (22 lines): Basic `<div>` with `bg-slate-100 animate-pulse rounded-md`. No dark mode. Only `Skeleton` and `HeaderSkeleton` exports.
- `Overview.jsx` has its own inline `HeaderSkeleton` using warm tokens (`bg-light-bg-hover dark:bg-dark-bg-hover`). This is the **correct pattern** to follow.
- `ProjectCardSkeleton` exists as a separate component.
- All views use `loading` state boolean + centered spinner pattern (inconsistent text across views).

### What Needs Building
8 view-specific skeleton components that mirror each view's layout:

| View | Skeleton Layout | Reference File |
|------|----------------|----------------|
| Overview | Stat cards row + activity list | `Overview.jsx:26-34` (existing HeaderSkeleton) |
| My Tasks | Filter bar + task row list | `MyTasks.jsx` |
| Board | 3-4 column placeholders with card blocks | `Board.jsx` |
| Table | Header row + 8-10 thin row placeholders | `TableView.jsx` |
| Timeline | Horizontal date axis + task bar placeholders | `TimelineView.jsx` |
| Calendar | 7-column grid with date/chip placeholders | `CalendarView.jsx` |
| Settings | Section card placeholders (6 sections) | `Settings.jsx` |
| Profile | Avatar circle + stat cards + info grid | `Me.jsx` |

### Skeleton Base Component Rebuild
Replace `Skeleton.jsx` with warm token library:
- Base: `bg-light-bg-tertiary dark:bg-dark-bg-tertiary animate-pulse rounded-md`
- Variant for lighter: `bg-light-bg-hover dark:bg-dark-bg-hover`
- Export: `Skeleton`, `SkeletonText`, `SkeletonCircle`, `SkeletonCard`, `HeaderSkeleton`
- Use `motion.div` with framer-motion for smooth appearance

## 2. Settings Page — Current State

**File:** `frontend/src/components/Settings.jsx` (418 lines)
**CSS:** `frontend/src/components/Settings.css` — unused (component uses Tailwind inline)

Already well-designed with warm tokens. 6 sections: Appearance, Localization, Notifications, Preferences, Account, Danger Zone. Uses framer-motion stagger animation.

### Issues Found
- No loading skeleton
- Settings.css is dead code (can be removed)
- Toast notification uses fixed bottom positioning — works fine
- All sections use proper warm tokens already

### Verdict
Settings needs minimal redesign — mostly just a skeleton and potential minor spacing/typography refinements. The design is already aligned with the warm aesthetic.

## 3. Profile Page — Current State

**File:** `frontend/src/components/auth/Me.jsx` (435 lines)
**Modal:** `frontend/src/components/auth/EditProfileModal.jsx` (253 lines)

### Bugs to Fix
1. **Line 196:** Debug inline `boxShadow: "0px 0px 1px 0.1px #000000"` — remove this
2. **Line 390:** Says "TaskFlow v1.0.0" → should be "Taskly v1.0.0"

### Design Assessment
Already uses warm tokens (`bg-light-bg-secondary`, `dark:bg-dark-bg-tertiary`, etc.). Layout is solid: avatar + stats + info grid + settings menu + danger zone. Needs:
- Remove debug boxShadow
- Fix brand name
- Add loading skeleton
- Minor visual polish (avatar border, card hover states)

## 4. Error & Empty States — Current State

**File:** `frontend/src/components/ErrorStates.jsx` (43 lines)
**File:** `frontend/src/components/ErrorFallback.jsx` (20 lines)

### Issues
- `NotFound`, `ServerError`, `NetworkError` — no dark mode text colors (bare `text-2xl font-bold` without `text-light-text-primary dark:text-dark-text-primary`)
- Uses `btn-primary` class — verify this exists in CSS (may not with Tailwind approach)
- `ErrorFallback` also uses `btn-primary`
- Empty state icon colors could use warm token variants
- No dedicated empty states per view (e.g., "No tasks yet" for Board, "No events" for Calendar)

### What Needs Building
- Fix dark mode on all error components
- Replace `btn-primary` with proper Tailwind warm button classes
- Create per-view empty state variants:
  - Overview: "No projects yet"
  - My Tasks: "No tasks assigned"
  - Board: "No tasks in this column"
  - Table: "No tasks match filters"
  - Timeline: "No tasks with dates"
  - Calendar: "No tasks this month"

## 5. Route Transitions

**File:** `frontend/src/App.jsx` — Routes inside `<AppLayout />` with no transition wrapper
**File:** `frontend/src/components/layout/AppLayout.jsx` — Main layout shell

framer-motion is already used throughout. `AnimatePresence` + `motion.div` with opacity fade is the simplest approach. The `<Outlet />` in AppLayout can be wrapped with:
```jsx
<AnimatePresence mode="wait">
  <motion.div key={location.pathname} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}}>
    <Outlet />
  </motion.div>
</AnimatePresence>
```

## 6. Responsive Audit

4 breakpoints to verify: 375px, 768px, 1024px, 1440px

Most components already use responsive Tailwind classes (`sm:`, `md:`, `lg:`). The audit should verify:
- Settings page at 375px (stack layout)
- Profile page at 375px (stack avatar + stats)
- All skeletons render correctly at all breakpoints
- No horizontal overflow at any breakpoint

## 7. Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Skeleton animation | CSS `animate-pulse` | Built-in Tailwind, no JS overhead, consistent with existing Overview pattern |
| Skeleton base color | `bg-light-bg-tertiary dark:bg-dark-bg-tertiary` | Matches existing warm token system, visible in both modes |
| Route transition | `AnimatePresence` + opacity fade | Already in deps, minimal code, works well |
| Empty states | Shared `EmptyState` + per-view wrapper | Reuse existing component, pass view-specific icon/message |
| Settings.css | Delete | Dead code, component uses Tailwind |
| Error buttons | Replace `btn-primary` with Tailwind warm classes | `btn-primary` may not exist, warm tokens are guaranteed |

## 8. Validation Architecture

Skeleton components are pure presentational — no API calls, no state management. Validation approach:
- Visual: Skeletons render correctly in both light/dark mode
- Functional: Each view shows skeleton during loading, transitions to content
- Responsive: Skeletons match actual view layout at all breakpoints
- Regression: Existing view functionality unchanged after skeleton integration

---
*Research complete — ready for planning*
