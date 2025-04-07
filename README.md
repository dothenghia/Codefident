# Line Marker

A lightweight Visual Studio Code extension for marking and tracking reviewed lines and files in large codebases.

## Features

### Mark Lines as Reviewed

- Select lines in the editor and toggle them as "Reviewed"
- Marked lines are highlighted with a customizable background color
- Access via right-click context menu or Command Palette

### Mark Files as Reviewed

- Toggle the file as "Reviewed"
- Files marked as reviewed show a checkmark (✓) or a customizable icon in the Explorer view
- Access via right-click in Explorer or Command Palette

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

### State Persistence

- All marked lines and files are automatically saved and restored when you reopen VS Code
- State is maintained per workspace

## Installation

1. Open VS Code
2. Press `Ctrl+P` / `Cmd+P` to open the Quick Open dialog
3. Type `ext install line-marker`
4. Click Install

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

### Marking Files

1. Right-click on a file in the Explorer
2. Select "Toggle File Mark"
3. A checkmark icon will appear next to the file
4. Use the same command to unmark the file

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
