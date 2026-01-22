// Build script for the embeddable widget
// Uses esbuild to bundle TypeScript into a single minified JS file

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const isProduction = process.argv.includes('--production');

async function build() {
    console.log(`Building widget (${isProduction ? 'production' : 'development'})...`);

    try {
        const result = await esbuild.build({
            entryPoints: [path.join(__dirname, 'widget.ts')],
            bundle: true,
            minify: isProduction,
            sourcemap: !isProduction,
            target: ['es2018'],
            outfile: path.join(__dirname, '..', 'public', 'widget.js'),
            format: 'iife',
            globalName: 'SiteBotWidget',
            metafile: true,
        });

        // Log bundle size
        const outputPath = path.join(__dirname, '..', 'public', 'widget.js');
        const stats = fs.statSync(outputPath);
        const sizeKB = (stats.size / 1024).toFixed(2);

        console.log(`✓ Built widget.js (${sizeKB} KB)`);

        if (!isProduction) {
            console.log(`  Location: ${outputPath}`);
        }

        // Show analysis in dev mode
        if (!isProduction && result.metafile) {
            const text = await esbuild.analyzeMetafile(result.metafile);
            console.log('\nBundle analysis:');
            console.log(text);
        }

    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();
