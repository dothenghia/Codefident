"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileMarker = void 0;
const vscode = __importStar(require("vscode"));
const constants_1 = require("../constants/constants");
class FileMarker {
    markedFiles;
    context;
    fileDecorationProvider;
    _onDidChangeFileDecorations;
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
    async toggleFile() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const filePath = editor.document.uri.fsPath;
        if (this.markedFiles.has(filePath)) {
            // If file is already marked, unmark it
            this.unmarkFile();
        }
        else {
            // If file is not marked, mark it
            this.markFile();
        }
    }
    // Mark current file
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
    // Unmark current file
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
    // Reset all file marks in the project (workspace)
    async clearAllFileMarksInDirectory() {
        // Count how many files are marked
        const markedFilesCount = this.markedFiles.size;
        if (markedFilesCount === 0) {
            vscode.window.showInformationMessage(constants_1.MESSAGES.NO_MARKED_FILES);
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
        vscode.window.showInformationMessage(constants_1.MESSAGES.ALL_FILE_MARKS_RESET.replace("{count}", markedFilesCount.toString()));
    }
    getStorageKeyForMarkedFiles() {
        return constants_1.STORAGE_KEYS.MARKED_FILES;
    }
    async saveState() {
        // Save marked files
        await this.context.workspaceState.update(this.getStorageKeyForMarkedFiles(), Array.from(this.markedFiles));
    }
    async restoreState() {
        // Restore marked files
        const markedFilesData = this.context.workspaceState.get(this.getStorageKeyForMarkedFiles(), []);
        this.markedFiles = new Set(markedFilesData);
    }
    dispose() {
        this._onDidChangeFileDecorations.dispose();
    }
}
exports.FileMarker = FileMarker;
//# sourceMappingURL=file.js.map