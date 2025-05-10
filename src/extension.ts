import * as vscode from "vscode";
import { LineMarker, MarkedDecoration } from "./modules/line";
import { FileMarker } from "./modules/file";
import { DirectoryMarker } from "./modules/directory";
import { StatusBarManager } from "./managers/statusBar";
import { COMMANDS, WELCOME_MESSAGES } from "./constants/constants";

// Main extension activation function
export function activate(context: vscode.ExtensionContext) {
  // Show random welcome message
  const randomMessage =
    WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
  vscode.window.showInformationMessage(randomMessage);

  // Initialize markers and managers
  const lineMarker = new LineMarker(context);
  const fileMarker = new FileMarker(context);
  const directoryMarker = new DirectoryMarker(context, fileMarker);
  const statusBarManager = new StatusBarManager(context);

  // Restore previous session state
  lineMarker.restoreState();
  fileMarker.restoreState();
  directoryMarker.restoreState();

  // Register command handlers
  const toggleSelectedLinesCommand = vscode.commands.registerCommand(
    COMMANDS.TOGGLE_SELECTED_LINES,
    async () => {
      await lineMarker.toggleSelectedLines();
      updateStats();
    }
  );

  const toggleFileCommand = vscode.commands.registerCommand(
    COMMANDS.TOGGLE_FILE,
    async (fileUri?: vscode.Uri) => {
      await fileMarker.toggleFile(fileUri);
      updateStats();
    }
  );

  const toggleDirectoryCommand = vscode.commands.registerCommand(
    COMMANDS.TOGGLE_DIRECTORY,
    async (directoryUri?: vscode.Uri) => {
      await directoryMarker.toggleDirectory(directoryUri);
      updateStats();
    }
  );

  const clearAllLineMarksInFileCommand = vscode.commands.registerCommand(
    COMMANDS.CLEAR_ALL_LINE_MARKS_IN_FILE,
    async () => {
      await lineMarker.clearAllLineMarksInFile();
      updateStats();
    }
  );

  const clearAllLineMarksInProjectCommand = vscode.commands.registerCommand(
    COMMANDS.CLEAR_ALL_LINE_MARKS_IN_PROJECT,
    async () => {
      await lineMarker.clearAllLineMarksInProject();
      updateStats();
    }
  );

  const clearAllFileMarksInProjectCommand = vscode.commands.registerCommand(
    COMMANDS.CLEAR_ALL_FILE_MARKS_IN_PROJECT,
    async () => {
      await fileMarker.clearAllFileMarksInProject();
      updateStats();
    }
  );

  const clearAllDirectoryMarksInProjectCommand =
    vscode.commands.registerCommand(
      COMMANDS.CLEAR_ALL_DIRECTORY_MARKS_IN_PROJECT,
      async () => {
        await directoryMarker.clearAllDirectoryMarksInProject();
        updateStats();
      }
    );

  // Register context menu providers
  const editorContextMenuProvider = vscode.window.registerWebviewViewProvider(
    "codefident.editorContextMenu",
    {
      resolveWebviewView: (webviewView) => {
        webviewView.webview.options = {
          enableScripts: true,
          localResourceRoots: [],
        };
      },
    }
  );

  const explorerContextMenuProvider = vscode.window.registerWebviewViewProvider(
    "codefident.explorerContextMenu",
    {
      resolveWebviewView: (webviewView) => {
        webviewView.webview.options = {
          enableScripts: true,
          localResourceRoots: [],
        };
      },
    }
  );

  // Track active editor changes
  const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        lineMarker.applyDecorations(editor);
      }
    }
  );

  // Helper functions
  // Get current review statistics
  function getStats() {
    return {
      markedLines: Array.from(lineMarker.getMarkedLines().values()).reduce(
        (total, decorations) =>
          total +
          decorations.reduce(
            (sum, decoration) =>
              sum +
              (decoration.range.end.line - decoration.range.start.line + 1),
            0
          ),
        0
      ),
      markedFiles: fileMarker.getMarkedFiles().size,
      markedDirectories: directoryMarker.getMarkedDirectories().size,
    } as const;
  }

  // Update status bar with current stats
  function updateStats() {
    statusBarManager.updateStats(getStats());
  }

  // Initial stats update
  updateStats();

  // Register disposables
  context.subscriptions.push(
    toggleSelectedLinesCommand,
    toggleFileCommand,
    toggleDirectoryCommand,
    clearAllLineMarksInFileCommand,
    clearAllLineMarksInProjectCommand,
    clearAllFileMarksInProjectCommand,
    clearAllDirectoryMarksInProjectCommand,
    onDidChangeActiveTextEditor,
    editorContextMenuProvider,
    explorerContextMenuProvider,
    lineMarker,
    fileMarker,
    directoryMarker,
    statusBarManager
  );
}

// Extension deactivation handler
export function deactivate() {
  // Cleanup is handled by the dispose methods of each component
}
