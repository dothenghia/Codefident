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
    constructor(context) {
        this.context = context;
        this.markedFiles = new Map();
        this._onDidChangeFileDecorations = new vscode.EventEmitter();
        // Initialize file decoration provider
        this.fileDecorationProvider = this.createFileDecorationProvider();
        context.subscriptions.push(vscode.window.registerFileDecorationProvider(this.fileDecorationProvider), this._onDidChangeFileDecorations);
        // Listen for file changes
        context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((e) => {
            const filePath = e.document.uri.fsPath;
            if (this.markedFiles.has(filePath)) {
                this.handleFileChange(filePath);
            }
        }));
        // Listen for configuration changes
        context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration(constants_1.CONFIG_KEYS.REVIEWED_FILE_ICON) ||
                e.affectsConfiguration(constants_1.CONFIG_KEYS.CHANGED_FILE_ICON)) {
                this._onDidChangeFileDecorations.fire(vscode.Uri.file(""));
            }
        }));
    }
    // Create and configure file decoration provider
    createFileDecorationProvider() {
        return {
            onDidChangeFileDecorations: this._onDidChangeFileDecorations.event,
            provideFileDecoration: async (uri) => {
                const filePath = uri.fsPath;
                const markedFile = this.markedFiles.get(filePath);
                if (!markedFile) {
                    return undefined;
                }
                const config = vscode.workspace.getConfiguration();
                const stats = await vscode.workspace.fs.stat(uri);
                const isModified = stats.mtime > markedFile.lastModified;
                if (isModified) {
                    const changedFileIcon = config.get(constants_1.CONFIG_KEYS.CHANGED_FILE_ICON) ||
                        constants_1.DEFAULTS.CHANGED_FILE_BADGE;
                    return {
                        badge: changedFileIcon.charAt(0),
                        tooltip: constants_1.DEFAULTS.CHANGED_FILE_TOOLTIP,
                    };
                }
                else {
                    const reviewedFileIcon = config.get(constants_1.CONFIG_KEYS.REVIEWED_FILE_ICON) ||
                        constants_1.DEFAULTS.REVIEWED_FILE_BADGE;
                    return {
                        badge: reviewedFileIcon.charAt(0),
                        tooltip: constants_1.DEFAULTS.REVIEWED_FILE_TOOLTIP,
                    };
                }
            },
        };
    }
    // Handle file content changes
    async handleFileChange(filePath) {
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
    async toggleFile(fileUri) {
        let targetUri;
        if (fileUri) {
            targetUri = fileUri;
        }
        else {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            targetUri = editor.document.uri;
        }
        const filePath = targetUri.fsPath;
        if (this.markedFiles.has(filePath)) {
            await this.unmarkFile(filePath);
        }
        else {
            await this.markFile(filePath);
        }
    }
    // Mark a file as reviewed
    async markFile(filePath) {
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
    async unmarkFile(filePath) {
        this.markedFiles.delete(filePath);
        await this.saveState();
        this._onDidChangeFileDecorations.fire(vscode.Uri.file(filePath));
    }
    // Clear all file marks in the project
    async clearAllFileMarksInProject() {
        const markedFilesCount = this.markedFiles.size;
        if (markedFilesCount === 0) {
            vscode.window.showInformationMessage(constants_1.MESSAGES.NO_MARKED_FILES);
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
        vscode.window.showInformationMessage(constants_1.MESSAGES.ALL_FILE_MARKS_RESET.replace("{count}", markedFilesCount.toString()));
    }
    // Save file marks state to workspace storage
    async saveState() {
        const markedFilesData = Array.from(this.markedFiles.values());
        await this.context.workspaceState.update(constants_1.STORAGE_KEYS.MARKED_FILES, markedFilesData);
    }
    // Restore file marks state from workspace storage
    async restoreState() {
        const markedFilesData = this.context.workspaceState.get(constants_1.STORAGE_KEYS.MARKED_FILES, []);
        this.markedFiles = new Map(markedFilesData.map((file) => [file.path, file]));
    }
    // Get all marked files
    getMarkedFiles() {
        return this.markedFiles;
    }
    // Cleanup resources
    dispose() {
        this._onDidChangeFileDecorations.dispose();
    }
}
exports.FileMarker = FileMarker;
//# sourceMappingURL=file.js.map