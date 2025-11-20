import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
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
