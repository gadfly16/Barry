# Language.md

Language specification, design notes, and implementation decisions for Barry.

## Language Specification

### Value Ideas

- **Num**: 64-bit float (e.g., `12.34`, `-7`)
- **Str**: String literal
  - Quoted: `"Hello World!"` (always produces Str)
  - Unquoted: `fish` (becomes Str if no label resolves it)
- **Bit**: Single bit value
  - All/True: `.`
  - Nothing/False: `()`
- **List**: Compound value, sequence of ideas

### Lexical Rules

**Token pattern** (order matters):
1. Quoted strings: `"[^"]*"`
2. Wraps (structural): `(` and `)`
3. Numbers: `-?\d+\.?\d*`
4. Seals: `[^\w\s"()]+` (excludes wraps)
5. Unquoted strings: `\S+` (non-whitespace)
6. Whitespace: `\s+`

**Wraps vs Seals**: Parentheses are structural constructs (wraps), not operators
(seals). They have dedicated lexical rules and cannot be part of multi-character
seals.

**Whitespace semantics**: Only meaningful for `.` operator
- `x.y` → AllOp (member access, no whitespace)
- `x . y` → All value (whitespace around dot)

### Single Element Rule

Lists with one element become that element. Empty lists become Nothing.
- `(x)` is indistinguishable from `x`
- `()` is Nothing
- Applies recursively after parsing

### Implicit Lists

**Vertical implicit list**: Input lines form a list (one idea per line)
**Horizontal implicit list**: Ideas on each line form a list (space-separated)

Single element rule removes unnecessary nesting.

```
1
2 3
4 5 6
```
Produces: `1 (2 3) (4 5 6)` after single element rule on line 1.

### Indentation and Line Breaking

**Increased indentation**: Continues previous line in vertical layout
- Must follow immediately (no blank line)
- **Error if nothing to continue** (except after labels)
- Line with ideas starts vertical continuation

```
1 2
  3     # continues line: 1 2 3
  4 5   # still vertical: produces 1 2 3 (4 5)
```

**Labels and vertical layout**:
- Labels can start vertical continuation
- Breaking after label: refers to entire list
- Same line after label: refers to first element

```
a: 1 2 3        # a refers to 1 (first element)
b:
  1 2 3         # b refers to (1 2 3) (entire list)
```

- Empty labels are errors: `a:\n\n` (nothing to name)

**Breakable operators**: Operators with >1 right arg, no left arg
- Can break into vertical layout if first in line
- Reset indentation after completion (non-variadic only)

### Operators

**Arithmetic**: `+` (Add), `-` (Sub), `*` (Mul), `/` (Div)

**Comparison**: `=` (Eq), `!=` (Inequal), `>`, `<`

**Labels**: `:` (Def - label definition)
- `x: 1` labels the value 1 as x
- Visible downstream (children can reference)
- Operators hide upstream labels except upstream operators

**References**: Unquoted strings resolve to labels
- Forward references allowed (hoisting)
- Unquoted strings remain Str if unresolved

**All operator**: `.` (member access)
- `x.y` accesses y inside x
- Absolute reference: `.x` (from root)
- Relative reference: `..x`, `...x` (up parent chain)

**Define operator**: `->` (function/operator definition)
- `x -> x * 2` defines unary operator
- `a b -> a + b` defines binary operator
- `_ op _` defines infix (blank marks operator position)
- Operators return last element

**Mutators**: `:=` (Set - assignment)
- Changes tree structure
- Can use relative/absolute references to mutate outside scope

**Cat**: `~` (catenation/knitting)
- `(1 2) ~ (3 4)` → `1 2 3 4`
- Works on lists and strings

**Other operators**:
- `@` (At - indexing, starts at 1)
- `..` (Unroll - spread list elements)
- `?` (So - truthiness test)
- `if` (conditional, 3 arguments)
- `match` (pattern matching, variadic)

**Incomplete operators**: Operators with unfilled arguments
- `(+ 5)` is Add with left unfilled
- `_` (blank) explicitly marks unfilled slots

### Natlang (Comments)

```
>> end of line comment
inline >>comment>> continues
```

Preserved on tree as Natlang ideas, removed in later reduction stages.

### Metadata

`@` accesses metadata on any idea
- `x.@.quantity` accesses metadata
- Invisible to single element rule
- Used for units, documentation, types, etc.

---

## Implementation Notes

This document captures insights and decisions about the Barry language
specification as they emerge during implementation. It complements Barry.md (the
spec) by documenting the reasoning behind choices and tracking unresolved
questions.

