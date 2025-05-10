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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const line_1 = require("./modules/line");
const file_1 = require("./modules/file");
const directory_1 = require("./modules/directory");
const statusBar_1 = require("./managers/statusBar");
const constants_1 = require("./constants/constants");
// Main extension activation function
function activate(context) {
    // Show random welcome message
    const randomMessage = constants_1.WELCOME_MESSAGES[Math.floor(Math.random() * constants_1.WELCOME_MESSAGES.length)];
    vscode.window.showInformationMessage(randomMessage);
    // Initialize markers and managers
    const lineMarker = new line_1.LineMarker(context);
    const fileMarker = new file_1.FileMarker(context);
    const directoryMarker = new directory_1.DirectoryMarker(context, fileMarker);
    const statusBarManager = new statusBar_1.StatusBarManager(context);
    // Restore previous session state
    lineMarker.restoreState();
    fileMarker.restoreState();
    directoryMarker.restoreState();
    // Register command handlers
    const toggleSelectedLinesCommand = vscode.commands.registerCommand(constants_1.COMMANDS.TOGGLE_SELECTED_LINES, async () => {
        await lineMarker.toggleSelectedLines();
        updateStats();
    });
    const toggleFileCommand = vscode.commands.registerCommand(constants_1.COMMANDS.TOGGLE_FILE, async (fileUri) => {
        await fileMarker.toggleFile(fileUri);
        updateStats();
    });
    const toggleDirectoryCommand = vscode.commands.registerCommand(constants_1.COMMANDS.TOGGLE_DIRECTORY, async (directoryUri) => {
        await directoryMarker.toggleDirectory(directoryUri);
        updateStats();
    });
    const clearAllLineMarksInFileCommand = vscode.commands.registerCommand(constants_1.COMMANDS.CLEAR_ALL_LINE_MARKS_IN_FILE, async () => {
        await lineMarker.clearAllLineMarksInFile();
        updateStats();
    });
    const clearAllLineMarksInProjectCommand = vscode.commands.registerCommand(constants_1.COMMANDS.CLEAR_ALL_LINE_MARKS_IN_PROJECT, async () => {
        await lineMarker.clearAllLineMarksInProject();
        updateStats();
    });
    const clearAllFileMarksInProjectCommand = vscode.commands.registerCommand(constants_1.COMMANDS.CLEAR_ALL_FILE_MARKS_IN_PROJECT, async () => {
        await fileMarker.clearAllFileMarksInProject();
        updateStats();
    });
    const clearAllDirectoryMarksInProjectCommand = vscode.commands.registerCommand(constants_1.COMMANDS.CLEAR_ALL_DIRECTORY_MARKS_IN_PROJECT, async () => {
        await directoryMarker.clearAllDirectoryMarksInProject();
        updateStats();
    });
    // Register context menu providers
    const editorContextMenuProvider = vscode.window.registerWebviewViewProvider("codefident.editorContextMenu", {
        resolveWebviewView: (webviewView) => {
            webviewView.webview.options = {
                enableScripts: true,
                localResourceRoots: [],
            };
        },
    });
    const explorerContextMenuProvider = vscode.window.registerWebviewViewProvider("codefident.explorerContextMenu", {
        resolveWebviewView: (webviewView) => {
            webviewView.webview.options = {
                enableScripts: true,
                localResourceRoots: [],
            };
        },
    });
    // Track active editor changes
    const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
            lineMarker.applyDecorations(editor);
        }
    });
    // Helper functions
    // Get current review statistics
    function getStats() {
        return {
            markedLines: Array.from(lineMarker.getMarkedLines().values()).reduce((total, decorations) => total +
                decorations.reduce((sum, decoration) => sum +
                    (decoration.range.end.line - decoration.range.start.line + 1), 0), 0),
            markedFiles: fileMarker.getMarkedFiles().size,
            markedDirectories: directoryMarker.getMarkedDirectories().size,
        };
    }
    // Update status bar with current stats
    function updateStats() {
        statusBarManager.updateStats(getStats());
    }
    // Initial stats update
    updateStats();
    // Register disposables
    context.subscriptions.push(toggleSelectedLinesCommand, toggleFileCommand, toggleDirectoryCommand, clearAllLineMarksInFileCommand, clearAllLineMarksInProjectCommand, clearAllFileMarksInProjectCommand, clearAllDirectoryMarksInProjectCommand, onDidChangeActiveTextEditor, editorContextMenuProvider, explorerContextMenuProvider, lineMarker, fileMarker, directoryMarker, statusBarManager);
}
exports.activate = activate;
// Extension deactivation handler
function deactivate() {
    // Cleanup is handled by the dispose methods of each component
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map