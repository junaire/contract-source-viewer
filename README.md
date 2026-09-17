# Contract Source Viewer

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/junaire.contract-source-viewer?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=junaire.contract-source-viewer)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/junaire.contract-source-viewer?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=junaire.contract-source-viewer)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

A simple VSCode extension that allows you to fetch and view smart contract source code directly from blockchain explorers. Perfect for developers, auditors, and anyone working with smart contracts.

![Demo](images/demo.gif)

## ✨ Features

- 🔍 **Multi-Chain Support**: Fetch contracts from 22 EVM networks
- 🔁 **Explorer Fallback**: Falls back to Blockscout when Blockscan has no source code
- 📄 **Smart Parsing**: Handles both single-file and multi-file Solidity contracts
- 🎨 **Syntax Highlighting**: Full Solidity syntax highlighting with VSCode's built-in support
- 📁 **Project Structure**: Automatically creates proper folder structure for complex contracts
- 💾 **Local Cache**: Reopens previously fetched contracts without another network request
- ⚡ **Fast & Reliable**: Quick fetching with proper error handling
- ✅ **Input Validation**: Validates chain IDs and contract addresses
- 🔄 **Cancellable Progress**: Progress indicators with request cancellation

## 🚀 Quick Start

1. **Install** the extension from VSCode Marketplace
2. **Open Command Palette** (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows/Linux)
3. **Search** for "Fetch Contract Source Code"
4. **Select blockchain** from the dropdown
5. **Enter contract address** (0x...)
6. **View source code** in a new VSCode window

## 🌐 Supported Networks

| Network | Chain ID | Network | Chain ID |
|---------|----------|---------|----------|
| Ethereum | 1 | BSC | 56 |
| Polygon | 137 | Optimism | 10 |
| Arbitrum One | 42161 | Avalanche | 43114 |
| Base | 8453 | Linea | 59144 |
| opBNB | 204 | Blast | 81457 |
| Mantle | 5000 | World Chain | 480 |
| Unichain | 130 | Sonic | 146 |
| Abstract | 2741 | Berachain | 80094 |
| Monad | 143 | Stable | 988 |
| Plasma | 9745 | Robinhood Chain | 4663 |
| Sepolia Testnet | 11155111 | Base Sepolia | 84532 |

Blockscout fallback is available for Ethereum, Optimism, Polygon, Arbitrum One,
Base, World Chain, Unichain, Sepolia, and Base Sepolia.


### Development Setup
```bash
# Clone repository
git clone https://github.com/junaire/contract-source-viewer.git
cd contract-source-viewer

# Install dependencies
npm install

# Compile
npm run compile

# Run in development mode
# Press F5 in VSCode to launch Extension Development Host
```

## 🤝 Contributing

We welcome contributions!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports & Feature Requests

Please use the [GitHub Issues](https://github.com/junaire/contract-source-viewer/issues) page to:
- Report bugs
- Request new features
- Ask questions

## ⭐ Show Your Support

If you find this extension helpful, please:
- ⭐ Star the repository
- 📝 Leave a review on VSCode Marketplace
- 🐦 Share with your network

---

**Made with ❤️ by [Jun Zhang (junaire)](https://github.com/junaire)**
