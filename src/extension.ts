import * as vscode from "vscode";
import { LineMarker } from "./modules/line";
import { FileMarker } from "./modules/file";
import { COMMANDS } from "./constants/constants";

const WELCOME_MESSAGES = [
  "[Codefident] Happy Coding! 🥰",
  "[Codefident] Have a nice day! 👋",
  "[Codefident] You're doing great! 🌟",
  "[Codefident] Code with confidence! 💻",
  "[Codefident] Let's make something amazing! 🚀",
  "[Codefident] No need to double-check. You've marked it. ✅",
  "[Codefident] Trust yourself — you reviewed this already! 🧘",
  "[Codefident] Don't overthink it. Keep building! 🛠️",
  "[Codefident] Review once. Move forward. 🔁➡️",
  "[Codefident] Code it. Review it. Mark it. Done. 🏁",
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
    "[Codefident] Noooo, please use me 🥺💔"
  );
  // Cleanup is handled by the dispose methods of LineMarker and FileMarker
}
