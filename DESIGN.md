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

When user types in command line and presses Enter:

- **If starts with `!`**: Execute as command (like `!bang .`, `!clear`, etc.)
- **Otherwise**: Parse line → append to end of source tree

After Enter, command line clears and cursor stays at command line (REPL-like
behavior).

User can then navigate up into source to edit previous lines.

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
2. Each idea draws itself to canvas
3. Recursively renders children
4. Returns idea under cursor (for click detection)

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

## Edit Line Model

The key to handling whitespace during editing:

### Concept

- **One active edit line** at a time (where cursor is)
- **Preserve extra whitespace** inserted during editing on that line only
- **All other lines** render from tree in standard notation
- **Tree stays up-to-date** via incremental token parsing

### Data Structure

```typescript
interface EditState {
  lineY: number; // Which line is being edited
  insertedSpaces: Map<number, number>; // column → extra spaces count
}
```

**Note**: We do NOT store a text buffer. The tree is always the source of truth.

### Behavior

**While editing a line**:

- User types character → parse token immediately → update tree
- User types space → track in `insertedSpaces` map
- Edit line renders: standard notation from tree + inserted spaces
- All other lines: render pure standard notation from tree

**When cursor moves to different line** (Y position changes):

1. Clear `insertedSpaces` (old line now renders without extra spaces)
2. Set new `editState.lineY` to current cursor Y
3. Start fresh space tracking for new edit line

**Result**:

- Tree is always up-to-date (no deferred parsing)
- During editing: extra spaces preserved on edit line only
- After leaving line: spaces cleared, line renders in pure standard notation
- Clean separation between "tree state" and "cosmetic spacing state"

### Why This Works

- Only one "dirty" line at a time (simple mental model)
- No deferred parsing needed - tree updates immediately on each character
- Tree stays clean (standard notation)
- User gets familiar text-editing experience with spaces
- When user types `12 `, the space is tracked but doesn't disappear until cursor
  moves away

### Example

User on line 5, types: `1`, `2`, space, `3`, `4`

```
After '1': insertedSpaces={}, tree updated with Num(1)
After '2': insertedSpaces={}, tree updated with Num(12)
After ' ': insertedSpaces={2: 1}, tree unchanged
After '3': insertedSpaces={2: 1}, tree has Num(12) and new Num(3)
After '4': insertedSpaces={2: 1}, tree updated with Num(34)
Render line 5: "12 34" (space from insertedSpaces)

User moves to line 6:
Clear insertedSpaces
Render line 5: "12 34" (pure standard notation, happens to have one space)
```

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

Barry approach: maintain tree → render → display text

- Tree is source of truth
- Text appearance is derived from tree rendering
- Editing manipulates tree directly via spatial mapping
- No intermediate text buffer (except cosmetic spacing)

### Whitespace Strategy

The `insertedSpaces` approach solves a critical problem:

- User types: `12 ` (needs space to continue typing next token)
- Without tracking: space disappears immediately (standard notation has no
  trailing space)
- With tracking: space preserved on edit line, disappears when cursor leaves
- This allows natural text-editing flow while maintaining tree as source of
  truth
