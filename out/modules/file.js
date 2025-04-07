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
exports.FileMarker = void 0;
const vscode = require("vscode");
const constants_1 = require("../constants/constants");
class FileMarker {
    constructor(context) {
        this.context = context;
        this.markedFiles = new Set();
        this._onDidChangeFileDecorations = new vscode.EventEmitter();
        // Initialize file decoration provider
        this.fileDecorationProvider = this.createFileDecorationProvider();
        context.subscriptions.push(vscode.window.registerFileDecorationProvider(this.fileDecorationProvider), this._onDidChangeFileDecorations);
        // Listen for configuration changes
        context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration(constants_1.CONFIG_KEYS.FILE_ICON)) {
                this._onDidChangeFileDecorations.fire(vscode.Uri.file(""));
            }
        }));
    }
    getMarkedFiles() {
        return this.markedFiles;
    }
    setMarkedFiles(markedFiles) {
        this.markedFiles = markedFiles;
    }
    createFileDecorationProvider() {
        return {
            onDidChangeFileDecorations: this._onDidChangeFileDecorations.event,
            provideFileDecoration: (uri) => {
                if (this.markedFiles.has(uri.fsPath)) {
                    const config = vscode.workspace.getConfiguration("line-marker");
                    const reviewedFileIcon = config.get(constants_1.CONFIG_KEYS.FILE_ICON) || constants_1.DEFAULTS.FILE_BADGE;
                    // Ensure the icon is only a single character
                    const icon = reviewedFileIcon.length > 0
                        ? reviewedFileIcon.charAt(0)
                        : constants_1.DEFAULTS.FILE_BADGE;
                    return {
                        badge: icon,
                        tooltip: constants_1.DEFAULTS.FILE_TOOLTIP,
                    };
                }
                return undefined;
            },
        };
    }
    // Toggle mark for current file
    toggleFile(fileUri) {
        return __awaiter(this, void 0, void 0, function* () {
            let targetUri;
            if (fileUri) {
                // If a file URI is provided (from Explorer context menu), use it
                targetUri = fileUri;
            }
            else {
                // Otherwise, use the active editor's document URI
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    return;
                }
                targetUri = editor.document.uri;
            }
            const filePath = targetUri.fsPath;
            if (this.markedFiles.has(filePath)) {
                // If file is already marked, unmark it
                this.unmarkFileByPath(filePath);
            }
            else {
                // If file is not marked, mark it
                this.markFileByPath(filePath);
            }
        });
    }
    // Mark file by path
    markFileByPath(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            this.markedFiles.add(filePath);
            yield this.saveState();
            this._onDidChangeFileDecorations.fire(vscode.Uri.file(filePath));
        });
    }
    // Unmark file by path
    unmarkFileByPath(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            this.markedFiles.delete(filePath);
            yield this.saveState();
            this._onDidChangeFileDecorations.fire(vscode.Uri.file(filePath));
        });
    }
    // Mark current file
    markFile() {
        return __awaiter(this, void 0, void 0, function* () {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            const filePath = editor.document.uri.fsPath;
            yield this.markFileByPath(filePath);
        });
    }
    // Unmark current file
    unmarkFile() {
        return __awaiter(this, void 0, void 0, function* () {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            const filePath = editor.document.uri.fsPath;
            yield this.unmarkFileByPath(filePath);
        });
    }
    // Reset all file marks in the project (workspace)
    clearAllFileMarksInDirectory() {
        return __awaiter(this, void 0, void 0, function* () {
            // Count how many files are marked
            const markedFilesCount = this.markedFiles.size;
            if (markedFilesCount === 0) {
                vscode.window.showInformationMessage(constants_1.MESSAGES.NO_MARKED_FILES);
                return;
            }
            // Store the marked files before clearing
            const markedFilesArray = Array.from(this.markedFiles);
            // Clear all file marks
            this.markedFiles.clear();
            // Save state
            yield this.saveState();
            // Notify about changes to all workspace folders
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders) {
                // Notify about changes to all workspace folders
                const uris = workspaceFolders.map((folder) => folder.uri);
                this._onDidChangeFileDecorations.fire(uris);
                // Also notify about changes to each marked file individually
                markedFilesArray.forEach((filePath) => {
                    this._onDidChangeFileDecorations.fire(vscode.Uri.file(filePath));
                });
            }
            vscode.window.showInformationMessage(constants_1.MESSAGES.ALL_FILE_MARKS_RESET.replace("{count}", markedFilesCount.toString()));
        });
    }
    getStorageKeyForMarkedFiles() {
        return constants_1.STORAGE_KEYS.MARKED_FILES;
    }
    saveState() {
        return __awaiter(this, void 0, void 0, function* () {
            // Save marked files
            yield this.context.workspaceState.update(this.getStorageKeyForMarkedFiles(), Array.from(this.markedFiles));
        });
    }
    restoreState() {
        return __awaiter(this, void 0, void 0, function* () {
            // Restore marked files
            const markedFilesData = this.context.workspaceState.get(this.getStorageKeyForMarkedFiles(), []);
            this.markedFiles = new Set(markedFilesData);
        });
    }
    dispose() {
        this._onDidChangeFileDecorations.dispose();
    }
}
exports.FileMarker = FileMarker;
//# sourceMappingURL=file.js.map