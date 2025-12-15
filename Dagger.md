# Dagger

Dagger is Barry's integrated computational environment. It aims to provide a
user experience similar to notebook apps like Jupyter, but the dependency graph
that the source describes is live, and ideas that are set to display their
simplified form update as the graph changes.

---

## Implementation Notes

**Version**: v0.0.0 **Status**: Basic REPL working

This document captures architectural decisions and implementation details for
Dagger. It describes both the current implementation and the future vision.

---

## Architecture Overview

### Console Structure

Dagger uses a canvas-based console divided into three sections:

1. **Source Section** (top) - Displays the idea tree in Barry Standard Notation
2. **Status Line** (middle) - Shows current state/context information (idea type, evaluation result)
3. **Command Line** (bottom) - REPL-style input with real-time syntax highlighting

### Core Principle: Tree-Driven Rendering

**The idea tree is the source of truth.** The console does not maintain a
character buffer for the source section. Instead, ideas render themselves
directly to the canvas via their `Write()` method.

### Source of Truth Model

Every valid Barry code produces an idea tree (IT), and every idea tree can
produce code. This creates a bidirectional relationship where the tree is
canonical:

1. **Valid Ideas** - The canonical form. When code successfully parses without
   errors, we discard all formatting information (meaningless whitespace,
   unnecessary parentheses, etc.). The idea tree becomes the sole source of
   truth.

2. **Edit Ideas** - Temporary wrappers for lines under construction. An Edit
   idea holds:
   - Raw string version of the line (with whitespace, parens, incomplete
     operators)
   - TokenInfo list that maps the tree to the raw string
   - Potentially contains Err nodes for syntax errors

3. **Promotion from Edit to Valid** - When an Edit's parsed tree becomes valid
   (complete, no errors), the Edit "solidifies": the raw string and token
   mapping are discarded, leaving only the pure idea tree.

**Key insight**: Edit and Err are just idea types - they fit naturally in
the tree structure. The tree can contain both "solid" ideas and "liquid" Edits.
Only Edits need the raw string ↔ tree mapping; valid ideas serialize
deterministically.

### Memory Model

- **Live trees are aggressively hydrated** - optimized for speed, not memory
- **Dehydrated storage uses standard notation** - compact serialization via
  `Str()`
- Trees are loaded/parsed on demand, kept in memory while active
- **Edits are ephemeral** - only exist during construction, then solidify or
  persist with errors

---

## Idea Rendering System

Every idea implements two key methods for dual representation:

### `Str(): string`

**Purpose**: Serialize the idea to Barry Standard Notation (BSN)

- Produces complete, valid Barry source code
- Used for storage/persistence and debugging
- Recursive: calls `Str()` on children
- Always produces parseable output

**Example**:

```javascript
// Add idea with left=1, right=2
add.Str() // => "1+2"
```

### `Write(wctx: WriteContext): void`

**Purpose**: Render the idea to canvas with styling

- Uses `WriteContext` for character-grid positioning
- Calls `wctx.Write(style, idea)` to render each visual element
- Each idea controls its own presentation and parenthesization
- Handles cursor detection and syntax highlighting
- Parent ideas determine when children need parentheses based on binding strength

**Example**:

```javascript
// Add idea writes its left, the "+", then right
Write(wctx) {
  if (this.left !== null) {
    const needsParens = (this.left.rBind > Bind.NonBinding && this.left.rBind < this.lBind)
    if (needsParens) wctx.Write(Style.List, this)
    this.left.Write(wctx)
    if (needsParens) wctx.Write(Style.Closure, this)
  } else {
    wctx.Write(Style.Blank, this)
  }
  wctx.Write(Style.Add, this)
  // ... similar for right operand
}
```

### The `Str()` vs `Write()` Overlap

Both methods traverse the tree and produce standard notation output, but serve
different purposes. We keep them separate and simple rather than creating
abstraction overhead. `Str()` is simple recursive string concatenation while
`Write()` handles canvas rendering, cursor detection, and styling. The overlap in
tree traversal is acceptable.

---

## Editing State: Token-Based Highlighting

### Current Implementation (v0.0.0)

