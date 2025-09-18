import { ContractSourceResponse } from './contractService';

export interface SoliditySource {
    content: string;
}

export interface SolidityStandardJson {
    sources: {
        [filename: string]: SoliditySource;
    };
    settings?: any;
    language?: string;
}

export interface ParsedSource {
    filename: string;
    content: string;
}

export function parseSourceCode(apiResponse: ContractSourceResponse): ParsedSource[] {
    const sourceData = apiResponse.result;

    try {
        // Case 1: Multi-file standard JSON format
        const parsedJson: SolidityStandardJson = JSON.parse(sourceData);

        if (!parsedJson.sources) {
            throw new Error('Invalid source format: missing sources field');
        }

        const parsedSources: ParsedSource[] = [];

        for (const [filename, source] of Object.entries(parsedJson.sources)) {
            if (source && source.content) {
                parsedSources.push({
                    filename: filename.replace(/^\//, ''), // Remove leading slash
                    content: source.content
                });
            }
        }

        // If settings exist, add them as a settings.json file
        if (parsedJson.settings) {
            parsedSources.push({
                filename: 'settings.json',
                content: JSON.stringify(parsedJson.settings, null, 4)
            });
        }

        if (parsedSources.length === 0) {
            throw new Error('No source files found in the contract data');
        }

        // Sort to put main contract first
        parsedSources.sort((a, b) => {
            const aIsMain = !a.filename.includes('/') && a.filename.endsWith('.sol');
            const bIsMain = !b.filename.includes('/') && b.filename.endsWith('.sol');
            if (aIsMain && !bIsMain) {
                return -1;
            }
            if (!aIsMain && bIsMain) {
                return 1;
            }
            return a.filename.localeCompare(b.filename);
        });

        return parsedSources;

    } catch (error) {
        if (error instanceof SyntaxError) {
            // Case 2: Single file, plain source code
            const filename = apiResponse.contractName ? `${apiResponse.contractName}.sol` : 'Contract.sol';
            return [{
                filename: filename,
                content: sourceData
            }];
        }
        // Re-throw other errors
        throw error;
    }
}