import axios from 'axios';

export interface ContractSourceResponse {
    result: string;
    status: string;
    message?: string;
    contractName?: string;
}

export async function fetchContractSource(chainId: string, address: string): Promise<ContractSourceResponse> {
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
            throw new Error('No source code found for this contract');
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