The command line uses **token-based syntax highlighting** rather than full Edit ideas.
As the user types, the parser continuously re-parses the input and produces a token list.

**TokenInfo Structure**:

```javascript
{
  endIndex: number,  // End position in text
  idea: Idea         // The parsed idea at this position
}
```

**How it works**:
1. User types in command line
2. Parser runs `start(currentLine)` on every keystroke
3. Parser populates `tokens` array as it parses
4. `redrawCommandLine()` uses tokens to color each part of the input
5. Each idea's color comes from its `Color()` method (or red if `jam` is set)

### Future: Full Edit Ideas (Not Yet Implemented)

The complete vision includes **Edit ideas** that wrap code under construction
and maintain the raw text ↔ tree mapping. This would enable:

- In-place source editing (not just command line)
- Semantic propagation (label resolution, type checking) across the entire tree
- Multiple concurrent edits
- Graceful error handling with partial parses

**Planned lifecycle**:
1. User starts editing → Edit wrapper created
2. Continuous parsing on every keystroke
3. Semantic propagation through entire tree
4. Solidification when cursor leaves (discard raw text, keep pure tree)

Not implemented in v0.0.0 - current version only supports command line input
with append-only source display.

---

## v0.0.0 - Current State

**What's Working:**

- ✓ Command line REPL with history (arrow up/down)
- ✓ Real-time syntax highlighting as you type
- ✓ Parser with bind-based precedence system
- ✓ Ideas: Num, Str, Unquoted, Label, List, Nothing, Blank
- ✓ Operators: Add (+), Mul (*), Label (:)
- ✓ Write() system for rendering to canvas
- ✓ Eval() for simple numeric expressions
- ✓ Status line shows idea type and evaluation result
- ✓ Source display (append-only from command line)
- ✓ Character grid with JetBrains Mono font
- ✓ Cursor detection in command line

**Not Yet Implemented:**

- ✗ Source editing (only command line input works)
- ✗ Multiline input / vertical implicit lists
- ✗ Indentation handling
- ✗ Edit ideas for in-place editing
- ✗ Most operators (only +, *, : work)
- ✗ Name resolution / references
- ✗ Viewport scrolling/culling
- ✗ Mouse interaction
- ✗ Error ideas with proper jam handling

**Example Session:**

```
^..^ 12+34
Num => 46

^..^ x: 100
Label => 100

^..^ 5*6
Num => 30
```

---

## Technical Details

### WriteContext System

The `WriteContext` class coordinates rendering between ideas and the canvas:

- **Character grid positioning**: Tracks current column/row
- **Pixel calculation**: Converts grid coords to pixel coords using `wchar`/`hchar`
- **Style delegation**: Ideas call `wctx.Write(style, idea)` where style functions handle the actual drawing
- **Cursor detection**: Tracks which idea is under the cursor based on target col/row
- **Section boundaries**: Knows about source/status/command line regions

**Key methods:**
- `Write(style, idea)`: Render an element, advance column counter, detect cursor
- `newLine()`: Advance to next row, reset column
- `remainingCols()`: Calculate available space

### Style System

Styles are functions: `(wctx, idea) => renderedLength`

Each style function:
1. Sets canvas context properties (color, font, etc.)
2. Calls `cc.fillText()` to draw
3. Returns the number of characters rendered

This keeps styling logic separate from idea logic while allowing ideas to control
their appearance by choosing which styles to use.

### Parser Token List

The parser builds a `tokens` array as a side effect of parsing:
```javascript
tokens.push({ endIndex: this.regex.lastIndex, idea: idea })
```

This enables syntax highlighting without a separate tokenization pass. The command
line uses this to color each parsed element as the user types.

---

## Future Development

**Near term:**
- Source editing (not just append-only)
- Mouse click to position cursor
- Vertical implicit lists (indentation-based)
- More operators
- Error handling with jam property

**Longer term:**
- Name resolution and references
- Type checking and semantic propagation
- Edit ideas for in-place editing
- Viewport culling for large sources
- Incremental parsing
- Visual indent guides
- Collapsible sections
- Multiple cursors
- Selection and clipboard
