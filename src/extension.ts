import * as vscode from 'vscode';
import { fetchContractSource } from './contractService';
import { parseSourceCode } from './sourceParser';
import { showInputDialog, showSourceCode } from './ui';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('contractSourceViewer.fetchSource', async () => {
        try {
            const input = await showInputDialog();
            if (!input) {
                return;
            }

            const { chainId, address } = input;

            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Fetching contract source code...",
                cancellable: false
            }, async (progress) => {
                try {
                    progress.report({ message: "Fetching..." });
                    const apiResponse = await fetchContractSource(chainId, address);

                    progress.report({ message: "Parsing..." });
                    const parsedSources = parseSourceCode(apiResponse);

                    progress.report({ message: "Displaying..." });
                    await showSourceCode(parsedSources, chainId, address);

                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to fetch contract source: ${error instanceof Error ? error.message : String(error)}`);
                }
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
