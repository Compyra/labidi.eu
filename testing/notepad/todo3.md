
# Feature & Bug-Fix Request — Web Code Editor

You are a **senior front-end web developer**. I need you to implement the following bug fixes and features in my existing Web Code Editor project. Treat this as production work: follow the existing architecture, coding conventions, and styling patterns already present in the codebase. Keep the solution accessible (keyboard + ARIA), performant, and cross-browser compatible. Add or update tests where a test setup exists, and briefly document any non-obvious decisions in code comments.

For each item below: first inspect the relevant existing code, explain your plan concisely, then apply the changes. Prefer small, focused, reviewable edits over large rewrites, and reuse existing utilities/components instead of duplicating logic.

## Context

- Project: an in-browser Note / Code Editor (`index.html`) with a file **Explorer**, editor **tabs**, a **table view**, and a bottom **status bar**.
- Please keep everything framework-consistent with what is already used (vanilla JS / existing framework, existing CSS approach, existing state model). Do **not** introduce a new framework or heavy dependency unless strictly necessary — if you do, justify it.

## Requirements

### 1) Explorer: visually distinguish files inside a folder vs. siblings
**Bug:** When dragging a file into a folder or creating a file, there is no visual difference between a file that lives *inside* a folder and one that sits *next to* the folder at the same level.

**Fix:**
- Render nested items with clear **indentation** proportional to their depth in the tree.
- Add a subtle visual cue (indent guide line / connector or hierarchy indicator) so nesting is obvious at a glance.
- Ensure the indentation updates immediately and correctly after drag-and-drop and after creating a new file, reflecting the item's true parent.
- Keep it consistent for both files and (expandable) folders, and make sure expand/collapse chevrons align with the indentation.

### 2) Explorer: right-click context menu
**Feature:** Add a context menu that appears when right-clicking items in the Explorer (files and folders).

**Details:**
- On a **folder**: options include at least **Rename**, **New File**, **New Folder**, **Delete**.
- On a **file**: options include at least **Rename**, **Delete** (and Open / Duplicate if it fits the app).
- **"New File" on a folder must create the file inside that folder** (correct parent), and the folder should auto-expand to reveal it. Immediately put the new item into inline rename/edit mode.
- The menu must close on outside click, on `Escape`, and on scroll; it must be keyboard-navigable and reposition to stay within the viewport (no off-screen menus).
- Reuse a single reusable context-menu component/util for the whole app if possible.

### 3) Editor tabs: right-click tab context menu (split / move / preview)
**Feature:** Add a context menu when right-clicking an editor **tab** at the top.

**Details:**
- Options to **Split editor** (open the file in a second pane) and **Move tab left / right** (or move to the other pane), enabling/disabling options depending on the tab's current side/position.
- If the file is a **Markdown (`.md`)** file, add an option to **open a rendered preview on the right side** (live/side-by-side preview). Keep scroll roughly in sync if feasible.
- Support at least a two-pane (left/right) split layout with independent active tabs per pane. Ensure closing tabs/panes gracefully collapses back to a single pane.

### 4) Table view: column filters + row count
**Feature:** Enhance the table view with default, reusable actions.

**Details:**
- Add **per-column filtering** (e.g. a filter input/dropdown in each column header) that narrows visible rows.
- Show a **row count** in/near the table, and update it to reflect the **filtered** count as well (e.g. "Showing X of Y rows").
- Keep filtering performant on large tables and preserve the count/UX when multiple column filters are combined.

### 5) Status bar: split to show info per file when a second file is open
**Feature:** When a second file/pane is open (from the split in item 3), the bottom **status bar should split** to show info for **both** files independently.

**Details:**
- Each half of the status bar reflects its corresponding pane (e.g. line/column, language/type, encoding, selection info — whatever the status bar currently shows).
- The active pane should be clearly indicated. When collapsing back to a single pane, the status bar returns to its single, full-width state.
- Keep the status bar data reactive to the pane it represents (updates on cursor move, edits, tab switch, etc.).

### 6) Keyboard shortcuts: fix, verify, and scope to the active pane
**Bug:** Some keyboard shortcuts do not behave correctly or are not cross-browser safe.

**Fix:**
- Audit **all** existing `Ctrl`/`Cmd` shortcuts and verify they actually work across all major browsers (Chrome, Firefox, Edge, Safari).
- **`Ctrl+W`** currently closes the entire site/tab instead of closing a single file — intercept it (`preventDefault`) so it only closes the **current file** within the editor.
- **`Ctrl+Shift+W`** also does not work — fix it so it performs its intended action within the editor (do not let the browser close the window/all tabs).
- Note that some browser-reserved shortcuts cannot be overridden; where a shortcut is unreliable, document it and provide an in-app alternative.

### 7) Keyboard shortcuts: work in the right-side pane too
**Bug:** Shortcuts only respond in one pane.

**Fix:**
- Ensure **all** editor shortcuts also work when focus is in the **file/editor on the right side** of the screen (the second pane from item 3).
- Route each shortcut to the **currently focused/active pane** so actions (close, split, save, undo, etc.) apply to the correct editor.

### 8) Undo: `Ctrl+Y` (redo) and reopen last closed file/tab
**Feature:** Add undo/reopen capabilities.

**Details:**
- Add **`Ctrl+Y`** as a redo (or undo, per platform convention) shortcut alongside the existing undo, working in the active pane.
- Add **"reopen last closed"** so it remains possible to **reopen the last tab or file that was closed** (VS Code style, e.g. `Ctrl+Shift+T`). Maintain a stack of recently closed items and restore content, cursor position, and pane where feasible.

## Deliverables
- Working implementation of all five items, consistent with the existing code style.
- Concise explanation of the approach and any trade-offs.
- Notes on how to test each feature manually (and automated tests if a test harness exists).
- Confirmation of accessibility (keyboard + ARIA) and cross-browser behavior for the new UI (context menus, split panes, filters).
