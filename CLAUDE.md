# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## How to Start a Session

1. **Read Playground.md first** - it contains complete architectural details and
   design decisions
2. Follow the cooperation method described below
3. Refer back to this file for project structure, build commands, and parser
   details

## Project Overview

Barry is an experimental programming language implementation that originated as
a glue and expression language for a Go backend + TypeScript frontend project.
It has evolved into its own project to demonstrate a unique approach to abstract
syntax trees (AST).

**Key Innovation**: Barry treats the AST as the primary product rather than a
temporary data structure, enabling bidirectional transformation between text and
tree representations. This is particularly useful for handling real-time updated
physical quantities and robust I/O.

## Target Platform

**Browser-only**: This is a TypeScript project targeting the browser. No
Node.js, no Deno.

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
│   │   ├── console.ts      # Canvas-based character console
│   │   ├── input.ts        # Keyboard input handler
│   │   └── playground.ts   # Main entry point
│   ├── dist/
│   │   ├── index.html      # Main page
│   │   └── playground.js   # Bundled output (generated)
│   └── tsconfig.json
├── build.sh                # Build script
├── Playground.md           # Detailed architecture and design decisions
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

The parser uses a **single-pass, recursive descent** approach with several
unique characteristics:

1. **Token Extraction**: Uses a combined regex pattern (`TOKEN_PATTERN`) that
   matches quoted strings, numbers, seals (operators), unquoted strings, and
   whitespace in a single pass.

2. **Idea-Based AST**: Everything is represented as an `Idea` (AST node). The
   main idea types are:
   - **Value ideas**: `Num`, `Str`, `List`, `Nothing`
   - **Operator ideas**: `Add`, `ID`, `Second` (more can be added via `SealMap`
     and `NameMap`)
   - **Special ideas**: `Closure` (closing parenthesis marker, never in final
     AST)

3. **Parsing Flow**:
   - `Parse()` → `Parser.start()` creates root list and runs append loop
   - `Parser.next(prev, suitor)` handles token consumption with precedence-based
     operator parsing
   - Ideas can consume previous tokens (`consumePre`) or following tokens
     (`consumePost`)
   - Look-ahead recursion allows operators to grab their arguments based on
     precedence

4. **Precedence System**:
   - Higher precedence operators bind more tightly
   - `ID`: 100 (highest - postfix operators like `#123`)
   - `Second`: 50 (suffix operators like `12s`)
   - `Add`: 10 (infix operators)
   - Default: 0 (no precedence)

5. **Single Element Rule**: Lists with one element are automatically reduced to
   that element. Empty lists become `Nothing`.

### Key Design Patterns

**Extending the Language**: Add new operators by:

1. Adding to `SealMap` for symbol-based operators (e.g., `+`, `#`)
2. Adding to `NameMap` for word-based operators (e.g., `s` for Second)
3. Creating a new `Idea` subclass with appropriate `precedence`, `consumePre`,
   and/or `consumePost` methods

**Completeness Tracking**: Ideas have a `complete` boolean flag indicating
whether all required arguments are filled. This is used for validation and could
be extended for type-checking or IDE features.

## Language Philosophy

Barry's design is intentionally unconventional:

- AST preservation over execution efficiency
- Trees grow "downward" with parent-child relationships
- Emphasis on readability and forestry metaphors
- "Single element rule" makes `(x)` indistinguishable from `x`
- Operators and values are both first-class ideas
- Designed for robust handling of physical quantities and real-time data

Read Barry.md for the complete language specification and
Barry_the_Funky_Seal.md for the whimsical character backstory.

## Development Goals

1. **Primary Goal**: Create a web-based playground to demonstrate Barry's
   concepts
2. **Practical Use**: Serve as glue/expression language for consistent I/O of
   real-time physical quantities in the main project (Go backend + TS frontend)
3. **Showcase Features**: Demonstrate the deeper potential of AST-as-product
   architecture

## Playground Architecture Overview

**See DESIGN.md for complete details.** Quick summary:

- **Spatial editing**: Tree is source of truth (like 3D software scene graphs)
- **Direct rendering**: Ideas draw themselves to canvas at 30fps
- **Whitespace**: Stored sparsely on List ideas only, normalized when cursor
  leaves
- **Console**: Three sections (Source/Command Line/Log), pixel-based grid
- **Continuous compilation**: Tree is always compiled, only changed tokens
  re-parse

## Cooperation Method

**IMPORTANT**: The architect (user) has a specific preferred working method that
must be followed.

### Roles

- **User**: Software architect - provides vision, makes all decisions, maintains
  complete understanding
- **You (Claude)**: Senior software engineer - provides implementation options,
  technical details, executes decisions

### Working Process

**Step-by-step, one thing at a time**:

1. Propose the next small step
2. Discuss approach and technical details thoroughly
3. Wait for user's decision
4. Implement only what was decided
5. Verify user understands completely before moving on
6. Repeat

**Critical principles**:

- **Never run ahead** with multiple tasks or assumptions
- **User must understand every detail** as if they wrote the code themselves
- **Discuss before implementing** - catch design issues early
- **No batching** - one decision, one implementation, then next step
- **Document as you go** - capture insights while fresh

### Why This Matters

The user needs complete mental ownership of the codebase. Your job is to help
build that mental model clearly, one piece at a time - not to produce code
quickly that the user doesn't fully understand.

Think: pair programming where user is driving and you're navigating. Discuss
every turn before taking it.

### Example Flow

```
❌ Wrong: "I'll implement the console grid, rendering loop, and whitespace tracking"
✅ Right: "Should we start with the console grid model? We need to decide on font measurement approach."

❌ Wrong: [Implements 3 files with complete solution]
✅ Right: [Discusses one aspect → user decides → implements that piece → verifies understanding → next]
```

## Development Notes

- Pure TypeScript targeting browsers (no Node.js/Deno dependencies)
- Debug logging present in parser - useful for playground debugging
- Build uses esbuild (same as Nerd project) with ES modules, sourcemaps, and
  minification
