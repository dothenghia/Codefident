# Codefident Extension Development Quick Start

This guide will help you get started with developing the Codefident extension.

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- Visual Studio Code
- Git

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/codefident.git
   cd codefident
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Open the project in VS Code:
   ```bash
   code .
   ```

## Development Workflow

1. Start the extension in debug mode:

   - Press F5 in VS Code
   - This will open a new Extension Development Host window
   - The extension will be loaded in this window

2. Make changes to the code:

   - The extension will automatically recompile when you save changes
   - Press Ctrl+R (Cmd+R on macOS) in the Extension Development Host window to reload

3. Test your changes:
   - Use the Extension Development Host window to test your changes
   - Check the Debug Console for any errors or logs

## Project Structure

```
codefident/
├── src/                    # Source code
│   ├── modules/           # Core functionality modules
│   │   ├── line.ts       # Line marking functionality
│   │   ├── file.ts       # File marking functionality
│   │   └── directory.ts  # Directory marking functionality
│   ├── managers/         # Extension managers
│   │   └── statusBar.ts  # Status bar integration
│   ├── constants/        # Constants and configuration
│   │   └── constants.ts  # Extension constants and defaults
│   └── extension.ts      # Extension entry point
├── package.json          # Extension manifest
├── tsconfig.json         # TypeScript configuration
└── README.md            # Project documentation
```

## Core Components

### Line Marker (`src/modules/line.ts`)

- Handles line-level marking functionality
- Manages line decorations and styles
- Tracks line changes and updates

### File Marker (`src/modules/file.ts`)

- Manages file-level marking
- Tracks file modifications
- Handles file decoration providers

### Directory Marker (`src/modules/directory.ts`)

- Handles directory-level marking
- Manages directory decorations
- Coordinates with file marker for nested marking

### Status Bar Manager (`src/managers/statusBar.ts`)

- Displays real-time statistics
- Provides quick access to clear commands
- Manages status bar visibility

## Building and Packaging

1. Build the extension:

   ```bash
   npm run compile
   ```

2. Package the extension:
   ```bash
   npm run package
   ```
   This will create a `.vsix` file in the project root.

## Testing

1. Run unit tests:

   ```bash
   npm run test
   ```

2. Run integration tests:
   ```bash
   npm run test:integration
   ```

## Debugging

- Use the Debug Console in VS Code to see extension logs
- Set breakpoints in your code to debug
- Use the VS Code Developer Tools (Help > Toggle Developer Tools) for more detailed debugging

## Contributing

1. Create a new branch for your feature/fix
2. Make your changes
3. Run tests to ensure everything works
4. Submit a pull request

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [VS Code Extension Samples](https://github.com/microsoft/vscode-extension-samples)
- [VS Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
