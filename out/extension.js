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
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
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
    const toggleSelectedLinesCommand = vscode.commands.registerCommand(constants_1.COMMANDS.TOGGLE_SELECTED_LINES, () => __awaiter(this, void 0, void 0, function* () {
        yield lineMarker.toggleSelectedLines();
    }));
    const toggleFileCommand = vscode.commands.registerCommand(constants_1.COMMANDS.TOGGLE_FILE, () => __awaiter(this, void 0, void 0, function* () {
        yield fileMarker.toggleFile();
    }));
    const clearAllLineMarksInFileCommand = vscode.commands.registerCommand(constants_1.COMMANDS.CLEAR_ALL_LINE_MARKS_IN_FILE, () => __awaiter(this, void 0, void 0, function* () {
        yield lineMarker.clearAllLineMarksInFile();
    }));
    const clearAllLineMarksInDirectoryCommand = vscode.commands.registerCommand(constants_1.COMMANDS.CLEAR_ALL_LINE_MARKS_IN_DIRECTORY, () => __awaiter(this, void 0, void 0, function* () {
        yield lineMarker.clearAllLineMarksInDirectory();
    }));
    const clearAllFileMarksInDirectoryCommand = vscode.commands.registerCommand(constants_1.COMMANDS.CLEAR_ALL_FILE_MARKS_IN_DIRECTORY, () => __awaiter(this, void 0, void 0, function* () {
        yield fileMarker.clearAllFileMarksInDirectory();
    }));
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