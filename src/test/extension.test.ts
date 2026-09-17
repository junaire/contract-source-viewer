import * as assert from 'assert';
import * as http from 'http';
import * as os from 'os';
import * as path from 'path';
import axios from 'axios';

import { getBlockscoutUrl, supportedChains } from '../chains';
import {
	ContractSourceResponse,
	fetchBlockscoutSource,
	isRetryableBlockscoutError,
	normalizeBlockscoutResponse,
} from '../contractService';
import { parseSourceCode } from '../sourceParser';
import { getContractCacheDirectory } from '../ui';

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

	test('configures Blockscout only for chains with a working v2 API', () => {
		assert.strictEqual(supportedChains.filter((chain) => chain.blockscoutUrl).length, 9);
		assert.strictEqual(getBlockscoutUrl('8453'), 'https://base.blockscout.com');
		assert.strictEqual(getBlockscoutUrl('1'), 'https://eth.blockscout.com');
		assert.strictEqual(getBlockscoutUrl('59144'), undefined);
		assert.strictEqual(getBlockscoutUrl('4663'), undefined);
	});
});

suite('Source parser', () => {
	test('parses flat multi-file map format', () => {
		const response: ContractSourceResponse = {
			status: '1',
			provider: 'Blockscan',
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

	test('normalizes a single-file Blockscout Vyper response', () => {
		const response = normalizeBlockscoutResponse({
			name: 'Subsquid',
			language: 'vyper',
			source_code: '#pragma version ^0.3.9',
			additional_sources: [],
		});

		const parsed = parseSourceCode(response);

		assert.deepStrictEqual(parsed, [{
			filename: 'Subsquid.vy',
			content: '#pragma version ^0.3.9',
		}]);
	});

	test('normalizes Blockscout multi-file responses and safe paths', () => {
		const response = normalizeBlockscoutResponse({
			name: 'Example',
			language: 'solidity',
			file_path: '/workspace/contracts/Example.sol',
			source_code: 'contract Example {}',
			additional_sources: [{
				file_path: '../lib/Helper.sol',
				source_code: 'library Helper {}',
			}],
			compiler_settings: { optimizer: { enabled: true } },
		});

		const parsed = parseSourceCode(response);

		assert.ok(parsed.some((source) => source.filename === 'workspace/contracts/Example.sol'));
		assert.ok(parsed.some((source) => source.filename === 'lib/Helper.sol'));
		assert.ok(parsed.some((source) => source.filename === 'settings.json'));
	});

	test('rejects Blockscout responses without source code', () => {
		assert.throws(() => normalizeBlockscoutResponse({}), /No source code found in Blockscout/);
	});
});

suite('Contract source reliability', () => {
	test('retries transient socket resets and returns Blockscout source', async function () {
		this.timeout(5000);
		let requestCount = 0;
		const server = http.createServer((request, response) => {
			requestCount += 1;
			if (requestCount < 3) {
				request.socket.destroy();
				return;
			}

			response.setHeader('Content-Type', 'application/json');
			response.end(JSON.stringify({
				name: 'RetryExample',
				language: 'solidity',
				source_code: 'contract RetryExample {}',
			}));
		});

		await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
		const address = server.address();
		assert.ok(address && typeof address === 'object');

		try {
			const result = await fetchBlockscoutSource(
				`http://127.0.0.1:${address.port}`,
				'0x0000000000000000000000000000000000000000',
			);

			assert.strictEqual(requestCount, 3);
			assert.strictEqual(result.provider, 'Blockscout');
			assert.strictEqual(result.contractName, 'RetryExample');
		} finally {
			await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
		}
	});

	test('classifies TLS connection resets as retryable', () => {
		const error = new axios.AxiosError(
			'Client network socket disconnected before secure TLS connection was established',
			'ECONNRESET',
		);

		assert.strictEqual(isRetryableBlockscoutError(error), true);
	});

	test('retries transient HTTP errors', () => {
		const error = new axios.AxiosError('Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
			data: {},
			status: 503,
			statusText: 'Service Unavailable',
			headers: {},
			config: { headers: new axios.AxiosHeaders() },
		});

		assert.strictEqual(isRetryableBlockscoutError(error), true);
	});

	test('does not retry permanent HTTP errors', () => {
		const error = new axios.AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
			data: {},
			status: 400,
			statusText: 'Bad Request',
			headers: {},
			config: { headers: new axios.AxiosHeaders() },
		});

		assert.strictEqual(isRetryableBlockscoutError(error), false);
	});

	test('stores cached source in the system temp directory', () => {
		const cacheDirectory = getContractCacheDirectory(
			'8453',
			'0x13375B79F3F1651EA317956686D2DCDF69E98AB1',
		);

		assert.strictEqual(
			cacheDirectory,
			path.join(os.tmpdir(), 'contract-source-8453-0x13375b79f3f1651ea317956686d2dcdf69e98ab1'),
		);
	});
});
