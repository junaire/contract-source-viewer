import axios from 'axios';
import { getBlockscoutUrl } from './chains';

export interface ContractSourceResponse {
    result: string;
    status: string;
    message?: string;
    contractName?: string;
}

interface BlockscoutAdditionalSource {
    file_path?: string | null;
    source_code?: string | null;
}

export interface BlockscoutSourceResponse {
    name?: string | null;
    language?: string | null;
    file_path?: string | null;
    source_code?: string | null;
    additional_sources?: BlockscoutAdditionalSource[] | null;
    compiler_settings?: Record<string, unknown> | null;
}

function sourceExtension(language?: string | null): string {
    return language?.toLowerCase() === 'vyper' ? 'vy' : 'sol';
}

function fallbackFilename(response: BlockscoutSourceResponse, index?: number): string {
    const contractName = response.name?.trim() || 'Contract';
    const suffix = index === undefined ? '' : `-${index}`;
    return `${contractName}${suffix}.${sourceExtension(response.language)}`;
}

export function normalizeBlockscoutResponse(response: BlockscoutSourceResponse): ContractSourceResponse {
    const sources: Record<string, { content: string }> = {};

    if (response.source_code) {
        sources[response.file_path || fallbackFilename(response)] = { content: response.source_code };
    }

    for (const [index, source] of (response.additional_sources || []).entries()) {
        if (source.source_code) {
            sources[source.file_path || fallbackFilename(response, index + 1)] = { content: source.source_code };
        }
    }

    if (Object.keys(sources).length === 0) {
        throw new Error('No source code found in Blockscout');
    }

    return {
        status: '1',
        contractName: response.name || undefined,
        result: JSON.stringify({
            language: response.language || undefined,
            sources,
            settings: response.compiler_settings || undefined,
        }),
    };
}

async function fetchBlockscanSource(chainId: string, address: string): Promise<ContractSourceResponse> {
    const url = `https://vscode.blockscan.com/srcapi/${chainId}/${address}`;

    try {
        const response = await axios.get<ContractSourceResponse>(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'DNT': '1'
            }
        });

        if (response.data.status !== '1') {
            throw new Error(response.data.message || 'Failed to fetch contract source');
        }

        if (!response.data.result) {
            throw new Error('No source code found in Blockscan');
        }

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('Request timeout - the API took too long to respond');
            } else if (error.response?.status === 404) {
                throw new Error('Contract not found on this network');
            } else if (error.response && error.response.status >= 500) {
                throw new Error('Server error - please try again later');
            } else {
                throw new Error(`API request failed: ${error.message}`);
            }
        }
        throw error;
    }
}

async function fetchBlockscoutSource(baseUrl: string, address: string): Promise<ContractSourceResponse> {
    const url = `${baseUrl}/api/v2/smart-contracts/${address}`;

    try {
        const response = await axios.get<BlockscoutSourceResponse>(url, {
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
            },
        });

        return normalizeBlockscoutResponse(response.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('Blockscout request timed out');
            }
            if (error.response?.status === 404) {
                throw new Error('Contract source not found in Blockscout');
            }
            throw new Error(`Blockscout request failed: ${error.message}`);
        }
        throw error;
    }
}

export async function fetchContractSource(chainId: string, address: string): Promise<ContractSourceResponse> {
    let blockscanError: unknown;

    try {
        return await fetchBlockscanSource(chainId, address);
    } catch (error) {
        blockscanError = error;
    }

    const blockscoutUrl = getBlockscoutUrl(chainId);
    if (!blockscoutUrl) {
        throw blockscanError;
    }

    try {
        return await fetchBlockscoutSource(blockscoutUrl, address);
    } catch (blockscoutError) {
        const blockscanMessage = blockscanError instanceof Error ? blockscanError.message : String(blockscanError);
        const blockscoutMessage = blockscoutError instanceof Error ? blockscoutError.message : String(blockscoutError);
        throw new Error(`${blockscanMessage}; ${blockscoutMessage}`);
    }
}
