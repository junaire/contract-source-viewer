import { defineConfig } from '@vscode/test-cli';

const localExecutable = process.env.VSCODE_TEST_EXECUTABLE;

export default defineConfig({
	files: 'out/test/**/*.test.js',
	...(localExecutable
		? { useInstallation: { fromPath: localExecutable } }
		: { version: '1.104.0' }),
});
