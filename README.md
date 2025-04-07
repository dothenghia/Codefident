# Line Marker

A lightweight Visual Studio Code extension for marking and tracking reviewed lines and files in large codebases.

## Features

### Mark Lines as Reviewed

- Select lines in the editor and toggle them as "Reviewed"
- Marked lines are highlighted with a customizable background color
- Access via right-click context menu or Command Palette

### Mark Files as Reviewed

- Toggle the file as "Reviewed" directly from the Explorer view
- Right-click on a file in the Explorer to mark/unmark it
- Use the keyboard shortcut when a file is selected in the Explorer
- Files marked as reviewed show a checkmark (✓) or a customizable icon in the Explorer view
- Access via right-click in Explorer, keyboard shortcut, or Command Palette

### Other Operations

- Remove all line marks in the current file
- Reset all line marks across the entire project
- Reset all file marks across the entire project

### Available Commands

All commands are accessible through the Command Palette (Ctrl+Shift+P / Cmd+Shift+P):

- `Toggle Line Mark` - Mark/Unmark the selected lines as reviewed
- `Toggle File Mark` - Mark/Unmark the current file as reviewed
- `Remove All Line Marks` - Remove all marked lines in the current file
- `Reset All File Marks in Project` - Remove all marked files in the current workspace
- `Reset All Line Marks in Project` - Remove all line markings across all files in the workspace

### Keyboard Shortcuts

- `Alt+Shift+W` - Toggle Line Mark (mark/unmark selected lines)
- `Alt+Shift+E` - Toggle File Mark (mark/unmark file when selected in Explorer or focused in editor)

### State Persistence

- All marked lines and files are automatically saved and restored when you reopen VS Code
- State is maintained per workspace

## Installation

1. Open VS Code
2. Press `Ctrl+P` / `Cmd+P` to open the Quick Open dialog
3. Type `ext install line-marker`
4. Click Install

## Packaging the Extension

To create a `.vsix` package for distribution:

1. Make sure you have the VSCE (Visual Studio Code Extensions) tool installed:

   ```bash
   npm install -g @vscode/vsce
   ```

2. Build and package the extension:

   ```bash
   npm run compile && vsce package
   ```

   This will create a `.vsix` file in your project directory that can be installed in VS Code.

3. To install the packaged extension:
   - Open VS Code
   - Go to Extensions view (Ctrl+Shift+X / Cmd+Shift+X)
   - Click on the "..." menu at the top
   - Select "Install from VSIX..."
   - Choose your `.vsix` file

## Configuration

You can customize the appearance of reviewed lines and files in your VS Code settings:

```json
{
  "line-marker.highlightColor": "rgba(0, 122, 204, 0.2)",
  "line-marker.reviewedFileIcon": "✓"
}
```

### Available Settings

- `line-marker.highlightColor`: Color used to highlight reviewed lines (default: "rgba(0, 122, 204, 0.2)")
- `line-marker.reviewedFileIcon`: Icon character displayed for reviewed files in the Explorer (default: "✓")
  - Must be a single character, including emoji like "🥰" or "✅"
  - Only the first character will be used if multiple characters are provided

## Usage

### Marking Lines

1. Select one or more lines in your code
2. Right-click and select "Toggle Line Mark" or use the Command Palette
3. The lines will be highlighted with the configured color
4. Select already marked lines and use the same command to unmark them
5. Alternatively, use the keyboard shortcut `Alt+Shift+W` to toggle line marks

### Marking Files

1. In the Explorer view, right-click on a file and select "Toggle File Mark"
2. Alternatively, select a file in the Explorer and press `Alt+Shift+E`
3. You can also mark the currently open file by pressing `Alt+Shift+E` while the editor is focused
4. A checkmark icon will appear next to the file
5. Use the same command to unmark the file

### Clearing Marks

- Use "Remove All Line Marks" to clear all line marks in the current file
- Use "Reset All Line Marks in Project" to clear all line marks across the entire project
- Use "Reset All File Marks in Project" to clear all file marks across the entire project

## Requirements

- Visual Studio Code version 1.99.0 or higher

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!
