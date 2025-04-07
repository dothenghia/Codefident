// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

interface MarkedDecoration {
  range: vscode.Range;
}

class LineMarkerManager {
  private context: vscode.ExtensionContext;
  private lineDecorationTypes: Map<string, vscode.TextEditorDecorationType>;
  private markedLines: Map<string, MarkedDecoration[]>;
  private markedFiles: Set<string>;
  private fileDecorationProvider: vscode.FileDecorationProvider;
  private _onDidChangeFileDecorations: vscode.EventEmitter<
    vscode.Uri | vscode.Uri[]
  >;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.lineDecorationTypes = new Map();
    this.markedLines = new Map();
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

    // Register event handlers
    context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
          this.applyDecorations(editor);
        }
      })
    );

    // Restore state
    this.restoreState();

    // Apply decorations to all visible editors
    vscode.window.visibleTextEditors.forEach((editor) => {
      this.applyDecorations(editor);
    });
  }

  private createFileDecorationProvider(): vscode.FileDecorationProvider {
    return {
      onDidChangeFileDecorations: this._onDidChangeFileDecorations.event,
      provideFileDecoration: (uri: vscode.Uri) => {
        if (this.markedFiles.has(uri.fsPath)) {
          return {
            badge: "✓",
            tooltip: "Reviewed",
          };
        }
        return undefined;
      },
    };
  }

  private getDecorationTypeForFile(
    filePath: string
  ): vscode.TextEditorDecorationType {
    if (!this.lineDecorationTypes.has(filePath)) {
      const config = vscode.workspace.getConfiguration("line-marker");
      const highlightColor =
        config.get<string>("highlightColor") || "rgba(0, 122, 204, 0.2)";

      const decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: highlightColor,
        isWholeLine: true,
      });
      this.lineDecorationTypes.set(filePath, decorationType);
    }
    return this.lineDecorationTypes.get(filePath)!;
  }

  private getStorageKeyForMarkedLines(): string {
    return "line-marker:marked-lines";
  }

  private getStorageKeyForMarkedFiles(): string {
    return "line-marker:marked-files";
  }

  private async restoreState() {
    // Restore marked files
    const markedFilesData = this.context.workspaceState.get<string[]>(
      this.getStorageKeyForMarkedFiles(),
      []
    );
    this.markedFiles = new Set(markedFilesData);

    // Restore line decorations
    const markedLinesMap = this.context.workspaceState.get<{
      [key: string]: Array<{ startLine: number; endLine: number }>;
    }>(this.getStorageKeyForMarkedLines(), {});

    for (const [filePath, ranges] of Object.entries(markedLinesMap)) {
      const decorations: MarkedDecoration[] = [];

      for (const range of ranges) {
        decorations.push({
          range: new vscode.Range(
            range.startLine,
            0,
            range.endLine,
            Number.MAX_SAFE_INTEGER
          ),
        });
      }

      this.markedLines.set(filePath, decorations);
    }
  }

  private applyDecorations(editor: vscode.TextEditor) {
    const filePath = editor.document.uri.fsPath;
    const decorations = this.markedLines.get(filePath) || [];
    const decorationType = this.getDecorationTypeForFile(filePath);
    editor.setDecorations(decorationType, decorations);
  }

  private async saveState() {
    // Save marked files
    await this.context.workspaceState.update(
      this.getStorageKeyForMarkedFiles(),
      Array.from(this.markedFiles)
    );

    // Save line decorations
    const markedLinesMap: {
      [key: string]: Array<{ startLine: number; endLine: number }>;
    } = {};

    for (const [filePath, decorations] of this.markedLines.entries()) {
      markedLinesMap[filePath] = decorations.map((decoration) => ({
        startLine: decoration.range.start.line,
        endLine: decoration.range.end.line,
      }));
    }

    await this.context.workspaceState.update(
      this.getStorageKeyForMarkedLines(),
      markedLinesMap
    );
  }

  async markSelectedLines() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const filePath = editor.document.uri.fsPath;
    const decorationType = this.getDecorationTypeForFile(filePath);
    const existingDecorations = this.markedLines.get(filePath) || [];

    const newDecorations = editor.selections.map((selection) => ({
      range: new vscode.Range(
        selection.start.line,
        0,
        selection.end.line,
        editor.document.lineAt(selection.end.line).text.length
      ),
    }));

    // Combine existing and new decorations
    const combinedDecorations = [...existingDecorations, ...newDecorations];
    this.markedLines.set(filePath, combinedDecorations);

    // Apply decorations to editor
    editor.setDecorations(decorationType, combinedDecorations);

    // Save state
    await this.saveState();
  }

  async unmarkSelectedLines() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const filePath = editor.document.uri.fsPath;
    const existingDecorations = this.markedLines.get(filePath) || [];
    const decorationType = this.getDecorationTypeForFile(filePath);

    // Get the selected lines to unmark
    const selectedRanges = editor.selections.map(
      (selection) =>
        new vscode.Range(
          selection.start.line,
          0,
          selection.end.line,
          editor.document.lineAt(selection.end.line).text.length
        )
    );

    // Filter out the decorations that overlap with the selected ranges
    const remainingDecorations = existingDecorations.filter((decoration) => {
      // Check if the decoration overlaps with any of the selected ranges
      return !selectedRanges.some(
        (range) => decoration.range.intersection(range) !== undefined
      );
    });

    // Update markedLines and apply decorations
    this.markedLines.set(filePath, remainingDecorations);
    editor.setDecorations(decorationType, remainingDecorations);

    // Save state
    await this.saveState();
  }

  async markFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const filePath = editor.document.uri.fsPath;
    this.markedFiles.add(filePath);
    await this.saveState();
    this._onDidChangeFileDecorations.fire(editor.document.uri);
  }

  async unmarkFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const filePath = editor.document.uri.fsPath;
    this.markedFiles.delete(filePath);
    await this.saveState();
    this._onDidChangeFileDecorations.fire(editor.document.uri);
  }

  async clearAllMarkedFiles() {
    this.markedFiles.clear();
    await this.saveState();

    // Get all workspace folders
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return;
    }

    // Notify about changes to all workspace folders
    const uris = workspaceFolders.map((folder) => folder.uri);
    this._onDidChangeFileDecorations.fire(uris);

    vscode.window.showInformationMessage("All marked files have been cleared");
  }

  async clearAllLineMarksInFile() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const filePath = editor.document.uri.fsPath;
    const decorationType = this.getDecorationTypeForFile(filePath);

    // Clear decorations for this file
    this.markedLines.delete(filePath);
    editor.setDecorations(decorationType, []);

    // Save state
    await this.saveState();

    vscode.window.showInformationMessage(
      "All marked lines in this file have been cleared"
    );
  }

  dispose() {
    this.lineDecorationTypes.forEach((decorationType) =>
      decorationType.dispose()
    );
    this.lineDecorationTypes.clear();
    this._onDidChangeFileDecorations.dispose();
  }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const lineMarkerManager = new LineMarkerManager(context);

  context.subscriptions.push(
    vscode.commands.registerCommand("line-marker.markSelectedLines", () =>
      lineMarkerManager.markSelectedLines()
    ),
    vscode.commands.registerCommand("line-marker.unmarkSelectedLines", () =>
      lineMarkerManager.unmarkSelectedLines()
    ),
    vscode.commands.registerCommand("line-marker.markFile", () =>
      lineMarkerManager.markFile()
    ),
    vscode.commands.registerCommand("line-marker.unmarkFile", () =>
      lineMarkerManager.unmarkFile()
    ),
    vscode.commands.registerCommand("line-marker.clearAllMarkedFiles", () =>
      lineMarkerManager.clearAllMarkedFiles()
    ),
    vscode.commands.registerCommand("line-marker.clearAllLineMarksInFile", () =>
      lineMarkerManager.clearAllLineMarksInFile()
    )
  );

  return lineMarkerManager;
}

// This method is called when your extension is deactivated
export function deactivate() {}
