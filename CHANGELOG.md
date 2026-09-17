# Changelog

## [1.1.2] - 2026-09-17

### Changed
- Encode the source provider, chain ID, and address in temporary cache directory names without metadata files

## [1.1.1] - 2026-09-17

### Changed
- Store fetched source caches in the system temporary directory

### Fixed
- Retry transient Blockscout TLS connection failures with an IPv4 fallback

## [1.1.0] - 2026-09-17

### Added
- Support for 22 EVM networks
- Blockscout fallback for supported networks
- Persistent local source cache with provider information
- Cancellable source code requests

### Changed
- Use asynchronous file operations to keep the extension host responsive
- Trim pasted contract addresses automatically
- Limit explorer response size and redirects
- Update the VS Code test runner and production HTTP dependencies
- Reduce the extension's Marketplace categories to the relevant `Other` category

### Fixed
- Preserve locally opened source changes by reusing cached contracts
- Pin extension tests to the minimum supported VS Code version

## [1.0.0] - 2025-09-18

### Added
- Initial release of Contract Source Viewer extension
- Multi-chain smart contract source code fetching
- Support for 8 blockchain networks: Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Avalanche, Fantom
- Automatic project structure creation for multi-file contracts
- Command: `contractSourceViewer.fetchSource`
- Syntax highlighting for Solidity files
- Input validation and error handling
