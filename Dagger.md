# Barry Playground

The playground is an integrated computational environment, and it aims to
provide a user experience that is similar of that of a notebook app, like
Jupyter for example, but the dependency graph that the source describes is live,
and ideas that are set to display their simplified form update as the graph
changes.

---

## Implementation Notes

**Version**: v0.1.0 (in development) **Status**: Early implementation phase

This document captures architectural decisions and implementation details for
the Barry playground. It will evolve alongside the implementation and gradually
become the playground's documentation.

---

## Architecture Overview

### Console Structure

The playground uses a canvas-based console divided into three sections:

1. **Source Section** (top) - Displays the idea tree as standard notation
2. **Status Line** (middle) - Shows current state/context information
3. **Command Line** (bottom) - REPL-style input for experimentation

### Core Principle: Tree-Driven Rendering

**The idea tree is the source of truth.** The console does not maintain a
character buffer for the source section. Instead, ideas render themselves
directly to the canvas.

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

Every idea in the standard notation implements two key methods:

### `Str(): string`

**Purpose**: Serialize the idea to standard notation (BSN - Barry Standard
Notation)

- Produces complete, valid Barry source code
- Used for storage/persistence
- Recursive: calls `Str()` on children
- Always produces parseable output

**Example**:

```typescript
// Add idea with left=1, right=2
Add.Str() => "1+2"
```

### `Draw(ctx: DrawContext): void`

**Purpose**: Render the idea to canvas

- **Lazy evaluation** - aggressively culls ideas outside viewport
- Receives canvas context to draw into
- Recursively calls children's `Draw()` with context
- Each idea controls its own color, style, presentation
- Parent ideas can pass hints to children (e.g., nesting level, available width)

**Example**:

```typescript
// Add idea draws its left, the "+", then right
Add.Draw(ctx) {
  this.left?.Draw(ctx)
  ctx.drawText("+", color.operator)
  this.right?.Draw(ctx)
}
```

### The `Str()` vs `Draw()` Overlap

Both methods traverse the tree and produce standard notation output, but serve
different purposes. We keep them separate and simple rather than creating
abstraction overhead. `Str()` is simple recursive string concatenation while
`Draw()` is complex with layout, culling, and styling. The overlap in tree
traversal is acceptable.

---

## Editing State: Edit Ideas

### The Edit Idea Concept

An **Edit** is a special idea type that wraps code under construction. It
bridges the gap between raw text input and validated idea trees.

**Edit Structure** (conceptual):

```typescript
class Edit extends Idea {
  rawText: string; // Source text with all formatting
  tokens: TokenInfo[]; // Maps text positions to parsed ideas
  tree: Idea | null; // Parsed result (may contain ErrorIdea nodes)
}
```

**TokenInfo Structure** (current implementation):

```typescript
interface TokenInfo {
  endIndex: number; // End position in text
  idea: Idea; // The parsed idea at this position
}
```

### Edit Scope and Lifecycle

**Scope**: An Edit wraps a single line of code (possibly including vertical
breaks via indentation). Barry is designed for line-by-line parsing - even when
loading files, the parser processes line by line.

**Lifecycle stages**:

1. **Creation** - User starts typing, Edit is created with raw text

2. **Continuous Parsing** - Every keystroke re-parses:
   - Updates `tokens` array (maps text positions to ideas)
   - Updates local `tree` (may contain Err nodes)

3. **Semantic Propagation** - After each parse, changes ripple through entire
   tree:
   - Label definitions may resolve previously-unresolved Str ideas into
     references
   - Type constraints propagate (e.g., Add requires Num operands)
   - Errors can appear/disappear anywhere based on these semantic changes
   - **This happens at every keystroke for live feedback**
   - Requires hydrated tree for performance (full semantic analysis per
     keystroke)

4. **Solidification** - When cursor leaves edit area:
   - Edit wrapper is removed
   - Raw text and tokens discarded
   - Pure idea tree remains (even if still incomplete/errored)

**Example of semantic propagation**:
```
Line 1: x + 5      # Initially: Str("x") + Num(5) - type error
Line 2: x: 12      # Label resolves Line 1's x into Ref(x)
                   # Type check now passes: Ref(x) + Num(5) valid
```

**Multiple Edits**: Any number of Edits can coexist in the tree simultaneously.
Users may edit multiple lines at once (though uncommon).

**Location**: Edits live directly in their position in the tree structure - they
are regular ideas, not special containers.

### Edit Rendering

Edits render using their TokenInfo list for syntax highlighting:

```
rawText: "12 + abc"
tokens: [
  { endIndex: 2, idea: Num(12) },        // Green
  { endIndex: 5, idea: Add(_,_) },       // Purple
  { endIndex: 9, idea: Str("abc") }      // Yellow
]
```

Each idea provides its own color via `Color()` method. Unparsed text (after
last token) renders in gray.

---

## v0.1.0 Scope

**Goal**: Get command line → source flow working with horizontal lines only

### Included

- ✓ Command line REPL functionality
- ✓ Parse command line input
- ✓ Add valid lines to source (as idea tree)
- ✓ Render source section from idea tree
- ✓ Basic syntax highlighting via token colors
- ✓ Error display in command line
- ✓ Single horizontal line support only

### Explicitly Excluded

- ✗ Multiline input
- ✗ Indentation handling
- ✗ Vertical implicit lists
- ✗ Source editing (only append from command line)
- ✗ Labels and name resolution
- ✗ Most operators (only `+` for testing)
- ✗ Cursor positioning in source
- ✗ Viewport scrolling/culling

### Success Criteria

User can:

1. Type `12 + 34` in command line
2. Press Enter
3. See `12+34` appear in source section (formatted)
4. See `46` in command line output (if we implement eval)
5. Repeat with another line

---

## Implementation Phases

### Phase 1: Console Layout (Current)

- Split canvas into three sections
- Basic rendering for each section
- Status line shows static text

### Phase 2: Line Buffer & Parser Integration

- Implement LineBuffer structure
- Connect parser to command line input
- Real-time token colorization as user types

### Phase 3: Tree Rendering

- Implement `Str()` for existing ideas
- Implement `Draw()` for existing ideas
- Render source section from idea tree

### Phase 4: Command Line → Source Flow

- Parse command on Enter
- Convert to idea tree
- Add tree to source
- Clear command line
- Redraw source section

---

## Open Questions

1. **Token emission pattern**: Use shared `Emit()` method or accept duplication?
2. **Source storage**: Array of idea trees (one per line)? Single root list?
3. **Color scheme**: Define standard colors for each TokenKind
4. **Error recovery**: How to handle partial parses in source?
5. **Canvas performance**: At what tree size do we need culling?

---

## Technical Decisions Log

### 2025-12-06: Initial Architecture

- Tree-driven rendering chosen over buffered approach
- Ideas render themselves via `Draw()` method
- LineBuffer introduced for editing state
- v0.1.0 scope limited to horizontal lines only

---

## Future Considerations (Post v0.1.0)

- Viewport culling for large sources
- Incremental parsing (only re-parse changed lines)
- Visual indent guides
- Collapsible tree sections
- Metadata display (hover for type info, etc.)
- Animation hints (e.g., evaluation progress)
- Multiple cursors
- Selection and clipboard
