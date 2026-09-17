export interface SupportedChain {
    label: string;
    id: string;
}

// Keep this list to chains that exist in contract-strategy-backend's ChainEnum
// and are also supported by https://vscode.blockscan.com/.
export const supportedChains: readonly SupportedChain[] = [
    { label: 'Ethereum (1)', id: '1' },
    { label: 'BSC (56)', id: '56' },
    { label: 'Polygon (137)', id: '137' },
    { label: 'Optimism (10)', id: '10' },
    { label: 'Arbitrum One (42161)', id: '42161' },
    { label: 'Avalanche (43114)', id: '43114' },
    { label: 'Base (8453)', id: '8453' },
    { label: 'Linea (59144)', id: '59144' },
    { label: 'opBNB (204)', id: '204' },
    { label: 'Blast (81457)', id: '81457' },
    { label: 'Mantle (5000)', id: '5000' },
    { label: 'World Chain (480)', id: '480' },
    { label: 'Unichain (130)', id: '130' },
    { label: 'Sonic (146)', id: '146' },
    { label: 'Abstract (2741)', id: '2741' },
    { label: 'Berachain (80094)', id: '80094' },
    { label: 'Monad (143)', id: '143' },
    { label: 'Stable (988)', id: '988' },
    { label: 'Plasma (9745)', id: '9745' },
    { label: 'Robinhood Chain (4663)', id: '4663' },
    { label: 'Sepolia Testnet (11155111)', id: '11155111' },
    { label: 'Base Sepolia (84532)', id: '84532' },
];
