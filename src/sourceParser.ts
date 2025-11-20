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

function isValidSourceEntry(source: unknown): source is SoliditySource {
    return Boolean(source && typeof source === 'object' && typeof (source as SoliditySource).content === 'string');
}

function collectSources(parsedJson: unknown): Record<string, SoliditySource> {
    if (!parsedJson || typeof parsedJson !== 'object') {
        return {};
    }

    const jsonAsRecord = parsedJson as Record<string, unknown>;

    if (jsonAsRecord.sources && typeof jsonAsRecord.sources === 'object') {
        return jsonAsRecord.sources as Record<string, SoliditySource>;
    }

    const flatSources: Record<string, SoliditySource> = {};

    for (const [filename, source] of Object.entries(jsonAsRecord)) {
        if (isValidSourceEntry(source)) {
            flatSources[filename] = source;
        }
    }

    return flatSources;
}

export function parseSourceCode(apiResponse: ContractSourceResponse): ParsedSource[] {
    const sourceData = apiResponse.result;

    let parsedJson: unknown;
    try {
        parsedJson = JSON.parse(sourceData);
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

    const parsedSources: ParsedSource[] = [];
    const sources = collectSources(parsedJson);

    if (Object.keys(sources).length === 0) {
        throw new Error('Invalid source format: no source files found in the contract data');
    }

    for (const [filename, source] of Object.entries(sources)) {
        if (source && source.content) {
            parsedSources.push({
                filename: filename.replace(/^\//, ''), // Remove leading slash
                content: source.content
            });
        }
    }

    // If settings exist, add them as a settings.json file
    if ((parsedJson as SolidityStandardJson).settings && typeof (parsedJson as SolidityStandardJson).settings === 'object') {
        parsedSources.push({
            filename: 'settings.json',
            content: JSON.stringify((parsedJson as SolidityStandardJson).settings, null, 4)
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
}
