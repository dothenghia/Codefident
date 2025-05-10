"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WELCOME_MESSAGES = exports.MESSAGES = exports.DEFAULTS = exports.CONFIG_KEYS = exports.STORAGE_KEYS = exports.COMMANDS = exports.LineMarkStyle = void 0;
// Line mark style enum
var LineMarkStyle;
(function (LineMarkStyle) {
    LineMarkStyle["INLINE"] = "inline";
    LineMarkStyle["SIDEBAR"] = "sidebar";
})(LineMarkStyle = exports.LineMarkStyle || (exports.LineMarkStyle = {}));
// Command IDs for all extension commands
exports.COMMANDS = {
    // Line marking commands
    TOGGLE_SELECTED_LINES: "codefident.toggleSelectedLines",
    CLEAR_ALL_LINE_MARKS_IN_FILE: "codefident.clearAllLineMarksInFile",
    CLEAR_ALL_LINE_MARKS_IN_PROJECT: "codefident.clearAllLineMarksInProject",
    // File marking commands
    TOGGLE_FILE: "codefident.toggleFile",
    CLEAR_ALL_FILE_MARKS_IN_PROJECT: "codefident.clearAllFileMarksInProject",
    // Directory marking commands
    TOGGLE_DIRECTORY: "codefident.toggleDirectory",
    CLEAR_ALL_DIRECTORY_MARKS_IN_PROJECT: "codefident.clearAllDirectoryMarksInProject",
    // Show clear menu
    SHOW_CLEAR_MENU: "codefident.showClearMenu",
};
// Storage keys for persisting extension state
exports.STORAGE_KEYS = {
    MARKED_LINES: "codefident:marked-lines",
    MARKED_FILES: "codefident:marked-files",
    MARKED_DIRECTORIES: "codefident:marked-directories",
};
// Configuration keys for user settings
exports.CONFIG_KEYS = {
    HIGHLIGHT_COLOR: "codefident.highlightColor",
    SIDEBAR_COLOR: "codefident.sidebarColor",
    LINE_MARK_STYLE: "codefident.lineMarkStyle",
    REVIEWED_FILE_ICON: "codefident.reviewedFileIcon",
    CHANGED_FILE_ICON: "codefident.changedFileIcon",
    REVIEWED_DIRECTORY_ICON: "codefident.reviewedDirectoryIcon",
    SHOW_STATUS_BAR: "codefident.showStatusBar",
};
// Default values for extension settings
exports.DEFAULTS = {
    // Line marking defaults
    HIGHLIGHT_COLOR: "rgba(22, 119, 255, 0.15)",
    SIDEBAR_COLOR: "rgba(22, 119, 255, 1)",
    LINE_MARK_STYLE: LineMarkStyle.INLINE,
    // File marking defaults
    REVIEWED_FILE_BADGE: "✓",
    REVIEWED_FILE_TOOLTIP: "Reviewed",
    CHANGED_FILE_BADGE: "↻",
    CHANGED_FILE_TOOLTIP: "Reviewed but changed",
    // Directory marking defaults
    REVIEWED_DIRECTORY_BADGE: "✓",
    REVIEWED_DIRECTORY_TOOLTIP: "Reviewed",
};
// User-facing messages
exports.MESSAGES = {
    // Workspace messages
    NO_WORKSPACE_FOLDERS: "No workspace folders found",
    NO_MARKED_LINES: "No marked lines found in the project",
    NO_MARKED_FILES: "No marked files found in the project",
    NO_MARKED_DIRECTORIES: "No marked directories found in the project",
    // Action confirmation messages
    ALL_LINE_MARKS_REMOVED: "All marked lines in this file have been removed",
    ALL_LINE_MARKS_RESET: "Reset all line marks in the project ({count} files affected)",
    ALL_FILE_MARKS_RESET: "Reset all file marks in the project ({count} files affected)",
    ALL_DIRECTORY_MARKS_RESET: "Reset all directory marks in the project ({count} directories affected)",
};
// Welcome messages shown when extension is activated
exports.WELCOME_MESSAGES = [
    "[Codefident] Happy Coding! 🥰",
    "[Codefident] Have a nice day! 👋",
    "[Codefident] You're doing great! 🌟",
    "[Codefident] Code with confidence! 💻",
    "[Codefident] Let's make something amazing! 🚀",
    "[Codefident] No need to double-check. You've marked it. ✅",
    "[Codefident] Trust yourself — you reviewed this already! 🧘",
    "[Codefident] Don't overthink it. Keep building! 🛠️",
    "[Codefident] Review once. Move forward. 🔁➡️",
    "[Codefident] Code it. Review it. Mark it. Done. 🏁",
];
//# sourceMappingURL=constants.js.map