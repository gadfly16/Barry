# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Barry is an experimental programming language implementation that originated as a glue and expression language for a Go backend + TypeScript frontend project. It has evolved into its own project to demonstrate a unique approach to abstract syntax trees (AST).

**Key Innovation**: Barry treats the AST as the primary product rather than a temporary data structure, enabling bidirectional transformation between text and tree representations. This is particularly useful for handling real-time updated physical quantities and robust I/O.

## Target Platform

**Browser-only**: This is a TypeScript project targeting the browser. No Node.js, no Deno.
- The code is written to run directly in browsers
- Focus on creating a web-based playground for demonstrating Barry's concepts
- TypeScript should compile to browser-compatible JavaScript

## Build & Development Commands

### TypeScript Playground

```bash
# Type check and bundle with esbuild
./build.sh

# Or manually:
cd web && npx tsc --noEmit  # Type check
npx esbuild ./web/src/playground.ts --bundle --format=esm --outfile=./web/dist/playground.js --sourcemap --minify --tree-shaking=false

# Serve locally (requires Python)
python3 -m http.server 8000 --directory web/dist
# Then open http://localhost:8000
```

### Project Structure

```
Barry/
├── web/
│   ├── src/
│   │   ├── barry.ts        # Parser implementation
│   │   ├── terminal.ts     # Canvas-based character terminal
│   │   ├── input.ts        # Keyboard input handler
│   │   └── playground.ts   # Main entry point
│   ├── dist/
│   │   ├── index.html      # Main page
│   │   └── playground.js   # Bundled output (generated)
│   └── tsconfig.json
├── build.sh                # Build script
├── Barry.md                # Language specification
└── Barry_the_Funky_Seal.md # Character backstory
```

## Running Tests

Currently tests are embedded in barry.ts via the `Test()` function. To run:
1. Build with `./build.sh`
2. Open `web/dist/index.html` in a browser (via local server)
3. Call `Test()` from browser console

## Core Architecture

### Parser Architecture (barry.ts)

The parser uses a **single-pass, recursive descent** approach with several unique characteristics:

1. **Token Extraction**: Uses a combined regex pattern (`TOKEN_PATTERN`) that matches quoted strings, numbers, seals (operators), unquoted strings, and whitespace in a single pass.

2. **Idea-Based AST**: Everything is represented as an `Idea` (AST node). The main idea types are:
   - **Value ideas**: `Num`, `Str`, `List`, `Nothing`
   - **Operator ideas**: `Add`, `ID`, `Second` (more can be added via `SealMap` and `NameMap`)
   - **Special ideas**: `Closure` (closing parenthesis marker, never in final AST)

3. **Parsing Flow**:
   - `Parse()` → `Parser.start()` creates root list and runs append loop
   - `Parser.next(prev, suitor)` handles token consumption with precedence-based operator parsing
   - Ideas can consume previous tokens (`consumePre`) or following tokens (`consumePost`)
   - Look-ahead recursion allows operators to grab their arguments based on precedence

4. **Precedence System**:
   - Higher precedence operators bind more tightly
   - `ID`: 100 (highest - postfix operators like `#123`)
   - `Second`: 50 (suffix operators like `12s`)
   - `Add`: 10 (infix operators)
   - Default: 0 (no precedence)

5. **Single Element Rule**: Lists with one element are automatically reduced to that element. Empty lists become `Nothing`.

### Key Design Patterns

**Extending the Language**: Add new operators by:
1. Adding to `SealMap` for symbol-based operators (e.g., `+`, `#`)
2. Adding to `NameMap` for word-based operators (e.g., `s` for Second)
3. Creating a new `Idea` subclass with appropriate `precedence`, `consumePre`, and/or `consumePost` methods

**Completeness Tracking**: Ideas have a `complete` boolean flag indicating whether all required arguments are filled. This is used for validation and could be extended for type-checking or IDE features.

## Language Philosophy

Barry's design is intentionally unconventional:
- AST preservation over execution efficiency
- Trees grow "downward" with parent-child relationships
- Emphasis on readability and forestry metaphors
- "Single element rule" makes `(x)` indistinguishable from `x`
- Operators and values are both first-class ideas
- Designed for robust handling of physical quantities and real-time data

Read Barry.md for the complete language specification and Barry_the_Funky_Seal.md for the whimsical character backstory.

## Development Goals

1. **Primary Goal**: Create a web-based playground to demonstrate Barry's concepts
2. **Practical Use**: Serve as glue/expression language for consistent I/O of real-time physical quantities in the main project (Go backend + TS frontend)
3. **Showcase Features**: Demonstrate the deeper potential of AST-as-product architecture

## Playground Architecture

The playground uses a **canvas-based terminal** for full control over rendering and performance:

### Terminal System (terminal.ts)

- **Character Grid**: 120x80 cell grid using JetBrains Mono font
- **Color Scheme**: Cappuccino-inspired dark theme (#1e1e2e background, #24273a canvas, #cad3f5 text)
- **Canvas Rendering**: All text drawn directly on canvas for pixel-perfect control
- **Cell-based**: Each character position tracked independently with foreground/background colors
- **Cursor**: Blinking underline cursor with 500ms interval

### Input System (input.ts)

- **Keyboard Handler**: Full line editing with arrow keys, Home/End, Delete/Backspace
- **History**: Up/Down arrow navigation through command history
- **Line Buffer**: Insert/delete characters at cursor position
- **No DOM**: All input handled via keyboard events and canvas rendering

### Integration (playground.ts)

- Main entry point that wires terminal + input + parser together
- REPL loop: read line → parse → display result → show prompt
- Error handling displays parse errors in terminal

## Development Notes

- Pure TypeScript targeting browsers (no Node.js/Deno dependencies)
- Debug logging is present: `console.log("Created idea:", ...)` in parser - useful for playground debugging
- The `LineView()` helper function displays lists without outer parentheses for cleaner output
- Build uses esbuild (same as Nerd project) with ES modules, sourcemaps, and minification
