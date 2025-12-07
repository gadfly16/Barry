#!/bin/bash
# Build script for Barry playground
# Type check first (no emit), then bundle with esbuild

set -e

echo "Type checking TypeScript..."
cd web && npx tsc --noEmit

echo "Bundling with esbuild..."
cd ..
npx esbuild ./web/src/playground.ts --bundle --format=esm --outfile=./web/dist/playground.js --sourcemap --tree-shaking=false

echo "Build complete! Open web/dist/index.html in your browser."
