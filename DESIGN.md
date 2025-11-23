# Barry Playground Design

This document captures the design decisions and architecture for the Barry
playground.

## Core Philosophy

**Spatial editing, not textual parsing**

The playground breaks from the traditional text→AST→code paradigm. Instead:

- **Tree is source of truth** (lives in memory)
- **Rendering creates spatial map** (ideas know their canvas positions)
- **Editing manipulates tree directly** (text editing is just the familiar
  interface)

The magic trick: we emulate the familiar text editing experience while actually
performing tree manipulation.

### The Bigger Picture: Like Every Other Successful Application

Every successful application moved to this model decades ago:
- **3D software**: Scene graph in memory → render → direct manipulation
- **Image editors**: Layer tree → render → paint/adjust
- **Audio DAWs**: Track/effect tree → render → tweak parameters
- **Spreadsheets**: Cell dependency graph → calculate → edit formulas

**But programming stayed stuck**:
- Text files on disk
- Parse on demand
- Throw away AST
- Repeat

**Barry breaks this**: The tree is always live, always compiled, always ready - just like scene graphs in 3D software.

## Console Layout

The console is divided into three logical sections:

```
┌─────────────────────────────────────┐
│                                     │
│  SOURCE (editable)                  │
│  - User's Barry program             │
│  - Rendered in standard notation    │
│  - Can navigate/edit anywhere       │
│  - Grows downward                   │
│                                     │
├─────────────────────────────────────┤
│ (_^_) command line                  │  ← Input prompt
├─────────────────────────────────────┤
│  newest log entry                   │
│  older log entry                    │
│  LOG (read-only)                    │
│  - Structured log (list of lists)   │
│  - Newest entries at top            │
│  - Can navigate but not edit        │
│  - Grows downward                   │
└─────────────────────────────────────┘
```

### Display Trick

The three sections can be displayed independently:

- **Command line can "stick" to bottom** of console to stay visible
- **Log can also stick** to bottom below command line
- **Source scrolls independently** above them
- When cursor reaches last displayed source line and moves down, it scrolls
  source first, then enters command line when source end is reached

### Navigation

- **One cursor** moves through all sections
- **Cursor position saved** before jumps
- **ESC key** toggles between command line and last known source location
- Can navigate anywhere, but only source + command line are editable

## Command Line Behavior

**Command line is independent from source** - it parses in its own context.

When user types in command line and presses Enter:

- **If starts with `!`**: Execute as command that affects tree from outside (like `!bang .`, `!clear`, etc.)
- **Otherwise**: Parse line independently → append complete expression to end of source tree

The command line is **NOT a continuation** of the source above it. This avoids complications with multi-line layout and indentation.

After Enter, command line clears and cursor stays at command line (REPL-like behavior).

**To continue a multi-line expression**: Navigate up into source and edit there.

**Future enhancement**: Shift+Enter will extend the command line itself for multi-line input.

## Tree Structure

Everything lives on one tree in memory:

