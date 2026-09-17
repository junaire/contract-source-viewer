import * as vscode from 'vscode';
import { fetchContractSource, isRequestCancelled } from './contractService';
import { parseSourceCode } from './sourceParser';
import { openCachedSource, showInputDialog, showSourceCode } from './ui';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('contractSourceViewer.fetchSource', async () => {
        try {
            const input = await showInputDialog();
            if (!input) {
                return;
            }

            const { chainId, address } = input;
            const cachedProvider = await openCachedSource(chainId, address);
            if (cachedProvider) {
                vscode.window.showInformationMessage(`Opened cached source originally fetched from ${cachedProvider}.`);
                return;
            }

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Fetching contract source code...",
                cancellable: true
            }, async (progress, cancellationToken) => {
                const abortController = new AbortController();
                const cancellationSubscription = cancellationToken.onCancellationRequested(() => abortController.abort());

                try {
                    progress.report({ message: "Fetching..." });
                    const apiResponse = await fetchContractSource(chainId, address, abortController.signal);

                    if (cancellationToken.isCancellationRequested) {
                        throw new vscode.CancellationError();
                    }

                    progress.report({ message: "Parsing..." });
                    const parsedSources = parseSourceCode(apiResponse);

                    progress.report({ message: "Displaying..." });
                    await showSourceCode(
                        parsedSources,
                        chainId,
                        address,
                        apiResponse.provider,
                        cancellationToken,
                    );
                    vscode.window.showInformationMessage(`Source fetched from ${apiResponse.provider} and cached locally.`);
                } catch (error) {
                    if (isRequestCancelled(error) || error instanceof vscode.CancellationError) {
                        return;
                    }
                    vscode.window.showErrorMessage(`Failed to fetch contract source: ${error instanceof Error ? error.message : String(error)}`);
                } finally {
                    cancellationSubscription.dispose();
                }
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
