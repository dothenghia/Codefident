// Command IDs
export const COMMANDS = {
  TOGGLE_SELECTED_LINES: "codefident.toggleSelectedLines",
  TOGGLE_FILE: "codefident.toggleFile",
  CLEAR_ALL_LINE_MARKS_IN_FILE: "codefident.clearAllLineMarksInFile",
  CLEAR_ALL_LINE_MARKS_IN_DIRECTORY: "codefident.clearAllLineMarksInDirectory",
  CLEAR_ALL_FILE_MARKS_IN_DIRECTORY: "codefident.clearAllFileMarksInDirectory",
};

// Storage keys
export const STORAGE_KEYS = {
  MARKED_LINES: "codefident:marked-lines",
  MARKED_FILES: "codefident:marked-files",
};

// Configuration keys
export const CONFIG_KEYS = {
  HIGHLIGHT_COLOR: "codefident.highlightColor",
  FILE_ICON: "codefident.reviewedFileIcon",
};

// Default values
export const DEFAULTS = {
  HIGHLIGHT_COLOR: "rgba(0, 122, 204, 0.2)",
  FILE_BADGE: "✓",
  FILE_TOOLTIP: "Reviewed",
};

// Messages
export const MESSAGES = {
  NO_WORKSPACE_FOLDERS: "No workspace folders found",
  NO_MARKED_LINES: "No marked lines found in the project",
  NO_MARKED_FILES: "No marked files found in the project",
  ALL_LINE_MARKS_REMOVED: "All marked lines in this file have been removed",
  ALL_LINE_MARKS_RESET:
    "Reset all line marks in the project ({count} file(s) affected)",
  ALL_FILE_MARKS_RESET:
    "Reset all file marks in the project ({count} file(s) affected)",
};
