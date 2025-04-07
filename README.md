# Line Marker

A lightweight Visual Studio Code extension for marking and tracking reviewed lines and files in large codebases.

## Features

### Mark Lines as Reviewed

- Select lines in the editor and mark them as "Reviewed"
- Marked lines are highlighted with a customizable background color
- Unmark lines when needed
- Access via right-click context menu or Command Palette

### Mark Files as Reviewed

- Mark entire files as "Reviewed"
- Files marked as reviewed show a checkmark (✓) in the Explorer view
- Access via right-click in Explorer or Command Palette

### Available Commands

All commands are accessible through the Command Palette (Ctrl+Shift+P / Cmd+Shift+P):

- `Line Marker: Mark Selected Lines` - Mark selected lines as reviewed
- `Line Marker: Unmark Selected Lines` - Remove review marks from selected lines
- `Line Marker: Mark File as Reviewed` - Mark the current file as reviewed
- `Line Marker: Unmark File` - Remove the reviewed mark from the current file
- `Line Marker: Clear All Marked Files` - Clear all file-level review marks
- `Line Marker: Clear All Line Marks in This File` - Clear all line-level marks in the current file

### State Persistence

- All marked lines and files are automatically saved and restored when you reopen VS Code
- State is maintained per workspace

## Installation

1. Open VS Code
2. Press `Ctrl+P` / `Cmd+P` to open the Quick Open dialog
3. Type `ext install line-marker`
4. Click Install

## Configuration

You can customize the highlight color for reviewed lines in your VS Code settings:

```json
{
  "line-marker.highlightColor": "rgba(0, 122, 204, 0.2)"
}
```

## Usage

### Marking Lines

1. Select one or more lines in your code
2. Right-click and select "Mark Selected Lines" or use the Command Palette
3. The lines will be highlighted with the configured color

### Marking Files

1. Right-click on a file in the Explorer
2. Select "Mark File as Reviewed"
3. A checkmark will appear next to the file

### Clearing Marks

- Use the Command Palette to clear all marks or specific marks
- Right-click on marked lines or files to unmark them

## Requirements

- Visual Studio Code version 1.99.0 or higher

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!
