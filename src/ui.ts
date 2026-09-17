import * as vscode from 'vscode';
import { ParsedSource } from './sourceParser';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { supportedChains } from './chains';

export interface UserInput {
    chainId: string;
    address: string;
}

export async function showInputDialog(): Promise<UserInput | undefined> {
    const selectedChain = await vscode.window.showQuickPick(supportedChains, {
        placeHolder: 'Select a blockchain network',
    });

    if (!selectedChain) {
        return undefined;
    }

    const address = await vscode.window.showInputBox({
        prompt: 'Enter Contract Address',
        placeHolder: '0x...',
        validateInput: (value) => {
            if (!value) {
                return 'Address cannot be empty';
            }
            if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
                return 'Please enter a valid Ethereum address (0x followed by 40 hex characters)';
            }
            return null;
        }
    });

    if (!address) {
        return undefined;
    }

    return { chainId: selectedChain.id, address };
}

export async function showSourceCode(sources: ParsedSource[], chainId: string, contractAddress: string): Promise<void> {
    if (sources.length === 0) {
        vscode.window.showWarningMessage('No source code to display.');
        return;
    }

    // Create a unique directory in the system's temp folder
    const tempDir = os.tmpdir();
    const contractDir = path.join(tempDir, `contract-source-${chainId}-${contractAddress}`);

    try {
        // Clean up any previous session's directory
        if (fs.existsSync(contractDir)) {
            fs.rmSync(contractDir, { recursive: true, force: true });
        }
        fs.mkdirSync(contractDir, { recursive: true });

        // Write all the source files
        for (const source of sources) {
            const filePath = path.join(contractDir, source.filename);
            const dirName = path.dirname(filePath);

            // Ensure subdirectory structure exists
            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(dirName, { recursive: true });
            }

            fs.writeFileSync(filePath, source.content);
        }

        // Open the created directory in a new VS Code window
        const folderUri = vscode.Uri.file(contractDir);
        await vscode.commands.executeCommand('vscode.openFolder', folderUri, { forceNewWindow: true });

    } catch (error) {
        vscode.window.showErrorMessage(`Failed to write source files: ${error instanceof Error ? error.message : String(error)}`);
    }
}
