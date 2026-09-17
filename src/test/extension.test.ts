import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { supportedChains } from '../chains';
import { ContractSourceResponse } from '../contractService';
import { parseSourceCode } from '../sourceParser';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});

suite('Supported chains', () => {
	test('contains the ChainEnum networks supported by Blockscan', () => {
		const chainIds = supportedChains.map((chain) => chain.id);

		assert.strictEqual(chainIds.length, 22);
		assert.strictEqual(new Set(chainIds).size, chainIds.length);
		assert.ok(chainIds.includes('9745'), 'Plasma should be supported');
		assert.ok(chainIds.includes('59144'), 'Linea should be supported');
		assert.ok(chainIds.includes('204'), 'opBNB should be supported');
		assert.ok(chainIds.includes('81457'), 'Blast should be supported');
		assert.ok(chainIds.includes('80094'), 'Berachain should be supported');
		assert.ok(chainIds.includes('143'), 'Monad should be supported');
		assert.ok(chainIds.includes('988'), 'Stable should be supported');
		assert.ok(chainIds.includes('4663'), 'Robinhood Chain should be supported');
		assert.ok(chainIds.includes('11155111'), 'Sepolia should be supported');
		assert.ok(chainIds.includes('84532'), 'Base Sepolia should be supported');
		assert.ok(!chainIds.includes('250'), 'unsupported Fantom should not be offered');
	});
});

suite('Source parser', () => {
	test('parses flat multi-file map format', () => {
		const response: ContractSourceResponse = {
			status: '1',
			result: JSON.stringify({
				'Context.sol': { content: 'pragma solidity ^0.8.0;' },
				'lib/Helper.sol': { content: 'library Helper { }' },
			}),
			contractName: 'Example',
		};

		const parsed = parseSourceCode(response);

		assert.strictEqual(parsed.length, 2);
		assert.strictEqual(parsed[0].filename, 'Context.sol');
		assert.ok(parsed.some((source) => source.filename === 'lib/Helper.sol'));
	});
});
