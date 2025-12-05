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

### Memory Model

- **Live trees are aggressively hydrated** - optimized for speed, not memory
- **Dehydrated storage uses standard notation** - compact serialization via
  `Str()`
- Trees are loaded/parsed on demand, kept in memory while active

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

## Editing State: The Line Buffer

### Problem

We need to handle text that is:

- Currently being edited (potentially malformed)
- Contains parse errors
- Not yet a valid idea tree

### Solution: Line Buffer Structure

```typescript
interface LineBuffer {
  text: string; // Raw source text
  tokens: TokenInfo[]; // Parser's view of the text
}

interface TokenInfo {
  endIndex: number; // End position in text
  kind: TokenKind; // What the parser thinks this is
  color: string; // Display color
  error?: string; // Error message if problematic
}
```

**Usage**:

- Command line input accumulates in a LineBuffer
- Parser populates `tokens[]` as it processes
- Renderer uses token info to colorize and show errors
- On successful parse, LineBuffer converts to idea tree
- On error, LineBuffer persists with error annotations

**Rendering**:

```
text:   "12 + abc"
tokens: [
  { endIndex: 2, kind: Num, color: "#a6da95" },
  { endIndex: 5, kind: Operator, color: "#c6a0f6" },
  { endIndex: 9, kind: Str, color: "#eed49f", error: "Unresolved reference" }
]
```

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
