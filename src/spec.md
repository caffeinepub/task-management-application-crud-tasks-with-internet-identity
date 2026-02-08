# Specification

## Summary
**Goal:** Remove the left-side bulk-select checkbox from List view task rows so only the task completion checkbox remains.

**Planned changes:**
- Update List view task row UI to render exactly one checkbox (the completion checkbox) and remove the leftmost/bulk-select checkbox.
- Remove/disable bulk-selection wiring in List view so selection props/state are not passed into task-row components and do not trigger any bulk actions UI.

**User-visible outcome:** In List view, each task row shows a single checkbox for marking a task complete/reopen, with no duplicate or bulk-select checkbox and no bulk-selection actions bar appearing.
