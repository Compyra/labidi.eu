# Prompt for Claude Opus 4.8 — Notepad Project QA & Feature Verification

You are Claude Opus 4.8 acting as a senior QA engineer and full-stack developer. Your task is to **audit, verify, and fix** the current "Notepad — Web Code Editor" project so that **every suggested and implemented feature actually works in a real browser**, then implement the additional features listed below.

## Context

- Project root: this repository (the web-based Notepad / code editor served at `http://localhost:8777/index.html`).
- The project will be renamed to **`note.labidi.eu`** and deployed to the domain **`note.labidi.eu`** after all tests pass. Update any project name references, titles, manifests, README, and config accordingly.
- Do **not** break existing working behavior while fixing bugs or adding features.

## Part 1 — Full Code Audit & Bug Hunt

Read the **entire codebase** (HTML, CSS, JS, and any config/build files). For each feature that is described, suggested, or implemented, verify it **actually functions in the browser**, not just in the code. Produce a report and then fix every bug you find.

For each feature, check and confirm:
1. The event is actually bound and reachable.
2. Native browser behavior does not override it (and is properly prevented when it should be).
3. It works across the main browsers (Chrome, Firefox, Edge).
4. Edge cases and error states are handled.

### Known / example bugs to start from
- **`Ctrl + N`** does **not** work: the browser's native reaction opens a new tab/window and the app never receives the shortcut. This action is **not caught**. Fix it (e.g. intercept the key, `preventDefault`, and implement the intended in-app "new note" behavior; document the browser limitations where `Ctrl+N` cannot be reliably captured and provide an alternative binding/UI button).
- **`Ctrl + P`** appears to work in preliminary testing — verify it and confirm it does the intended action rather than triggering the browser print dialog unintentionally.

### Deliverable for Part 1
- A checklist of **all** keyboard shortcuts and features with **PASS / FAIL / PARTIAL** status.
- The root cause of each failure.
- The applied fix for each failure.
- Any shortcut that cannot be captured by browsers must be reassigned or replaced with an in-app UI control, and this limitation must be documented.

## Part 2 — Security Requirement (must hold throughout)

**Code inside opened files must never execute.** Any file content — including HTML, JS, `<script>`, event handlers, formulas, macros, etc. — must be treated as **inert text/data**. Rendering (syntax highlighting, markdown preview, table rendering) must be done safely:
- Escape/sanitize all rendered content.
- Never `eval`, never inject raw file content into the live DOM as executable HTML.
- Markdown preview and table views must sanitize output so opened files stay safe.

## Part 3 — New Features to Implement

Implement the following. Keep the UI consistent with the existing design and keep everything secure per Part 2.

1. **Drag a tab to the side (split view / two notes at once)**
   - Allow the user to drag a tab to the left or right edge so the editor splits and **two notes are open side by side** simultaneously.
   - Support closing/merging the split back to a single view.

2. **Compare feature**
   - Add a **Compare** action that diffs the two open notes and highlights the differences (line-level, added/removed/changed), similar to a diff viewer.

3. **Open Excel / CSV → split code + table view**
   - Allow opening an **`.xlsx` / `.xls` / `.csv`** file.
   - Split the screen: **code/raw view on the left**, a **rendered table on the right**.
   - Table rendering must be safe (no formula execution, values shown as inert data).

4. **Rename tab inline**
   - Make it easy to rename a file by **clicking the tab name** and editing it inline.

5. **Folders + drag-and-drop in the explorer**
   - Support **folders** in the file explorer.
   - Allow **drag-and-drop of files** into the explorer (and between folders).

6. **Extension-driven syntax highlighting & theme**
   - Changing the file's **extension** changes the language mode, syntax colors, and behavior automatically:
     - **`.py`** → accurate Python syntax colors.
     - **`.ps1`** → accurate PowerShell syntax colors.
     - **`.md`** → Markdown colors, **plus** the option to **split the screen**: raw markdown on the left, **rendered markdown preview on the right**.
   - Ensure other common extensions map to sensible modes too.

7. **Markdown split vs. second file in the side pane**
   - When a `.md` file is open, the user can choose **either** the markdown preview in the side pane **or** open a **different second file** in the side pane instead.

## Part 4 — Acceptance / Testing

- Manually verify **each** feature in the running browser at `http://localhost:8777/index.html`.
- Provide reproducible test steps for every feature and every fixed bug.
- Confirm no file content can execute (security check with a malicious sample file: HTML with `<script>`, a CSV with `=cmd|...` formula-injection payload, etc. — all must render inert).
- Only after **all tests pass**, prepare the project for rename/deploy to **`note.labidi.eu`**.

## Output format

1. **Audit report** (feature checklist with PASS/FAIL/PARTIAL + root cause + fix).
2. **Code changes** (the actual patches/edits, secure and idiomatic).
3. **New feature implementations** (Part 3 items).
4. **Test plan & results** (Part 4) with step-by-step reproduction for each item.