## Open Questions


### Whitespace Semantics

**Context**: The spec mentions whitespace is only meaningful for the `.`
operator (All vs AllOp distinction).

**Questions**:

1. Are All and AllOp the only operators affected by whitespace?
2. Should the lexer or parser handle this distinction?
3. How does this interact with the spatial editing model?

**Current approach**:

- Whitespace handled by regex token pattern with `append` group
- Parser skips whitespace tokens in main loop
- No special handling for `.` operator yet (not implemented)

**Considerations**:

- Lexical rule: `x.y` is AllOp, `x . y` is All
- Parser could distinguish All token vs AllOp token based on surrounding
  whitespace
- Spatial editing stores whitespace sparsely on List ideas only
- Need to handle both text input and tree-based editing consistently

**Decision**: Distinguish All vs AllOp tokens at lexer stage (safe bet, minimal
parser complexity)

### Single Element Rule Edge Cases

**Context**: Spec states `(x)` is indistinguishable from `x` - lists with one
element become that element.

**Implementation**: Applied in two places:

1. Root list in `start()`: 0 elements → Nothing, 1 element → unwrap, 2+ → keep
   list
2. Nested lists in `next()`: empty list → Nothing after closing paren

**Questions**:

- Should this apply to all lists uniformly?
- Does this affect operator precedence or grouping?
- How does spatial editing handle this transformation?

**Current behavior**: Seems correct, but needs more testing with nested
expressions

## Implementation Decisions

### TokenInfo Structure

**Decision**: `{ endIndex: number, idea: Idea }`

**Rationale**:

- Each token points to the idea it represents
- Idea has `Color()` method for syntax highlighting
- Allows rich information (completeness, type, etc.) via idea reference
- More flexible than storing just color string

**Alternative considered**:
`{ endIndex: number, kind: string, color: string }` - rejected as too limited

### Error Recovery Strategy

**Decision**: Lenient mode - continue parsing after errors

**Rationale**: Parser creates `Err` ideas for problematic portions (e.g.,
unknown seals) and continues parsing the rest of the input. This allows users
to see all errors at once rather than fixing them one by one.

### Error Handling

**Decision**: `Err` class represents parse errors as first-class ideas

**Rationale**:

- Errors are ideas that can live in the AST
- Rendered with color (#fc4b28 red) via `Color()` method
- `complete = true` (error doesn't need arguments)
- Tracked in TokenInfo for syntax highlighting

### Parentheses Token Tracking

**Decision**: Skip `Closure`, add `List` idea twice (opening and closing
positions)

**Rationale**:

- `Closure` is a marker that never appears in AST
- Both `(` and `)` belong to the same List idea conceptually
- Allows consistent coloring of matching parentheses
- Simplifies token-to-idea mapping

**Implementation**:

```typescript
// Skip Closure in main token tracking
if (!(idea instanceof Closure)) {
  this.tokens.push({ endIndex: this.regex.lastIndex, idea: idea });
}

// Add List again when Closure encountered
if (item instanceof Closure) {
  this.tokens.push({ endIndex: this.regex.lastIndex, idea: idea });
  break;
}
```

### Parser State and Rewind

**Decision**: Save both regex position and token count for rewind

**Rationale**:

- Look-ahead may not consume tokens
- Precedence conflicts require backtracking
- Token list must stay synchronized with parse position

**Implementation**:

```typescript
const savedPos = this.regex.lastIndex;
const savedTokenCount = this.tokens.length;
const rewind = () => {
  this.regex.lastIndex = savedPos;
  this.tokens.length = savedTokenCount;
};
```

## Future Considerations

### Operators Not Yet Implemented

From spec but not in parser:

- `.` (All/AllOp - member access)
- `()` (Nothing)
- `*` (Mul - multiplication)
- `/` (Div - division)
- `-` (Sub - subtraction)
- `:=` (Set - assignment)
- `=` (Eq - equality check)
- `:` (Def - definition)
- `@` (At - indexing)
- `..` (Unroll)

### Type System

Spec mentions "physical quantities" as motivation. Questions:

- Should parser track units?
- Runtime type checking or compile-time?
- How do operators interact with typed values?

### Spatial Editing

Playground.md outlines tree-driven editing model. Language implications:

- How does text ↔ tree synchronization work?
- Where is whitespace stored in AST?
- Can all valid trees be serialized to text?

## Notes

This document should be updated whenever:

1. Implementation reveals spec ambiguities
2. Design decisions are made about language semantics
3. Edge cases or limitations are discovered
4. New features are planned or implemented
