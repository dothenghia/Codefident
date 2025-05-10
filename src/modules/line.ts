import * as vscode from "vscode";
import {
  STORAGE_KEYS,
  CONFIG_KEYS,
  DEFAULTS,
  MESSAGES,
  LineMarkStyle,
} from "../constants/constants";

// Interface for line decoration data
export interface MarkedDecoration {
  range: vscode.Range;
}

export class LineMarker {
  // Map of file paths to their decoration types
  private lineDecorationTypes: Map<string, vscode.TextEditorDecorationType>;
  // Map of file paths to their marked line ranges
  private markedLines: Map<string, MarkedDecoration[]>;
  // VS Code extension context
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.lineDecorationTypes = new Map();
    this.markedLines = new Map();
  }

  // Get all marked lines across files
  public getMarkedLines(): Map<string, MarkedDecoration[]> {
    return this.markedLines;
  }

  // Get or create decoration type for a file
  private getDecorationTypeForFile(
    filePath: string
  ): vscode.TextEditorDecorationType {
    if (!this.lineDecorationTypes.has(filePath)) {
      const config = vscode.workspace.getConfiguration();
      const style =
        config.get<string>(CONFIG_KEYS.LINE_MARK_STYLE) ||
        DEFAULTS.LINE_MARK_STYLE;

      let decorationRenderOptions: vscode.DecorationRenderOptions;

      if (style === LineMarkStyle.INLINE) {
        const highlightColor =
          config.get<string>(CONFIG_KEYS.HIGHLIGHT_COLOR) ||
          DEFAULTS.HIGHLIGHT_COLOR;
        decorationRenderOptions = {
          backgroundColor: highlightColor,
          isWholeLine: true,
        };
      } else {
        // LineMarkStyle.SIDEBAR
        const sidebarColor =
          config.get<string>(CONFIG_KEYS.SIDEBAR_COLOR) ||
          DEFAULTS.SIDEBAR_COLOR;
        decorationRenderOptions = {
          border: `2px solid ${sidebarColor}`,
          borderStyle: "none none none solid",
          isWholeLine: true,
        };
      }

      const decorationType = vscode.window.createTextEditorDecorationType(
        decorationRenderOptions
      );
      this.lineDecorationTypes.set(filePath, decorationType);
    }
    return this.lineDecorationTypes.get(filePath)!;
  }

  // Apply decorations to the current editor
  public applyDecorations(editor: vscode.TextEditor): void {
    const filePath = editor.document.uri.fsPath;
    const decorations = this.markedLines.get(filePath) || [];
    const decorationType = this.getDecorationTypeForFile(filePath);
    editor.setDecorations(decorationType, decorations);
  }

  // Toggle review marks for selected lines
  public async toggleSelectedLines(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const filePath = editor.document.uri.fsPath;
    const existingDecorations = this.markedLines.get(filePath) || [];

    // Get the selected lines
    const selectedRanges = editor.selections.map((selection) => ({
      range: new vscode.Range(
        selection.start.line,
        0,
        selection.end.line,
        editor.document.lineAt(selection.end.line).text.length
      ),
    }));

    // Check if all selected lines are already marked
    const allSelectedLinesMarked = selectedRanges.every((selectedRange) =>
      existingDecorations.some(
        (decoration) =>
          decoration.range.start.line <= selectedRange.range.start.line &&
          decoration.range.end.line >= selectedRange.range.end.line
      )
    );

    if (allSelectedLinesMarked) {
      await this.unmarkSelectedLines();
    } else {
      await this.markSelectedLines();
    }
  }

  // Mark selected lines as reviewed
  private async markSelectedLines(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const filePath = editor.document.uri.fsPath;
    const existingDecorations = this.markedLines.get(filePath) || [];

    // Get the selected lines
    const selectedRanges = editor.selections.map((selection) => ({
      range: new vscode.Range(
        selection.start.line,
        0,
        selection.end.line,
        editor.document.lineAt(selection.end.line).text.length
      ),
    }));

    // Create a set of all marked line numbers for quick lookup
    const markedLineNumbers = new Set<number>();
    existingDecorations.forEach((decoration) => {
      for (
        let i = decoration.range.start.line;
        i <= decoration.range.end.line;
        i++
      ) {
        markedLineNumbers.add(i);
      }
    });

    // Process each selected line individually to ensure no duplicates
    const newDecorations: MarkedDecoration[] = [];
    for (const selection of selectedRanges) {
      for (
        let line = selection.range.start.line;
        line <= selection.range.end.line;
        line++
      ) {
        if (!markedLineNumbers.has(line)) {
          markedLineNumbers.add(line);
          newDecorations.push({
            range: new vscode.Range(
              line,
              0,
              line,
              editor.document.lineAt(line).text.length
            ),
          });
        }
      }
    }

    if (newDecorations.length === 0) {
      return;
    }

    // Combine existing and new decorations, ensuring no overlaps
    const combinedDecorations = [...existingDecorations, ...newDecorations];

    // Sort decorations by line number for better organization
    combinedDecorations.sort((a, b) => a.range.start.line - b.range.start.line);

    // Merge adjacent or overlapping ranges
    const mergedDecorations: MarkedDecoration[] = [];
    let currentDecoration = combinedDecorations[0];

    for (let i = 1; i < combinedDecorations.length; i++) {
      const nextDecoration = combinedDecorations[i];

      // If current and next decorations are adjacent or overlapping
      if (
        currentDecoration.range.end.line + 1 >=
        nextDecoration.range.start.line
      ) {
        // Merge them by extending the current decoration
        currentDecoration = {
          range: new vscode.Range(
            currentDecoration.range.start.line,
            0,
            Math.max(
              currentDecoration.range.end.line,
              nextDecoration.range.end.line
            ),
            editor.document.lineAt(
              Math.max(
                currentDecoration.range.end.line,
                nextDecoration.range.end.line
              )
            ).text.length
          ),
        };
      } else {
        // If not adjacent, add current to merged list and move to next
        mergedDecorations.push(currentDecoration);
        currentDecoration = nextDecoration;
      }
    }
    mergedDecorations.push(currentDecoration);

    // Update the stored decorations
    this.markedLines.set(filePath, mergedDecorations);

    // Apply decorations
    const decorationType = this.getDecorationTypeForFile(filePath);
    editor.setDecorations(decorationType, mergedDecorations);

    await this.saveState();
  }

  // Remove review marks from selected lines
  private async unmarkSelectedLines(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const filePath = editor.document.uri.fsPath;
    const existingDecorations = this.markedLines.get(filePath) || [];

    // Create a set of lines to unmark
    const linesToUnmark = new Set<number>();
    editor.selections.forEach((selection) => {
      for (
        let line = selection.start.line;
        line <= selection.end.line;
        line++
      ) {
        linesToUnmark.add(line);
      }
    });

    // Process each existing decoration
    const newDecorations: MarkedDecoration[] = [];
    existingDecorations.forEach((decoration) => {
      let currentStart = decoration.range.start.line;
      let currentEnd = decoration.range.start.line - 1; // Initialize to invalid range

      // Process each line in the decoration
      for (
        let line = decoration.range.start.line;
        line <= decoration.range.end.line;
        line++
      ) {
        if (!linesToUnmark.has(line)) {
          // If this line should be kept
          currentEnd = line;
        } else if (currentEnd >= currentStart) {
          // If we have a valid range to keep
          newDecorations.push({
            range: new vscode.Range(
              currentStart,
              0,
              currentEnd,
              editor.document.lineAt(currentEnd).text.length
            ),
          });
          currentStart = line + 1;
          currentEnd = line;
        } else {
          currentStart = line + 1;
        }
      }

      // Add the final range if it's valid
      if (currentEnd >= currentStart) {
        newDecorations.push({
          range: new vscode.Range(
            currentStart,
            0,
            currentEnd,
            editor.document.lineAt(currentEnd).text.length
          ),
        });
      }
    });

    // Update decorations
    this.markedLines.set(filePath, newDecorations);
    const decorationType = this.getDecorationTypeForFile(filePath);
    editor.setDecorations(decorationType, newDecorations);

    await this.saveState();
  }

  // Clear all line marks in current file
  public async clearAllLineMarksInFile(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const filePath = editor.document.uri.fsPath;
    const decorationType = this.getDecorationTypeForFile(filePath);

    this.markedLines.delete(filePath);
    editor.setDecorations(decorationType, []);

    await this.saveState();
    vscode.window.showInformationMessage(MESSAGES.ALL_LINE_MARKS_REMOVED);
  }

  // Clear all line marks in the project
  public async clearAllLineMarksInProject(): Promise<void> {
    const filesWithMarks = Array.from(this.markedLines.keys());
    if (filesWithMarks.length === 0) {
      vscode.window.showInformationMessage(MESSAGES.NO_MARKED_LINES);
      return;
    }

    this.markedLines.clear();

    // Clear decorations for all open editors
    vscode.window.visibleTextEditors.forEach((editor) => {
      const filePath = editor.document.uri.fsPath;
      const decorationType = this.getDecorationTypeForFile(filePath);
      editor.setDecorations(decorationType, []);
    });

    await this.saveState();
    vscode.window.showInformationMessage(
      MESSAGES.ALL_LINE_MARKS_RESET.replace(
        "{count}",
        filesWithMarks.length.toString()
      )
    );
  }

  // Save line marks state to workspace storage
  private async saveState(): Promise<void> {
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
      STORAGE_KEYS.MARKED_LINES,
      markedLinesMap
    );
  }

  // Restore line marks state from workspace storage
  public async restoreState(): Promise<void> {
    const markedLinesMap = this.context.workspaceState.get<{
      [key: string]: Array<{ startLine: number; endLine: number }>;
    }>(STORAGE_KEYS.MARKED_LINES, {});

    for (const [filePath, ranges] of Object.entries(markedLinesMap)) {
      const decorations: MarkedDecoration[] = ranges.map((range) => ({
        range: new vscode.Range(
          range.startLine,
          0,
          range.endLine,
          Number.MAX_SAFE_INTEGER
        ),
      }));

      this.markedLines.set(filePath, decorations);
    }

    vscode.window.visibleTextEditors.forEach((editor) => {
      this.applyDecorations(editor);
    });
  }

  // Cleanup resources
  public dispose(): void {
    this.lineDecorationTypes.forEach((decorationType) =>
      decorationType.dispose()
    );
    this.lineDecorationTypes.clear();
  }
}
