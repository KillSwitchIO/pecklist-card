// Bundles the card and Lit into the one file HACS serves: dist/pecklist-card.js.
import { readFileSync } from 'node:fs';
import esbuild from 'esbuild';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const watch = process.argv.includes('--watch');

const options = {
	entryPoints: ['src/pecklist-card.ts'],
	outfile: 'dist/pecklist-card.js',
	bundle: true,
	format: 'esm',
	target: 'es2022',
	minify: !watch,
	sourcemap: watch ? 'inline' : false,
	legalComments: 'none',
	banner: { js: `/* PeckList card ${version} - MIT - https://github.com/KillSwitchIO/pecklist-card */` },
	define: { __VERSION__: JSON.stringify(version) },
};

if (process.argv.includes('--demo')) {
	// The demo page: the card over a stand-in for Home Assistant, for screenshots and trying things.
	const { writeFileSync, mkdirSync } = await import('node:fs');
	mkdirSync('dist', { recursive: true });
	await esbuild.build({ ...options, entryPoints: ['demo/demo.ts'], outfile: 'dist/demo.js', minify: false });
	// Home Assistant's /local caches files hard: a new name for every build.
	writeFileSync('dist/demo.html', readFileSync('demo/index.html', 'utf8').replace('./demo.js', `./demo.js?v=${Date.now()}`));
}

if (watch) {
	const context = await esbuild.context(options);
	await context.watch();
} else {
	await esbuild.build(options);
}
