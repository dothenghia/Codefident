import * as vscode from "vscode";
import {
  STORAGE_KEYS,
  DEFAULTS,
  MESSAGES,
  CONFIG_KEYS,
} from "../constants/constants";

export class FileMarker {
  private markedFiles: Set<string>;
  private context: vscode.ExtensionContext;
  private fileDecorationProvider: vscode.FileDecorationProvider;
  private _onDidChangeFileDecorations: vscode.EventEmitter<
    vscode.Uri | vscode.Uri[]
  >;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.markedFiles = new Set();
    this._onDidChangeFileDecorations = new vscode.EventEmitter<
      vscode.Uri | vscode.Uri[]
    >();

    // Initialize file decoration provider
    this.fileDecorationProvider = this.createFileDecorationProvider();
    context.subscriptions.push(
      vscode.window.registerFileDecorationProvider(this.fileDecorationProvider),
      this._onDidChangeFileDecorations
    );

    // Listen for configuration changes
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(CONFIG_KEYS.FILE_ICON)) {
          this._onDidChangeFileDecorations.fire(vscode.Uri.file(""));
        }
      })
    );
  }

  public getMarkedFiles(): Set<string> {
    return this.markedFiles;
  }

  public setMarkedFiles(markedFiles: Set<string>): void {
    this.markedFiles = markedFiles;
  }

  private createFileDecorationProvider(): vscode.FileDecorationProvider {
    return {
      onDidChangeFileDecorations: this._onDidChangeFileDecorations.event,
      provideFileDecoration: (uri: vscode.Uri) => {
        if (this.markedFiles.has(uri.fsPath)) {
          const config = vscode.workspace.getConfiguration("line-marker");
          const reviewedFileIcon =
            config.get<string>(CONFIG_KEYS.FILE_ICON) || DEFAULTS.FILE_BADGE;

          // Ensure the icon is only a single character
          const icon =
            reviewedFileIcon.length > 0
              ? reviewedFileIcon.charAt(0)
              : DEFAULTS.FILE_BADGE;

          return {
            badge: icon,
            tooltip: DEFAULTS.FILE_TOOLTIP,
          };
        }
        return undefined;
      },
    };
  }

  // Toggle mark for current file
  public async toggleFile(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const filePath = editor.document.uri.fsPath;

    if (this.markedFiles.has(filePath)) {
      // If file is already marked, unmark it
      this.unmarkFile();
    } else {
      // If file is not marked, mark it
      this.markFile();
    }
  }

  // Mark current file
  public async markFile(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const filePath = editor.document.uri.fsPath;
    this.markedFiles.add(filePath);
    await this.saveState();
    this._onDidChangeFileDecorations.fire(editor.document.uri);
  }

  // Unmark current file
  public async unmarkFile(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const filePath = editor.document.uri.fsPath;
    this.markedFiles.delete(filePath);
    await this.saveState();
    this._onDidChangeFileDecorations.fire(editor.document.uri);
  }

  // Reset all file marks in the project (workspace)
  public async clearAllFileMarksInDirectory(): Promise<void> {
    // Count how many files are marked
    const markedFilesCount = this.markedFiles.size;

    if (markedFilesCount === 0) {
      vscode.window.showInformationMessage(MESSAGES.NO_MARKED_FILES);
      return;
    }

    // Clear all file marks
    this.markedFiles.clear();

    // Save state
    await this.saveState();

    // Notify about changes to all workspace folders
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
      const uris = workspaceFolders.map((folder) => folder.uri);
      this._onDidChangeFileDecorations.fire(uris);
    }

    vscode.window.showInformationMessage(
      MESSAGES.ALL_FILE_MARKS_RESET.replace(
        "{count}",
        markedFilesCount.toString()
      )
    );
  }

  private getStorageKeyForMarkedFiles(): string {
    return STORAGE_KEYS.MARKED_FILES;
  }

  private async saveState(): Promise<void> {
    // Save marked files
    await this.context.workspaceState.update(
      this.getStorageKeyForMarkedFiles(),
      Array.from(this.markedFiles)
    );
  }

  public async restoreState(): Promise<void> {
    // Restore marked files
    const markedFilesData = this.context.workspaceState.get<string[]>(
      this.getStorageKeyForMarkedFiles(),
      []
    );
    this.markedFiles = new Set(markedFilesData);
  }

  public dispose(): void {
    this._onDidChangeFileDecorations.dispose();
  }
}