- **Source**: Part of tree (user's program)
- **Log**: Part of tree (structured log entries, list of lists of ideas)
- **Tree can be arbitrarily large**
- **Console viewport** (120x80 cells) shows visible portion

## Rendering System

### Direct Rendering (30fps target)

Ideas render themselves directly to canvas, no intermediate text buffer.

```typescript
idea.view(console, mouseX, mouseY, startX, startY) -> Idea | null
```

**Each frame**:

1. Recursively call `view()` on visible ideas
2. Each idea draws itself to canvas (words/strings in single draw calls)
3. Recursively renders children
4. Returns idea under cursor (for click detection)

### Console Grid Model

**Pixel-based character grid**:

```typescript
// Grid positioning (deterministic mapping)
charCol = Math.floor(pixelX / charWidth)
charRow = Math.floor(pixelY / charHeight)

// And reverse
pixelX = charCol * charWidth
pixelY = charRow * charHeight
```

**Font measurement** (JetBrains Mono):
- Set desired `fontSize` (e.g., 14px)
- Measure actual `charWidth` from canvas (monospace guarantees all chars same width)
- Measure actual `charHeight` (ascent + descent)
- Round to integers for clean pixel grid
- Add line spacing for readability

**Drawing strategy**:
- Grid is for positioning and click detection
- Actual rendering draws whole strings/words in one `fillText()` call
- Monospace guarantee means "Hello" at (0,0) occupies columns 0-4

### Performance Optimizations

**Cached line lengths**: After first render, cache each idea's rendered
width/height

- Skip rendering ideas outside viewport bounds
- Only re-render visible portion

**Viewport culling**: Console has visible bounds, ideas outside bounds don't
render

### Interactive Rendering

**Mouse position** passed through recursion:

- Ideas can react to mouse hover
- Display help in status line based on cursor position
- Click detection via returned idea-under-cursor

## Whitespace Model

**Key insight**: Whitespace only makes sense in the context of a List. Atomic ideas (Num, Str) just render themselves.

### Data Structure

**Extra whitespace is stored sparsely on List ideas only**:

```typescript
class List extends Idea {
  items: Idea[]

  // Sparse, sorted array of extra whitespace
  extraWhitespace: Array<{
    index: number,      // which item this follows (-1 for leading)
    spaces: number,     // extra horizontal spaces
    newlines: number    // extra vertical newlines
  }> = []
}
```

**Why this is better**:
- **Memory efficient**: Only stores non-standard whitespace (sparse)
- **Batch normalization**: Can process entire List at once
- **Natural fit**: Every line is an implicit List (collapsed by single-element rule if needed)
- **Clean responsibility**: List handles all layout, atomic ideas never store whitespace

### Rendering with Whitespace

**Two-pointer iteration** (items + extraWhitespace in lockstep):

```typescript
let wsIndex = 0  // pointer into extraWhitespace array

for (let i = 0; i < items.length; i++) {
  renderItem(items[i])  // Atomic idea renders itself

  // Check if next whitespace entry is for this index
  if (wsIndex < extraWhitespace.length &&
      extraWhitespace[wsIndex].index === i) {
    renderWhitespace(extraWhitespace[wsIndex].spaces,
                     extraWhitespace[wsIndex].newlines)
    wsIndex++
  }
  // Otherwise standard notation spacing (handled by context)
}
```

### Normalization Rules

**When cursor leaves a line** (horizontal):
- Clear all `spaces` entries from `extraWhitespace`
- Filter: `extraWhitespace = extraWhitespace.filter(w => w.newlines > 0)`
- Line falls back to standard notation spacing

**When cursor leaves empty line area** (vertical):
- Clamp all `newlines` entries to max 1
- `extraWhitespace.forEach(w => w.newlines = Math.min(w.newlines, 1))`
- At most one empty line between ideas in standard notation

### Empty Line Area Behavior

**Multiple consecutive empty lines** form an "empty line area":

1. **Leaving area** (cursor enters content line) → collapse to 1 newline
2. **Typing on empty line** (making it non-empty) → collapse surrounding empties
3. **Deleting all chars from a line** → merges newlines above + below into multi-newline

This creates natural text-editing flow while maintaining standard notation as the default.

### Insertion (Maintaining Sorted Order)

**Sorted insertion** to maintain invariant:

```typescript
function addWhitespace(index: number, spaces: number, newlines: number) {
  // Binary search for insertion point
  const insertPos = extraWhitespace.findIndex(w => w.index > index)
  if (insertPos === -1) {
    extraWhitespace.push({index, spaces, newlines})
  } else {
    extraWhitespace.splice(insertPos, 0, {index, spaces, newlines})
  }
}
```

Faster than push-and-resort, maintains sorted invariant for efficient rendering.

## Spatial Editing

The rendered tree provides a spatial map for editing:

### Cursor Position Mapping

When cursor is at canvas position (x, y):

1. Last render recorded which idea is at each position
2. Lookup gives us either:
   - **An idea** (cursor on rendered text of that idea)
   - **A location** (cursor in whitespace between/inside ideas)

### Edit Operations

**Character insertion**:

- Cursor on idea → identify which idea, parse new token, replace idea in tree
- Cursor in whitespace → parse as new token, insert at that tree location
- Space character → track in `insertedSpaces`, don't parse

**Deletion**:

- Delete character from idea → re-parse token, update tree
- Delete space → remove from `insertedSpaces` if it was inserted
- Delete entire idea → remove from tree

**Token parsing**:

- Parse the modified token immediately
- Replace old idea with new parsed idea in tree
- Tree re-renders next frame (30fps)

### Example Flow

User types `5` at cursor position (x: 42, y: 10):

1. Find which idea is at (42, 10) via spatial map from last render
2. If it's a `Num("12")`, user is extending it → parse "125" → update tree with
   `Num(125)`
3. If it's whitespace in a `List`, create new `Num("5")` at that position
4. Update tree
5. Next frame (30fps) re-renders with new tree state

## Standard Notation Formatting

**Immediate feedback**: Every character typed triggers parsing and tree update.

This provides immediate feedback - user sees the tree update in real-time.

**Edit line exception**: The currently-editing line preserves extra spaces via
`insertedSpaces` map until cursor moves away.

**No text buffer**: The tree is always the canonical representation. We never
store typed text separately.

## Implementation Status

Currently implemented:

- ✅ Canvas-based console (120x80 grid, JetBrains Mono)
- ✅ Basic parser (barry.ts)
- ✅ Build system (esbuild, matching Nerd structure)
- ✅ Font loading before initialization

To be implemented:

- ⏳ Edit line model with insertedSpaces tracking
- ⏳ Spatial cursor mapping
- ⏳ 30fps render loop
- ⏳ Tree rendering (ideas draw themselves)
- ⏳ Mouse interaction
- ⏳ Three-section console layout (source/command/log)
- ⏳ Navigation and scrolling
- ⏳ Command execution (! prefix)
- ⏳ Incremental token parsing on character input

## Technical Notes

### Why Not Traditional Text Buffer?

Traditional approach: maintain text buffer → parse → run

- Text is source of truth
- Parse on every change or with debouncing
- AST is derived, temporary
- **Language servers** parse repeatedly, throw away AST, repeat

Barry approach: maintain tree → render → display text

- Tree is source of truth
- Text appearance is derived from tree rendering
- Editing manipulates tree directly via spatial mapping
- No intermediate text buffer (except cosmetic spacing)
- **Continuous incremental compilation**: Only re-parse changed tokens

### Continuous Incremental Compilation

**Traditional language servers**:
- Continuously compile code for syntax highlighting and linting
- Throw away the compilation results
- Re-compile on every change

**Barry approach**:
- Tree is always live and compiled
- Syntax highlighting = render the tree (already parsed)
- Linting/errors = tree properties (always available)
- Compilation spread across editing time
- Only changed tokens re-parse (truly incremental)
- **No separate compile stage** - the tree IS the compiled form

This solves the fundamental problem: language servers do real work during editing, but then discard it. Barry preserves the work.
