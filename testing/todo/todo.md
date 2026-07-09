# 🚀 Master Prompt — Epic Notes & Todo Web App for Claude Opus 4.8

## Role & Identity

You are an **elite, world-class frontend web developer** with a decade of experience shipping award-winning products (think Apple, Linear, Vercel, Notion, and Stripe polish). You have an obsessive eye for detail, a deep mastery of modern HTML5, CSS3, and vanilla JavaScript, and an intuitive sense for typography, spacing, motion, and color. You write clean, semantic, accessible, and performant code — and you make things that feel *effortlessly premium*.

Your mission: take the existing concept below and elevate it into a **stunning, minimalistic yet deeply professional** web application for capturing notes during work and managing a todo list.

---

## 🎯 Project Brief

Build a single, cohesive web application called **"Flow"** (or a similarly elegant working name) that lives at **`todo.labidi.eu`**. It serves one purpose beautifully: let a person **take notes while they work** and **keep a focused todo list**, side by side, in one calm, distraction-free interface.

### Core Principles
- **Minimalistic but premium** — every pixel earns its place; nothing is loud, everything is intentional.
- **Professional** — this should feel like a paid product a serious professional would trust daily.
- **Calm & focused** — the UI should reduce cognitive load, not add to it.
- **Fast & lightweight** — buttery-smooth, no jank, instant interactions.

---

## 🧩 Required Features

### 1. Notes Panel
- A clean, spacious writing area for freeform work notes.
- Auto-save to `localStorage` (persist across reloads).
- Subtle character/word count.
- Support for simple, unobtrusive formatting (a lightweight approach — plain text with graceful line handling, or optional minimal markdown-style rendering).
- A gentle "last saved" indicator.

### 2. Todo List Panel
- Add tasks quickly (Enter to add, clear input after).
- Check off tasks with a satisfying, smooth completion animation.
- Delete tasks with a subtle hover-revealed action.
- Reorder tasks via drag-and-drop (optional but encouraged).
- Show remaining count and completed count.
- Filter: **All / Active / Completed**.
- Persist all todos to `localStorage`.
- Optional: due-date or priority accent (keep it subtle if included).

### 3. Layout & Shell
- A refined **two-column layout** (Notes | Todos) on desktop that gracefully **stacks** on mobile.
- A slim, elegant top bar with the app name, a live date/time, and a **light/dark mode toggle**.
- **Fully responsive** — flawless from 320px phones to ultrawide monitors.

---

## 🎨 Design Direction

- **Theme:** Support both an immaculate **light mode** and a rich **dark mode**. Default to respecting `prefers-color-scheme`, with a manual toggle that persists.
- **Color palette:** Restrained and sophisticated. A near-neutral base (soft off-whites / deep charcoals) with **one refined accent color** used sparingly (suggest a modern indigo, teal, or emerald — make a fitting, tasteful choice).
- **Typography:** Use a premium, highly legible system/Google font pairing (e.g., Inter, Geist, or similar for UI; consider a subtle mono for accents). Generous line-height, careful tracking.
- **Spacing & rhythm:** Airy, consistent spacing scale. Let the content breathe.
- **Depth:** Soft, subtle shadows and gentle borders — never heavy. Consider a whisper of glass/blur where appropriate.
- **Motion:** Micro-interactions everywhere, but tasteful — smooth transitions, easing curves, hover states, and completion animations. Nothing distracting.
- **Details:** Rounded corners, refined focus rings for accessibility, custom-styled checkboxes, and a polished empty state for both panels.

---

## 🛠️ Technical Requirements

- Deliver a **single self-contained `index.html`** (or a clean, well-organized split into `index.html`, `styles.css`, and `app.js` — split the different parts logically and cleanly).
- **No heavy frameworks** — pure, modern HTML/CSS/JS. Keep dependencies to zero (or only lightweight, CDN-loaded fonts).
- **Semantic, accessible HTML** — proper landmarks, ARIA where needed, keyboard-navigable, respects reduced-motion preferences.
- **Persistent state** via `localStorage` for notes, todos, and theme.
- **Clean, commented, maintainable code** — organized and easy to extend.
- Include proper `<meta>` tags, a fitting favicon reference, and set the canonical/branding to **`todo.labidi.eu`**.
- Cross-browser compatible and performant (avoid layout thrash, use CSS transforms for animation).

---

## 🌐 Branding Rules

- The project's home is **`todo.labidi.eu`**.
- **Replace every reference pointing to `lebon.info` with `labidi.eu`** — no `lebon.info` should remain anywhere (links, meta, comments, copyright, etc.).
- Add a subtle, tasteful footer credit referencing **labidi.eu**.

---

## ✅ Deliverable

Produce the complete, production-ready code. Make **smart, opinionated, tasteful choices** wherever the brief leaves room. The end result should make anyone who opens it think: *"This is beautiful — and I want to work in it."*

Now build it. Make it epic.
