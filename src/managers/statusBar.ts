import * as vscode from "vscode";
import { COMMANDS, CONFIG_KEYS } from "../constants/constants";

export class StatusBarManager {
  // VS Code status bar item
  private statusBarItem: vscode.StatusBarItem;
  private stats = { markedLines: 0, markedFiles: 0, markedDirectories: 0 };

  constructor(context: vscode.ExtensionContext) {
    // Create status bar item
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );

    // Register custom command for status bar click
    const statusBarCommand = vscode.commands.registerCommand(
      COMMANDS.SHOW_CLEAR_MENU,
      async () => {
        const { markedLines, markedFiles, markedDirectories } = this.stats;
        const items = [
          {
            label: `$(selection) Marked Lines: ${markedLines}`,
            command: COMMANDS.CLEAR_ALL_LINE_MARKS_IN_PROJECT,
            description: "Clear all marked lines",
          },
          {
            label: `$(file) Marked Files: ${markedFiles}`,
            command: COMMANDS.CLEAR_ALL_FILE_MARKS_IN_PROJECT,
            description: "Clear all marked files",
          },
          {
            label: `$(folder) Marked Directories: ${markedDirectories}`,
            command: COMMANDS.CLEAR_ALL_DIRECTORY_MARKS_IN_PROJECT,
            description: "Clear all marked directories",
          },
        ];

        const selection = await vscode.window.showQuickPick(items, {
          placeHolder: "Select an action or press ESC to cancel",
        });

        if (selection) {
          vscode.commands.executeCommand(selection.command);
        }
      }
    );
    context.subscriptions.push(statusBarCommand);

    // Set the command to our custom command
    this.statusBarItem.command = COMMANDS.SHOW_CLEAR_MENU;

    // Show/hide based on configuration
    const config = vscode.workspace.getConfiguration();
    const showStatusBar =
      config.get<boolean>(CONFIG_KEYS.SHOW_STATUS_BAR) ?? true;
    if (showStatusBar) {
      this.statusBarItem.show();
    }

    // Listen for configuration changes
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(CONFIG_KEYS.SHOW_STATUS_BAR)) {
          const show =
            vscode.workspace
              .getConfiguration()
              .get<boolean>(CONFIG_KEYS.SHOW_STATUS_BAR) ?? true;
          if (show) {
            this.statusBarItem.show();
          } else {
            this.statusBarItem.hide();
          }
        }
      })
    );

    context.subscriptions.push(this.statusBarItem);
  }

  // Update status bar with review statistics
  public updateStats(stats: {
    markedLines: number;
    markedFiles: number;
    markedDirectories: number;
  }): void {
    this.stats = stats;
    const { markedLines, markedFiles, markedDirectories } = stats;

    this.statusBarItem.text = `$(selection) ${markedLines} $(file) ${markedFiles} $(folder) ${markedDirectories}`;
    this.statusBarItem.tooltip =
      `Marked Lines: ${markedLines} in ${markedFiles} file(s)\n` +
      `Marked Files: ${markedFiles}\n` +
      `Marked Directories: ${markedDirectories}`;
  }

  // Cleanup resources
  public dispose(): void {
    this.statusBarItem.dispose();
  }
}
