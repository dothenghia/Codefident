import * as vscode from "vscode";
import {
  STORAGE_KEYS,
  CONFIG_KEYS,
  DEFAULTS,
  MESSAGES,
} from "../constants/constants";

// Interface for marked file data
interface MarkedFile {
  path: string;
  lastModified: number;
}

export class FileMarker {
  // Map of file paths to their mark data
  private markedFiles: Map<string, MarkedFile>;
  // VS Code extension context
  private context: vscode.ExtensionContext;
  // File decoration provider for UI
  private fileDecorationProvider: vscode.FileDecorationProvider;
  // Event emitter for file decoration changes
  private _onDidChangeFileDecorations: vscode.EventEmitter<
    vscode.Uri | vscode.Uri[]
  >;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.markedFiles = new Map();
    this._onDidChangeFileDecorations = new vscode.EventEmitter<
      vscode.Uri | vscode.Uri[]
    >();

    // Initialize file decoration provider
    this.fileDecorationProvider = this.createFileDecorationProvider();
    context.subscriptions.push(
      vscode.window.registerFileDecorationProvider(this.fileDecorationProvider),
      this._onDidChangeFileDecorations
    );

    // Listen for file changes
    context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument((e) => {
        const filePath = e.document.uri.fsPath;
        if (this.markedFiles.has(filePath)) {
          this.handleFileChange(filePath);
        }
      })
    );

    // Listen for configuration changes
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (
          e.affectsConfiguration(CONFIG_KEYS.REVIEWED_FILE_ICON) ||
          e.affectsConfiguration(CONFIG_KEYS.CHANGED_FILE_ICON)
        ) {
          this._onDidChangeFileDecorations.fire(vscode.Uri.file(""));
        }
      })
    );
  }

  // Create and configure file decoration provider
  private createFileDecorationProvider(): vscode.FileDecorationProvider {
    return {
      onDidChangeFileDecorations: this._onDidChangeFileDecorations.event,
      provideFileDecoration: async (uri: vscode.Uri) => {
        const filePath = uri.fsPath;
        const markedFile = this.markedFiles.get(filePath);

        if (!markedFile) {
          return undefined;
        }

        const config = vscode.workspace.getConfiguration();
        const stats = await vscode.workspace.fs.stat(uri);
        const isModified = stats.mtime > markedFile.lastModified;

        if (isModified) {
          const changedFileIcon =
            config.get<string>(CONFIG_KEYS.CHANGED_FILE_ICON) ||
            DEFAULTS.CHANGED_FILE_BADGE;
          return {
            badge: changedFileIcon.charAt(0),
            tooltip: DEFAULTS.CHANGED_FILE_TOOLTIP,
          };
        } else {
          const reviewedFileIcon =
            config.get<string>(CONFIG_KEYS.REVIEWED_FILE_ICON) ||
            DEFAULTS.REVIEWED_FILE_BADGE;
          return {
            badge: reviewedFileIcon.charAt(0),
            tooltip: DEFAULTS.REVIEWED_FILE_TOOLTIP,
          };
        }
      },
    };
  }

  // Handle file content changes
  private async handleFileChange(filePath: string): Promise<void> {
    const markedFile = this.markedFiles.get(filePath);
    if (!markedFile) {
      return;
    }

    const uri = vscode.Uri.file(filePath);
    const stats = await vscode.workspace.fs.stat(uri);

    if (stats.mtime > markedFile.lastModified) {
      // Update the decoration to show the changed state
      this._onDidChangeFileDecorations.fire(uri);
    }
  }

  // Toggle review mark for a file
  public async toggleFile(fileUri?: vscode.Uri): Promise<void> {
    let targetUri: vscode.Uri;

    if (fileUri) {
      targetUri = fileUri;
    } else {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      targetUri = editor.document.uri;
    }

    const filePath = targetUri.fsPath;

    if (this.markedFiles.has(filePath)) {
      await this.unmarkFile(filePath);
    } else {
      await this.markFile(filePath);
    }
  }

  // Mark a file as reviewed
  public async markFile(filePath: string): Promise<void> {
    const uri = vscode.Uri.file(filePath);
    const stats = await vscode.workspace.fs.stat(uri);

    this.markedFiles.set(filePath, {
      path: filePath,
      lastModified: stats.mtime,
    });

    await this.saveState();
    this._onDidChangeFileDecorations.fire(uri);
  }

  // Remove review mark from a file
  public async unmarkFile(filePath: string): Promise<void> {
    this.markedFiles.delete(filePath);
    await this.saveState();
    this._onDidChangeFileDecorations.fire(vscode.Uri.file(filePath));
  }

  // Clear all file marks in the project
  public async clearAllFileMarksInProject(): Promise<void> {
    const markedFilesCount = this.markedFiles.size;
    if (markedFilesCount === 0) {
      vscode.window.showInformationMessage(MESSAGES.NO_MARKED_FILES);
      return;
    }

    // Store marked files before clearing
    const markedFilesArray = Array.from(this.markedFiles.keys());

    // Clear all file marks
    this.markedFiles.clear();
    await this.saveState();

    // Notify about changes
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
      const uris = workspaceFolders.map((folder) => folder.uri);
      this._onDidChangeFileDecorations.fire(uris);

      markedFilesArray.forEach((filePath) => {
        this._onDidChangeFileDecorations.fire(vscode.Uri.file(filePath));
      });
    }

    vscode.window.showInformationMessage(
      MESSAGES.ALL_FILE_MARKS_RESET.replace(
        "{count}",
        markedFilesCount.toString()
      )
    );
  }

  // Save file marks state to workspace storage
  private async saveState(): Promise<void> {
    const markedFilesData = Array.from(this.markedFiles.values());
    await this.context.workspaceState.update(
      STORAGE_KEYS.MARKED_FILES,
      markedFilesData
    );
  }

  // Restore file marks state from workspace storage
  public async restoreState(): Promise<void> {
    const markedFilesData = this.context.workspaceState.get<MarkedFile[]>(
      STORAGE_KEYS.MARKED_FILES,
      []
    );
    this.markedFiles = new Map(
      markedFilesData.map((file) => [file.path, file])
    );
  }

  // Get all marked files
  public getMarkedFiles(): Map<string, MarkedFile> {
    return this.markedFiles;
  }

  // Cleanup resources
  public dispose(): void {
    this._onDidChangeFileDecorations.dispose();
  }
}
