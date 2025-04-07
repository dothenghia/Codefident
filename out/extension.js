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
const constants_1 = require("./constants/constants");
const WELCOME_MESSAGES = [
    "[Line Marker] Happy Coding! 🥰",
    "[Line Marker] Have a nice day! 👋",
    "[Line Marker] Let's write some awesome code! ✨",
    "[Line Marker] Time to be productive! 💪",
    "[Line Marker] You're doing great! 🌟",
    "[Line Marker] Code with confidence! 💻",
    "[Line Marker] Ready to mark some code? 📝",
    "[Line Marker] Let's make something amazing! 🚀",
];
function activate(context) {
    // Show random welcome message
    const randomMessage = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
    vscode.window.showInformationMessage(randomMessage);
    // Initialize line and file markers
    const lineMarker = new line_1.LineMarker(context);
    const fileMarker = new file_1.FileMarker(context);
    // Restore state
    lineMarker.restoreState();
    fileMarker.restoreState();
    // Register commands
    const toggleSelectedLinesCommand = vscode.commands.registerCommand(constants_1.COMMANDS.TOGGLE_SELECTED_LINES, async () => {
        await lineMarker.toggleSelectedLines();
    });
    const toggleFileCommand = vscode.commands.registerCommand(constants_1.COMMANDS.TOGGLE_FILE, async () => {
        await fileMarker.toggleFile();
    });
    const clearAllLineMarksInFileCommand = vscode.commands.registerCommand(constants_1.COMMANDS.CLEAR_ALL_LINE_MARKS_IN_FILE, async () => {
        await lineMarker.clearAllLineMarksInFile();
    });
    const clearAllLineMarksInDirectoryCommand = vscode.commands.registerCommand(constants_1.COMMANDS.CLEAR_ALL_LINE_MARKS_IN_DIRECTORY, async () => {
        await lineMarker.clearAllLineMarksInDirectory();
    });
    const clearAllFileMarksInDirectoryCommand = vscode.commands.registerCommand(constants_1.COMMANDS.CLEAR_ALL_FILE_MARKS_IN_DIRECTORY, async () => {
        await fileMarker.clearAllFileMarksInDirectory();
    });
    // Register context menu providers
    const editorContextMenuProvider = vscode.window.registerWebviewViewProvider("line-marker.editorContextMenu", {
        resolveWebviewView: (webviewView) => {
            webviewView.webview.options = {
                enableScripts: true,
                localResourceRoots: [],
            };
        },
    });
    const explorerContextMenuProvider = vscode.window.registerWebviewViewProvider("line-marker.explorerContextMenu", {
        resolveWebviewView: (webviewView) => {
            webviewView.webview.options = {
                enableScripts: true,
                localResourceRoots: [],
            };
        },
    });
    // Register event listeners
    const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
            lineMarker.applyDecorations(editor);
        }
    });
    // Add all subscriptions to the extension's subscriptions
    context.subscriptions.push(toggleSelectedLinesCommand, toggleFileCommand, clearAllLineMarksInFileCommand, clearAllLineMarksInDirectoryCommand, clearAllFileMarksInDirectoryCommand, editorContextMenuProvider, explorerContextMenuProvider, onDidChangeActiveTextEditor, lineMarker, fileMarker);
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() {
    // Show goodbye message
    vscode.window.showInformationMessage("[Line Marker] Noooo, please use me 🥺💔");
    // Cleanup is handled by the dispose methods of LineMarker and FileMarker
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map