import * as vscode from "vscode";
import {
  STORAGE_KEYS,
  CONFIG_KEYS,
  DEFAULTS,
  MESSAGES,
} from "../constants/constants";
import { FileMarker } from "./file";

export class DirectoryMarker {
  // Set of marked directory paths
  private markedDirectories: Set<string>;
  // VS Code extension context
  private context: vscode.ExtensionContext;
  // Directory decoration provider for UI
  private directoryDecorationProvider: vscode.FileDecorationProvider;
  // Event emitter for directory decoration changes
  private _onDidChangeFileDecorations: vscode.EventEmitter<
    vscode.Uri | vscode.Uri[]
  >;
  // Reference to FileMarker for marking/unmarking files
  private fileMarker: FileMarker;

  constructor(context: vscode.ExtensionContext, fileMarker: FileMarker) {
    this.context = context;
    this.markedDirectories = new Set();
    this.fileMarker = fileMarker;
    this._onDidChangeFileDecorations = new vscode.EventEmitter<
      vscode.Uri | vscode.Uri[]
    >();

    // Initialize directory decoration provider
    this.directoryDecorationProvider = this.createDirectoryDecorationProvider();
    context.subscriptions.push(
      vscode.window.registerFileDecorationProvider(
        this.directoryDecorationProvider
      ),
      this._onDidChangeFileDecorations
    );

    // Listen for configuration changes
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(CONFIG_KEYS.REVIEWED_DIRECTORY_ICON)) {
          this._onDidChangeFileDecorations.fire(vscode.Uri.file(""));
        }
      })
    );
  }

  // Create and configure directory decoration provider
  private createDirectoryDecorationProvider(): vscode.FileDecorationProvider {
    return {
      onDidChangeFileDecorations: this._onDidChangeFileDecorations.event,
      provideFileDecoration: (uri: vscode.Uri) => {
        if (!this.isDirectory(uri)) {
          return undefined;
        }

        const dirPath = uri.fsPath;
        if (this.markedDirectories.has(dirPath)) {
          const config = vscode.workspace.getConfiguration();
          const directoryIcon =
            config.get<string>(CONFIG_KEYS.REVIEWED_DIRECTORY_ICON) ||
            DEFAULTS.REVIEWED_DIRECTORY_BADGE;

          return {
            badge: directoryIcon.charAt(0),
            tooltip: DEFAULTS.REVIEWED_DIRECTORY_TOOLTIP,
          };
        }
        return undefined;
      },
    };
  }

  // Check if a URI points to a directory
  private async isDirectory(uri: vscode.Uri): Promise<boolean> {
    try {
      const stat = await vscode.workspace.fs.stat(uri);
      return (
        (stat.type & vscode.FileType.Directory) === vscode.FileType.Directory
      );
    } catch {
      return false;
    }
  }

  // Toggle review mark for a directory
  public async toggleDirectory(directoryUri?: vscode.Uri): Promise<void> {
    if (!directoryUri) {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showInformationMessage(MESSAGES.NO_WORKSPACE_FOLDERS);
        return;
      }
      directoryUri = workspaceFolders[0].uri;
    }

    const dirPath = directoryUri.fsPath;

    if (this.markedDirectories.has(dirPath)) {
      await this.unmarkDirectory(dirPath);
    } else {
      await this.markDirectory(dirPath);
    }
  }

  // Mark a directory and all its children as reviewed
  private async markDirectory(dirPath: string): Promise<void> {
    // Mark the directory itself
    this.markedDirectories.add(dirPath);

    // Mark all children (files and subdirectories) recursively
    const uri = vscode.Uri.file(dirPath);
    await this.markChildren(uri);

    // Save state after marking all children
    await this.saveState();

    // Notify about changes for the directory and all its subdirectories
    const allMarkedDirs = Array.from(this.markedDirectories);
    this._onDidChangeFileDecorations.fire(
      allMarkedDirs.map((dir) => vscode.Uri.file(dir))
    );
  }

  // Recursively mark all children (files and subdirectories)
  private async markChildren(uri: vscode.Uri): Promise<void> {
    try {
      const entries = await vscode.workspace.fs.readDirectory(uri);
      for (const [name, type] of entries) {
        const childUri = vscode.Uri.joinPath(uri, name);

        if (type === vscode.FileType.Directory) {
          // Mark subdirectory and its children
          const subDirPath = childUri.fsPath;
          this.markedDirectories.add(subDirPath);
          await this.markChildren(childUri);
        } else if (type === vscode.FileType.File) {
          // Mark file directly
          const filePath = childUri.fsPath;
          await this.fileMarker.markFile(filePath);
        }
      }
    } catch (error) {
      console.error(`Error marking children: ${error}`);
    }
  }

  // Remove review mark from a directory and all its children
  private async unmarkDirectory(dirPath: string): Promise<void> {
    // Unmark the directory itself
    this.markedDirectories.delete(dirPath);

    // Collect all directories to be unmarked (parent + all subdirectories)
    const dirsToUnmark: string[] = [dirPath];
    async function collectSubDirs(uri: vscode.Uri) {
      try {
        const entries = await vscode.workspace.fs.readDirectory(uri);
        for (const [name, type] of entries) {
          const childUri = vscode.Uri.joinPath(uri, name);
          if (type === vscode.FileType.Directory) {
            dirsToUnmark.push(childUri.fsPath);
            await collectSubDirs(childUri);
          }
        }
      } catch {}
    }
    await collectSubDirs(vscode.Uri.file(dirPath));

    // Unmark all children (files and subdirectories) recursively
    const uri = vscode.Uri.file(dirPath);
    await this.unmarkChildren(uri);

    // Save state after unmarking all children
    await this.saveState();
    
    // Notify about changes for all directories that were just unmarked
    this._onDidChangeFileDecorations.fire(
      dirsToUnmark.map(dir => vscode.Uri.file(dir))
    );
  }

  // Recursively unmark all children (files and subdirectories)
  private async unmarkChildren(uri: vscode.Uri): Promise<void> {
    try {
      const entries = await vscode.workspace.fs.readDirectory(uri);
      for (const [name, type] of entries) {
        const childUri = vscode.Uri.joinPath(uri, name);

        if (type === vscode.FileType.Directory) {
          // Unmark subdirectory and its children
          const subDirPath = childUri.fsPath;
          this.markedDirectories.delete(subDirPath);
          await this.unmarkChildren(childUri);
        } else if (type === vscode.FileType.File) {
          // Unmark file directly
          const filePath = childUri.fsPath;
          await this.fileMarker.unmarkFile(filePath);
        }
      }
    } catch (error) {
      console.error(`Error unmarking children: ${error}`);
    }
  }

  // Clear all directory marks in the project
  public async clearAllDirectoryMarksInProject(): Promise<void> {
    const markedDirectoriesCount = this.markedDirectories.size;
    if (markedDirectoriesCount === 0) {
      vscode.window.showInformationMessage(MESSAGES.NO_MARKED_DIRECTORIES);
      return;
    }

    // Store marked directories before clearing
    const markedDirectoriesArray = Array.from(this.markedDirectories);

    // Clear all directory marks
    this.markedDirectories.clear();
    await this.saveState();

    // Notify about changes
    markedDirectoriesArray.forEach((dirPath) => {
      this._onDidChangeFileDecorations.fire(vscode.Uri.file(dirPath));
    });

    vscode.window.showInformationMessage(
      MESSAGES.ALL_DIRECTORY_MARKS_RESET.replace(
        "{count}",
        markedDirectoriesCount.toString()
      )
    );
  }

  // Save directory marks state to workspace storage
  private async saveState(): Promise<void> {
    await this.context.workspaceState.update(
      STORAGE_KEYS.MARKED_DIRECTORIES,
      Array.from(this.markedDirectories)
    );
  }

  // Restore directory marks state from workspace storage
  public async restoreState(): Promise<void> {
    const markedDirectoriesData = this.context.workspaceState.get<string[]>(
      STORAGE_KEYS.MARKED_DIRECTORIES,
      []
    );
    this.markedDirectories = new Set(markedDirectoriesData);
  }

  // Get all marked directories
  public getMarkedDirectories(): Set<string> {
    return this.markedDirectories;
  }

  // Cleanup resources
  public dispose(): void {
    this._onDidChangeFileDecorations.dispose();
  }
}
