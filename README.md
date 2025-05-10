# Codefident

A Visual Studio Code extension that helps you track your code review progress with confidence. Stop double-checking the same code repeatedly and focus on what matters.

> This extension was built by an OCD dev who open the same file 10 times… just to be sure 😂

## 🤔 Why Codefident?

Ever find yourself reviewing the same code over and over? Us too! Codefident is here to save you from your own perfectionism:

- ✅ Track which directories, files, and lines you've already reviewed
- ✅ Focus on new or changed code
- ✅ Build confidence in your review process
- ✅ Save time by avoiding unnecessary re-reviews
- ✅ Monitor review progress with real-time stats

## 🚀 Features

### Line Tracking

- Mark lines as reviewed with customizable highlights
- Choose between inline or sidebar indicators
- Automatically track line changes
- Merge overlapping line marks for tidiness

### File Tracking

- Mark files as reviewed with visual flair
- Track file modifications post-review
- Different icons for reviewed and modified files

### Directory Tracking

- Mark entire directories as reviewed
- Visual indicators for reviewed directories
- Automatic file marking within directories

### Status Bar Integration

- Real-time stats of marked lines, files, and directories
- Quick access to clear marks via status bar menu

## 🎮 Commands & Shortcuts

- `Toggle Line Mark` - Mark/unmark selected lines
- `Clear All Line Marks in File` - Remove all line marks in current file
- `Clear All Line Marks in Project` - Remove all line marks in workspace
- `Toggle File Mark` - Mark/unmark current file
- `Clear All File Marks in Project` - Remove all file marks in workspace
- `Toggle Directory Mark` - Mark/unmark current directory
- `Clear All Directory Marks in Project` - Remove all directory marks in workspace

### ⌨️ Keyboard Shortcuts

- `Alt+Shift+1` - Toggle Line Mark
- `Alt+Shift+2` - Toggle File Mark
- `Alt+Shift+3` - Toggle Directory Mark

## ⚙️ Installation

1. Open VS Code
2. Press `Ctrl+P` / `Cmd+P`
3. Type `ext install codefident`
4. Click Install

## 🛠️ Configuration

Customize Codefident through VS Code settings:

```json
{
  "codefident.highlightColor": "rgba(22, 119, 255, 0.15)",
  "codefident.sidebarColor": "rgba(22, 119, 255, 1)",
  "codefident.lineMarkStyle": "inline", // or "sidebar"
  "codefident.reviewedFileIcon": "✓",
  "codefident.changedFileIcon": "↻",
  "codefident.reviewedDirectoryIcon": "✓",
  "codefident.showStatusBar": true
}
```

## 🤝 Contributing

Contributions are welcome! Submit a Pull Request and join the fun.

## 📜 License

MIT

## 🐞 Support

Found a bug or have a feature request? Please [open an issue](https://github.com/yourusername/codefident/issues).
