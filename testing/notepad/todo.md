# Advanced Web-Based Code Editor - Development Prompt

You are a senior web development engineer tasked with creating a professional-grade, self-contained web-based code editor. This application must be production-ready, performant, and feature-rich while maintaining zero external dependencies.

## Core Requirements

### Architecture & Performance
- Build entirely with vanilla HTML, CSS, and JavaScript (zero npm dependencies, no frameworks)
- Implement aggressive caching strategy (Service Worker) for offline-first functionality
- Ensure sub-100ms file operations and sub-50ms UI interactions
- Minify and optimize all assets for rapid initial load
- Support files up to 10MB+ without performance degradation

### Visual Design
- Adopt a minimalist aesthetic inspired by Visual Studio Code and Notepad++
- Implement a clean, dark-mode-first color scheme (dark background, light text)
- Use a monospace font (e.g., Fira Code, JetBrains Mono) for code display
- Compact UI with intuitive keyboard shortcuts (matching VSCode/Notepad++ standards)

### Editor Functionality
- **Multi-tab support**: Unlimited tabs with unsaved indicator (dot)
- **Syntax highlighting**: Support JavaScript, HTML, CSS, JSON, Markdown, Python, and plain text
- **Code features**: Line numbering, word wrap toggle, indentation guides, bracket matching
- **Find/Replace**: Full regex support, case sensitivity, whole word matching
- **Editing**: Undo/redo stack, auto-indent, tab/space conversion, trailing whitespace removal
- **Navigation**: Go to line, search history, recent files

### Data Persistence & Sync
- **Local Storage**: Save all tabs, content, and settings to IndexedDB (fallback to localStorage)
- **Session Recovery**: Auto-restore exact state on browser reload (cursor position, scroll, active tab)
- **Export System**: Generate shareable, self-contained data URLs (base64-encoded state) that can be pasted into local browser to restore complete session
- **Import Flow**: Parse data URLs seamlessly; trigger auto-restore without user intervention

### Advanced Features
- **Settings Panel**: Font size, theme, keybindings, indentation size, EOL style
- **File Explorer**: Left sidebar for file tree (virtual file structure)
- **Status Bar**: Line/column info, file size, encoding indicator, active tab count
- **Command Palette**: Fuzzy command search (Ctrl+Shift+P / Cmd+Shift+P)
- **Keyboard Shortcuts**: Custom keybinding support, display cheat sheet

### Code Quality & UX
- **Responsive**: Works on desktop, tablet, and mobile (graceful degradation)
- **Accessibility**: ARIA labels, keyboard navigation, focus management
- **Error Handling**: Graceful failures, user-friendly error messages
- **Loading States**: Progress indication, smooth transitions
- **Cross-browser**: Chrome, Firefox, Safari, Edge compatibility

## Deliverables

1. **Single HTML file** (or minimal file structure) with embedded CSS and JavaScript
2. **Service Worker** for offline support and caching
3. **Comprehensive documentation** (inline comments, usage guide)
4. **Demo/test files** showing all features in action

## Success Criteria

- ✅ Launch in <2 seconds on modern hardware
- ✅ Function identically online and offline
- ✅ Export/import cycle preserves 100% of user data
- ✅ Support 1000+ lines of code without lag
- ✅ Zero external requests (self-contained)
- ✅ Intuitive interface requiring no tutorial
