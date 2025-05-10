## Codefident Extension

### 1. ✅ **Line-level Review Marks**

- Users can **toggle review marks on selected lines** using the command:
  `codefident.toggleSelectedLines` – *"Toggle Line Mark"*
  ⌨️ Shortcut: `Option+Shift+Q` (Mac) / `Alt+Shift+Q` (Windows)

- Right-clicking in the editor will show the **"Toggle Line Mark"** command at the bottom of the context menu.

- Context menu also includes:
  `codefident.clearAllLineMarksInFile` – *"Clear All Line Marks in This File"*

- Two display styles for marked lines (user-configurable via settings):

  * **Sidebar (default):** A thin vertical bar on the left of the line number (like Git changes), between breakpoint and line number.
  * **Inline:** Highlight the entire line background (default: `rgba(0, 122, 204, 0.2)`)

---

### 2. 📄 **File-level Review Marks**

- Users can **toggle review status for files**, using interaction patterns similar to file deletion in VSCode:

  * Select a file (focus, open, or click)
  * Use shortcut: `Option+Shift+W` (Mac) / `Alt+Shift+W` (Windows)
  * Select multiple files using `Shift` or `Ctrl`
  * Toggle via right-click context menu

- **Reviewed files will display a symbol: `✓`**

- **Smart change detection logic:**

  * If a reviewed file is modified, its mark is automatically replaced with:
    `↻` = *"This file was reviewed, but has changed and needs re-review."*
  * Users can re-mark it to change back to `✓`.

---

### 3. 📁 **Directory-level Review Marks**

- Users can **toggle review status for directories** using the command:
  `codefident.toggleDirectory` – *"Toggle Directory Mark"*
  ⌨️ Shortcut: `Option+Shift+E` (Mac) / `Alt+Shift+E` (Windows)

- Toggle can also be triggered via right-click context menu.

- Reviewed directories will display the symbol: `✓`

- When a directory is marked as reviewed:

  * **All nested files and directories are recursively marked as reviewed.**

- Directory marks are **static** — they do not reset even if inner files are modified.

- *Selection and interaction for toggling directory marks follows the same UX pattern as deleting files/directories in VSCode.*

---

### 4. ⚙️ **Customizable Settings**

Users can adjust these options:

- Toggle between **line mark styles**: sidebar vs. background
* Change **color of line background**
- Customize review symbols:

  * File reviewed (`✓`)
  * Directory reviewed (`✓`)
  * File needs re-review (`↻`)

---

### 5. 💾 **Persistent Workspace Storage**

- All marking information will be persisted using VS Code's workspaceState API.
- Marked lines and files are automatically restored when the workspace is reopened.

