# Specification

## Summary
**Goal:** Upgrade the task manager to a richer Task Manager 2.0 model and UI (status/priority/tags/subtasks, filters, Kanban drag-drop, dashboard, shortcuts) with reliable stable persistence across calls and canister upgrades.

**Planned changes:**
- Fix backend persistence using stable storage so per-principal tasks, user profiles, and next task IDs persist across calls and upgrades.
- Expand backend task model and APIs to include required dueDate, status, priority, tags, createdAt/updatedAt, createdBy, optional assignedTo, and per-user Kanban ordering data.
- Add persisted subtasks (ordered checklist) with APIs to add/update/delete/toggle, included in task fetch results.
- Update task create/edit UI for required due date, status/priority/tags inputs, and display created/updated metadata with English validation/errors.
- Implement due-date badges and overdue highlighting in both list items and Kanban cards.
- Add advanced filtering (status, due-date ranges, priority, tags, search) and sorting (Due Date default, Priority, Created Date, Alphabetical) plus quick filter chips.
- Upgrade Kanban to status-based columns with drag-and-drop between columns and reorder-within-column, persisting status changes and ordering.
- Add a tasks dashboard showing open count, completed today, overdue count, and due-this-week metrics.
- Add productivity UX: quick add/command palette, keyboard shortcuts, inline edits, duplicate, archive/unarchive, bulk select actions, and dismissible due-soon/overdue banners (session-only).
- Replace real-time collaboration with periodic refresh and window-focus refetch via React Query, keeping mutation UX consistent without disruptive loading.
- Improve UI polish with loading skeletons, mobile responsive refinements, and an optional dark mode toggle using existing theme tokens.
- Add and display a custom empty-state illustration as a static frontend asset on landing and/or empty task state.

**User-visible outcome:** Tasks reliably save and persist across upgrades; users can create and manage richer tasks (status/priority/tags/subtasks), organize them with filters/sorts and a drag-and-drop Kanban board, see dashboard metrics and due-date cues, use keyboard/command-palette workflows and bulk actions, and experience a more polished UI (refresh behavior, skeletons, mobile, dark mode, empty state illustration).
