import * as vscode from "vscode";
import { LineMarker } from "./modules/line";
import { FileMarker } from "./modules/file";
import { COMMANDS } from "./constants/constants";

const WELCOME_MESSAGES = [
  "[Line Marker] Happy Coding! 🥰",
  "[Line Marker] Have a nice day! 👋",
  "[Line Marker] Let's write some awesome code! ✨",
  "[Line Marker] Time to be productive! 💪",
  "[Line Marker] You're doing great! 🌟",
  "[Line Marker] Code with confidence! 💻",
  "[Line Marker] Ready to mark some code? 📝",
  "[Line Marker] Let's make something amazing! 🚀",
];

export function activate(context: vscode.ExtensionContext) {
  // Show random welcome message
  const randomMessage =
    WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
  vscode.window.showInformationMessage(randomMessage);

  // Initialize line and file markers
  const lineMarker = new LineMarker(context);
  const fileMarker = new FileMarker(context);

  // Restore state
  lineMarker.restoreState();
  fileMarker.restoreState();

  // Register commands
  const toggleSelectedLinesCommand = vscode.commands.registerCommand(
    COMMANDS.TOGGLE_SELECTED_LINES,
    async () => {
      await lineMarker.toggleSelectedLines();
    }
  );

  const toggleFileCommand = vscode.commands.registerCommand(
    COMMANDS.TOGGLE_FILE,
    async (fileUri?: vscode.Uri) => {
      await fileMarker.toggleFile(fileUri);
    }
  );

  const clearAllLineMarksInFileCommand = vscode.commands.registerCommand(
    COMMANDS.CLEAR_ALL_LINE_MARKS_IN_FILE,
    async () => {
      await lineMarker.clearAllLineMarksInFile();
    }
  );

  const clearAllLineMarksInDirectoryCommand = vscode.commands.registerCommand(
    COMMANDS.CLEAR_ALL_LINE_MARKS_IN_DIRECTORY,
    async () => {
      await lineMarker.clearAllLineMarksInDirectory();
    }
  );

  const clearAllFileMarksInDirectoryCommand = vscode.commands.registerCommand(
    COMMANDS.CLEAR_ALL_FILE_MARKS_IN_DIRECTORY,
    async () => {
      await fileMarker.clearAllFileMarksInDirectory();
    }
  );

  // Register context menu providers
  const editorContextMenuProvider = vscode.window.registerWebviewViewProvider(
    "line-marker.editorContextMenu",
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
    "line-marker.explorerContextMenu",
    {
      resolveWebviewView: (webviewView) => {
        webviewView.webview.options = {
          enableScripts: true,
          localResourceRoots: [],
        };
      },
    }
  );

  // Register event listeners
  const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        lineMarker.applyDecorations(editor);
      }
    }
  );

  // Add all subscriptions to the extension's subscriptions
  context.subscriptions.push(
    toggleSelectedLinesCommand,
    toggleFileCommand,
    clearAllLineMarksInFileCommand,
    clearAllLineMarksInDirectoryCommand,
    clearAllFileMarksInDirectoryCommand,
    editorContextMenuProvider,
    explorerContextMenuProvider,
    onDidChangeActiveTextEditor,
    lineMarker,
    fileMarker
  );
}

// This method is called when your extension is deactivated
export function deactivate() {
  // Show goodbye message
  vscode.window.showInformationMessage(
    "[Line Marker] Noooo, please use me 🥺💔"
  );
  // Cleanup is handled by the dispose methods of LineMarker and FileMarker
}
