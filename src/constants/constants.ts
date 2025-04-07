// Command IDs
export const COMMANDS = {
  TOGGLE_SELECTED_LINES: "line-marker.toggleSelectedLines",
  TOGGLE_FILE: "line-marker.toggleFile",
  CLEAR_ALL_LINE_MARKS_IN_FILE: "line-marker.clearAllLineMarksInFile",
  CLEAR_ALL_LINE_MARKS_IN_DIRECTORY: "line-marker.clearAllLineMarksInDirectory",
  CLEAR_ALL_FILE_MARKS_IN_DIRECTORY: "line-marker.clearAllFileMarksInDirectory",
};

// Storage keys
export const STORAGE_KEYS = {
  MARKED_LINES: "line-marker:marked-lines",
  MARKED_FILES: "line-marker:marked-files",
};

// Configuration keys
export const CONFIG_KEYS = {
  HIGHLIGHT_COLOR: "line-marker.highlightColor",
  FILE_ICON: "line-marker.reviewedFileIcon",
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
