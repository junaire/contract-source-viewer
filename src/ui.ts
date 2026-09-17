import * as vscode from 'vscode';
import { ParsedSource } from './sourceParser';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { supportedChains } from './chains';
import type { SourceProvider } from './contractService';

export interface UserInput {
    chainId: string;
    address: string;
}

const SOURCE_PROVIDERS: readonly SourceProvider[] = ['Blockscan', 'Blockscout'];

export function getContractCacheDirectory(
    provider: SourceProvider,
    chainId: string,
    contractAddress: string,
): string {
    return path.join(
        os.tmpdir(),
        'contract-source-viewer-data',
        `${provider.toLowerCase()}-${chainId}-${contractAddress.toLowerCase()}`,
    );
}

async function openContractDirectory(contractDir: string): Promise<void> {
    await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(contractDir), { forceNewWindow: true });
}

export async function openCachedSource(
    chainId: string,
    contractAddress: string,
): Promise<SourceProvider | undefined> {
    for (const provider of SOURCE_PROVIDERS) {
        const contractDir = getContractCacheDirectory(provider, chainId, contractAddress);

        try {
            const entries = await fs.promises.readdir(contractDir);
            if (entries.length === 0) {
                continue;
            }

            await openContractDirectory(contractDir);
            return provider;
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw error;
            }
        }
    }

    return undefined;
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
            const trimmedValue = value.trim();
            if (!trimmedValue) {
                return 'Address cannot be empty';
            }
            if (!/^0x[a-fA-F0-9]{40}$/.test(trimmedValue)) {
                return 'Please enter a valid Ethereum address (0x followed by 40 hex characters)';
            }
            return null;
        }
    });

    if (!address) {
        return undefined;
    }

    return { chainId: selectedChain.id, address: address.trim() };
}

export async function showSourceCode(
    sources: ParsedSource[],
    chainId: string,
    contractAddress: string,
    provider: SourceProvider,
    cancellationToken?: vscode.CancellationToken,
): Promise<void> {
    if (sources.length === 0) {
        vscode.window.showWarningMessage('No source code to display.');
        return;
    }

    const contractDir = getContractCacheDirectory(provider, chainId, contractAddress);
    await fs.promises.rm(contractDir, { recursive: true, force: true });
    await fs.promises.mkdir(contractDir, { recursive: true });

    for (const source of sources) {
        if (cancellationToken?.isCancellationRequested) {
            throw new vscode.CancellationError();
        }

        const filePath = path.join(contractDir, source.filename);
        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
        await fs.promises.writeFile(filePath, source.content);
    }

    await openContractDirectory(contractDir);
}
