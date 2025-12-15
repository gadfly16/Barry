# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## How to Start a Session

1. **Read Dagger.md first** - it contains complete architectural details and
   design decisions
2. Follow the cooperation method described below
3. Refer back to this file for project structure, development workflow, and parser
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

**Browser-only**: This is a pure ES2024 JavaScript project targeting modern browsers. No
Node.js, no Deno, no build process.

- The code is written in ES2024 JavaScript and runs directly in browsers
- Focus on creating Dagger, a web-based integrated environment for Barry
- No compilation or bundling - direct file execution

## Development Workflow

We use jj instead of git and follow Conventional Commits.

### Running Dagger

No build process needed. Simply open the HTML file directly:

```bash
# Option 1: Direct file open
# Open Dagger/index.html in your browser (File → Open)

# Option 2: Local server (if needed for certain browser restrictions)
python3 -m http.server 8000 --directory Dagger
# Then open http://localhost:8000
```

### Development

Edit `Dagger/Dagger.js` directly and refresh the browser to see changes. The entire implementation is in a single ES2024 file - no compilation or bundling required.

### Project Structure

```
Barry/
├── Dagger/
│   ├── Dagger.js           # Complete implementation (parser + editor + renderer)
│   ├── index.html          # Main page
│   └── favicon.ico
├── Dagger.md               # Detailed architecture and design decisions
├── Language.md             # Language specification details
├── Barry.md                # Language overview and introduction
└── CLAUDE.md               # This file
```

All code is in the single `Dagger.js` file (~1400 lines), which contains:
- Style system (colors, fonts, character metrics)
- Parser (token matching, precedence-based parsing)
- Ideas (AST nodes: Num, Str, List, Add, Mul, Label, etc.)
- WriteContext (rendering coordination)
- Console (canvas-based UI with three sections)
- Keyboard input handling

## Running Tests

Tests are embedded in Dagger.js via the `Test()` function. To run:

1. Open `Dagger/index.html` in a browser
2. Open browser console (F12)
3. Call `Test()` - this runs parser tests on various input cases

## Core Architecture

### Parser Architecture (Dagger.js)

The parser uses a **single-pass, recursive descent** approach with several
unique characteristics:

1. **Token Extraction**: Uses a combined regex pattern (`TOKEN_PATTERN`) that
   matches quoted strings, numbers, seals (operators), unquoted strings, and
   whitespace in a single pass.

2. **Idea-Based AST**: Everything is represented as an `Idea` (AST node). The
   main idea types are:
   - **Value ideas**: `Num`, `Str`, `Unquoted`, `List`, `Nothing`, `Blank`
   - **Operator ideas**: `Add`, `Mul`, `Label` (more can be added via `SealMap`
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

4. **Precedence System** (Bind enum):
   - Uses an enum-based approach rather than arbitrary numbers
   - Higher bind values bind more tightly
   - Bind levels: `NonBinding`, `Append`, `LabelRight`, `Additive`, `Multiplicative`, `LabelLeft`
   - Each operator declares its left (`lBind`) and right (`rBind`) binding strength
   - Makes precedence relationships explicit and maintainable

5. **Single Element Rule**: Lists with one element are automatically reduced to
   that element. Empty lists become `Nothing`.

### Key Design Patterns

**Extending the Language**: Add new operators by:

1. Adding to `SealMap` for symbol-based operators (e.g., `+`, `#`)
2. Adding to `NameMap` for word-based operators (e.g., `s` for Second)
3. Creating a new `Idea` subclass with appropriate `precedence`, `consumePre`,
   and/or `consumePost` methods

**Completeness Tracking**: Operator ideas have a `complete` boolean flag indicating
whether all required arguments are filled. This is used for validation and could
be extended for type-checking or IDE features.

**Error Handling**: Ideas have a `jam` property that stores error messages. When set,
the idea's color changes to red and error information is displayed in the status line.

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

1. **Primary Goal**: Create Dagger, an integrated computational environment for Barry
2. **Practical Use**: Serve as glue/expression language for consistent I/O of
   real-time physical quantities in larger projects
3. **Showcase Features**: Demonstrate the deeper potential of AST-as-product
   architecture

## Dagger Architecture Overview

**See Dagger.md for complete details.** Quick summary:

- **Tree-driven rendering**: The idea tree is the source of truth
- **Write system**: Ideas render themselves via `Write(wctx)` method
- **WriteContext**: Coordinates rendering with character-grid positioning and cursor detection
- **Console**: Three sections (Source/Status/Command Line), canvas-based character grid
- **Continuous parsing**: Command line re-parses on every keystroke with token colorization
- **Dual representation**: `Str()` for serialization, `Write()` for rendering

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

- Pure ES2024 JavaScript targeting modern browsers (no Node.js/Deno dependencies)
- No build process, no bundling - direct browser execution
- Single-file implementation for simplicity and transparency
- Uses JetBrains Mono font loaded from Google Fonts
- Canvas-based rendering with character grid system
- All state lives in the idea tree - no separate text buffers
