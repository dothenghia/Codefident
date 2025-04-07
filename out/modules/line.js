"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineMarker = void 0;
const vscode = require("vscode");
const constants_1 = require("../constants/constants");
class LineMarker {
    constructor(context) {
        this.context = context;
        this.lineDecorationTypes = new Map();
        this.markedLines = new Map();
    }
    getMarkedLines() {
        return this.markedLines;
    }
    setMarkedLines(markedLines) {
        this.markedLines = markedLines;
    }
    getDecorationTypeForFile(filePath) {
        if (!this.lineDecorationTypes.has(filePath)) {
            const config = vscode.workspace.getConfiguration("line-marker");
            const highlightColor = config.get(constants_1.CONFIG_KEYS.HIGHLIGHT_COLOR) ||
                constants_1.DEFAULTS.HIGHLIGHT_COLOR;
            const decorationType = vscode.window.createTextEditorDecorationType({
                backgroundColor: highlightColor,
                isWholeLine: true,
            });
            this.lineDecorationTypes.set(filePath, decorationType);
        }
        return this.lineDecorationTypes.get(filePath);
    }
    applyDecorations(editor) {
        const filePath = editor.document.uri.fsPath;
        const decorations = this.markedLines.get(filePath) || [];
        const decorationType = this.getDecorationTypeForFile(filePath);
        editor.setDecorations(decorationType, decorations);
    }
    // Toggle mark for selected lines
    toggleSelectedLines() {
        return __awaiter(this, void 0, void 0, function* () {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            const filePath = editor.document.uri.fsPath;
            const decorationType = this.getDecorationTypeForFile(filePath);
            const existingDecorations = this.markedLines.get(filePath) || [];
            // Get the selected lines
            const selectedRanges = editor.selections.map((selection) => ({
                range: new vscode.Range(selection.start.line, 0, selection.end.line, editor.document.lineAt(selection.end.line).text.length),
            }));
            // Check if all selected lines are already marked
            const allSelectedLinesMarked = selectedRanges.every((selectedRange) => {
                return existingDecorations.some((decoration) => {
                    return (decoration.range.start.line <= selectedRange.range.start.line &&
                        decoration.range.end.line >= selectedRange.range.end.line);
                });
            });
            if (allSelectedLinesMarked) {
                // If all selected lines are marked, unmark them
                this.unmarkSelectedLines();
            }
            else {
                // If not all selected lines are marked, mark them
                this.markSelectedLines();
            }
        });
    }
    // Mark selected lines
    markSelectedLines() {
        return __awaiter(this, void 0, void 0, function* () {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            const filePath = editor.document.uri.fsPath;
            const decorationType = this.getDecorationTypeForFile(filePath);
            const existingDecorations = this.markedLines.get(filePath) || [];
            // Get the selected lines
            const selectedRanges = editor.selections.map((selection) => ({
                range: new vscode.Range(selection.start.line, 0, selection.end.line, editor.document.lineAt(selection.end.line).text.length),
            }));
            // Create a set of all marked line numbers for quick lookup
            const markedLineNumbers = new Set();
            existingDecorations.forEach((decoration) => {
                for (let i = decoration.range.start.line; i <= decoration.range.end.line; i++) {
                    markedLineNumbers.add(i);
                }
            });
            // Filter out selected ranges that are already marked
            const newRanges = selectedRanges.filter((selectedRange) => {
                for (let i = selectedRange.range.start.line; i <= selectedRange.range.end.line; i++) {
                    if (!markedLineNumbers.has(i)) {
                        return true; // At least one line in this range is not marked
                    }
                }
                return false; // All lines in this range are already marked
            });
            if (newRanges.length === 0) {
                // All selected lines are already marked
                return;
            }
            // Combine existing and new decorations
            const combinedDecorations = [...existingDecorations, ...newRanges];
            this.markedLines.set(filePath, combinedDecorations);
            // Apply decorations to editor
            editor.setDecorations(decorationType, combinedDecorations);
            // Save state
            yield this.saveState();
        });
    }
    // Unmark selected lines
    unmarkSelectedLines() {
        return __awaiter(this, void 0, void 0, function* () {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            const filePath = editor.document.uri.fsPath;
            const existingDecorations = this.markedLines.get(filePath) || [];
            const decorationType = this.getDecorationTypeForFile(filePath);
            // Get the selected lines to unmark
            const selectedRanges = editor.selections.map((selection) => new vscode.Range(selection.start.line, 0, selection.end.line, editor.document.lineAt(selection.end.line).text.length));
            // Filter out the decorations that overlap with the selected ranges
            const remainingDecorations = existingDecorations.filter((decoration) => {
                // Check if the decoration overlaps with any of the selected ranges
                return !selectedRanges.some((range) => decoration.range.intersection(range) !== undefined);
            });
            // Update markedLines and apply decorations
            this.markedLines.set(filePath, remainingDecorations);
            editor.setDecorations(decorationType, remainingDecorations);
            // Save state
            yield this.saveState();
        });
    }
    // Remove all line marks in the current file
    clearAllLineMarksInFile() {
        return __awaiter(this, void 0, void 0, function* () {
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
            yield this.saveState();
            vscode.window.showInformationMessage(constants_1.MESSAGES.ALL_LINE_MARKS_REMOVED);
        });
    }
    // Reset all line marks in the project (workspace)
    clearAllLineMarksInDirectory() {
        return __awaiter(this, void 0, void 0, function* () {
            // Get all workspace folders
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showInformationMessage(constants_1.MESSAGES.NO_WORKSPACE_FOLDERS);
                return;
            }
            // Count how many files have marked lines
            const filesWithMarks = Array.from(this.markedLines.keys());
            if (filesWithMarks.length === 0) {
                vscode.window.showInformationMessage(constants_1.MESSAGES.NO_MARKED_LINES);
                return;
            }
            // Clear all line decorations
            this.markedLines.clear();
            // Clear decorations for all open editors
            vscode.window.visibleTextEditors.forEach((editor) => {
                const filePath = editor.document.uri.fsPath;
                const decorationType = this.getDecorationTypeForFile(filePath);
                editor.setDecorations(decorationType, []);
            });
            // Save state
            yield this.saveState();
            vscode.window.showInformationMessage(constants_1.MESSAGES.ALL_LINE_MARKS_RESET.replace("{count}", filesWithMarks.length.toString()));
        });
    }
    getStorageKeyForMarkedLines() {
        return constants_1.STORAGE_KEYS.MARKED_LINES;
    }
    saveState() {
        return __awaiter(this, void 0, void 0, function* () {
            // Save line decorations
            const markedLinesMap = {};
            for (const [filePath, decorations] of this.markedLines.entries()) {
                markedLinesMap[filePath] = decorations.map((decoration) => ({
                    startLine: decoration.range.start.line,
                    endLine: decoration.range.end.line,
                }));
            }
            yield this.context.workspaceState.update(this.getStorageKeyForMarkedLines(), markedLinesMap);
        });
    }
    restoreState() {
        return __awaiter(this, void 0, void 0, function* () {
            // Restore line decorations
            const markedLinesMap = this.context.workspaceState.get(this.getStorageKeyForMarkedLines(), {});
            for (const [filePath, ranges] of Object.entries(markedLinesMap)) {
                const decorations = [];
                for (const range of ranges) {
                    decorations.push({
                        range: new vscode.Range(range.startLine, 0, range.endLine, Number.MAX_SAFE_INTEGER),
                    });
                }
                this.markedLines.set(filePath, decorations);
            }
        });
    }
    dispose() {
        this.lineDecorationTypes.forEach((decorationType) => decorationType.dispose());
        this.lineDecorationTypes.clear();
    }
}
exports.LineMarker = LineMarker;
//# sourceMappingURL=line.js.map