// barry.ts
// A simple parser for parsing expressions into an AST of ideas

import { DrawContext } from "./console.js"

// Enum for kinds of ideas
export enum Kind {
  Num = "Num",
  Str = "Str",
  Unquoted = "Unquoted",
  Label = "Label",
  List = "List",
  Nothing = "Bit",
  Operator = "Operator",
  Add = "Add",
  Mul = "Mul",
  Blank = "Blank",
}

// Enum for syntax colors
export enum Color {
  Number = "#a6da95",
  String = "#ffb0b0",
  Unquoted = "#eed49f",
  Label = "#44BBEE",
  List = "#EE8888",
  Operator = "#CC88EE",
  Error = "#FF4422",
  Default = "#444444", // Dark gray default
}

// Combined regex pattern for token matching with global flag
// Order matters: quoted strings, wraps (parens), numbers, seals, unquoted strings, whitespace
const TOKEN_PATTERN =
  /(?:"(?<quoted>[^"]*)"|(?<list>\()|(?<closure>\))|(?<number>-?\d+\.?\d*)|(?<seal>[^\w\s"()]+)|(?<unquoted>[^:\s]+)|(?<append>\s+))/g

// Helper function to display an idea - Lists without parentheses
export function LineView(idea: Idea): string {
  if (idea instanceof List) {
    return idea.LineView()
  }
  return idea.View()
}

// Test function
export function Test() {
  console.log("=== Barry Parser Tests ===")

  const testCases = [
    "1234",
    "  42.5  ",
    "-7",
    "12 34",
    "12 (34 56) 78",
    "12+34",
    "1+2+3",
  ]

  const parser = new Parser()
  for (const input of testCases) {
    console.log(`\nInput: "${input}"`)
    try {
      const result = parser.start(input)
      console.log(`  Result: ${LineView(result)}`)
    } catch (e) {
      console.error(`  Error: ${e}`)
    }
  }

  console.log("\n=== Tests Complete ===")
}

// Seal map - maps seal strings to their idea constructors
const SealMap = new Map<string, () => Idea>([
  ["+", () => new Add()],
  ["*", () => new Mul()],
  [":", () => new Label()],
])

// Name map - maps unquoted strings to their idea constructors
const NameMap = new Map<string, () => Idea>([])

// Parser extracts tokens on-demand and creates ideas from input string
export class Parser {
  private regex: RegExp
  private input: string = ""
  tokens: { endIndex: number; idea: Idea }[] = []

  constructor() {
    this.regex = new RegExp(TOKEN_PATTERN.source, TOKEN_PATTERN.flags)
  }

  // Parse a seal string and return the longest matching seal idea
  // Resets regex index so remaining characters will be matched in next call
  private parseSeal(sealString: string, matchEndPos: number): Idea {
    // Try matching from longest to shortest
    for (let len = sealString.length; len > 0; len--) {
      const candidate = sealString.substring(0, len)
      if (SealMap.has(candidate)) {
        // Found a match, reset index to position after this seal
        const consumedLength = len
        this.regex.lastIndex = matchEndPos - sealString.length + consumedLength
        return SealMap.get(candidate)!()
      }
    }

    // No match found - collect consecutive unmatched characters
    let unknownBuffer = sealString[0] // Start with first character
    let consumedLength = 1

    // Check remaining characters to see if any form valid seals
    for (let i = 1; i < sealString.length; i++) {
      const remaining = sealString.substring(i)
      // Try to match remaining string from longest to shortest
      let foundMatch = false
      for (let len = remaining.length; len > 0; len--) {
        const candidate = remaining.substring(0, len)
        if (SealMap.has(candidate)) {
          foundMatch = true
          break
        }
      }
      if (foundMatch) {
        // Stop here - found a valid seal in remaining chars
        break
      }
      // No match, add this char to unknown buffer
      unknownBuffer += sealString[i]
      consumedLength++
    }

    // Create Unquoted for all collected unmatched characters
    this.regex.lastIndex = matchEndPos - sealString.length + consumedLength
    const unquotedIdea = new Unquoted(unknownBuffer)
    this.tokens.push({
      endIndex: this.regex.lastIndex,
      idea: unquotedIdea,
    })
    return unquotedIdea
  }

  // Entry point for parsing - handles root list with special processing
  start(input: string): Idea {
    // Reset state for new input
    this.input = input
    this.regex.lastIndex = 0
    this.tokens = []

    // Create root list
    const rootList = new List()

    // Append loop: consume ideas until EOF
    while (true) {
      const idea = this.next(null, 0)
      if (idea === null) {
        break
      }
      rootList.append(idea)
    }

    // Post-processing: convert based on number of items
    if (rootList.items.length === 0) {
      // Empty list becomes Nothing
      return new Nothing()
    } else if (rootList.items.length === 1) {
      // Single element: (x) = x
      return rootList.items[0]
    }
    // Multiple elements: return the list
    return rootList
  }

  // Get next idea from current position
  // prev is the idea to the left (can be null)
  // suitor is the precedence of the left suitor (0 = no suitor, e.g. in append loops)
  // Returns null if EOF or no valid idea can be created
  // In look-ahead mode (prev !== null), returns null if idea doesn't need prev as left argument
  // Rewinds position if returning null
  next(prev: Idea | null, suitor: number): Idea | null {
    const savedPos = this.regex.lastIndex
    const savedTokenCount = this.tokens.length
    const rewind = () => {
      this.regex.lastIndex = savedPos
      this.tokens.length = savedTokenCount
    }

    let match = this.regex.exec(this.input)

    while (match && match.groups?.append !== undefined) {
      match = this.regex.exec(this.input)
    }

    if (!match || !match.groups) {
      rewind()
      return null
    }

    let idea: Idea | null = null

    if (match.groups.number !== undefined) {
      idea = new Num(match.groups.number)
    } else if (match.groups.quoted !== undefined) {
      // Create Str idea from quoted string (quotes already removed by regex)
      idea = new Str(match.groups.quoted)
    } else if (match.groups.list !== undefined) {
      // Opening parenthesis - create List
      idea = new List()
    } else if (match.groups.closure !== undefined) {
      // Closing parenthesis - create Closure
      idea = new Closure()
    } else if (match.groups.unquoted !== undefined) {
      // Look up in NameMap, create Unquoted if not found
      if (NameMap.has(match.groups.unquoted)) {
        idea = NameMap.get(match.groups.unquoted)!()
      } else {
        idea = new Unquoted(match.groups.unquoted)
      }
    } else if (match.groups.seal !== undefined) {
      // Parse seal - may reset index for remaining characters
      idea = this.parseSeal(match.groups.seal, this.regex.lastIndex)
    } else {
      rewind()
      return null
    }

    // Add token info for successfully parsed idea (skip Closure - it's handled by List)
    if (!(idea instanceof Closure)) {
      this.tokens.push({
        endIndex: this.regex.lastIndex,
        idea: idea,
      })
    }

    // Look-ahead check: if prev is provided, try to consume it
    if (prev !== null) {
      // Check precedence: only consume if our precedence is >= suitor
      if (idea.precedence < suitor) {
        rewind()
        return null
      }
      // Only operators can consume previous ideas
      if (idea instanceof Op) {
        const consumed = idea.consumePre(prev)
        if (consumed === null) {
          // prev not consumed, return null
          rewind()
          return null
        }
        // prev consumed, use the returned idea
        idea = consumed

        // Only remove consumed token for Label (which absorbs and recolors it)
        // Other operators like Add/Mul preserve their arguments' original colors
        if (idea instanceof Label) {
          this.tokens.splice(this.tokens.length - 2, 1)
        }
      } else {
        // Not an operator, can't consume prev
        rewind()
        return null
      }
    }

    // Handle Closure - return immediately after look-ahead check
    if (idea instanceof Closure) {
      return idea
    }

    // Fill recursion: if idea has right argument slots, try to fill them
    if ("consumePost" in idea) {
      const postPos = this.regex.lastIndex
      const rewindPost = () => {
        this.regex.lastIndex = postPos
      }
      const nextIdea = this.next(null, idea.precedence)
      if (nextIdea !== null) {
        if (!(idea as any).consumePost(nextIdea)) {
          // Didn't consume, rewind so next idea can be used elsewhere
          rewindPost()
        }
      }
    }

    // Handle List - run append loop until Closure or EOF
    if (idea instanceof List) {
      while (true) {
        const item = this.next(null, 0)
        if (item === null) {
          // EOF - end of list
          break
        }
        if (item instanceof Closure) {
          // Add the same List idea again for the closing paren
          this.tokens.push({
            endIndex: this.regex.lastIndex,
            idea: idea,
          })
          break
        }
        idea.append(item)
      }

      // Post-process: apply single element rule
      if (idea.items.length === 0) {
        idea = new Nothing()
      } else if (idea.items.length === 1) {
        idea = idea.items[0]
      }
    }

    // Look-ahead recursion: check if something needs this idea as left argument
    // Pass the suitor precedence we received, not our own
    const nextIdea = this.next(idea, suitor)
    if (nextIdea !== null) {
      return nextIdea
    }

    return idea
  }
}

// Base class for all ideas (AST nodes)
export abstract class Idea {
  precedence: number = 0
  error: string | null = null
  baseColor: Color = Color.Default
  abstract kind: Kind
  abstract returnKind: Kind

  abstract View(): string
  abstract Draw(ctx: DrawContext): void

  Color(): Color {
    if (this.error !== null) return Color.Error
    return this.baseColor
  }

  Info(ctx: DrawContext): void {
    ctx.write(this.kind, this.baseColor)
    if (this.error !== null) {
      ctx.write(" ", this.baseColor)
      ctx.write(this.error, Color.Error)
    }

    const result = this.Eval()
    ctx.write(" => ", this.baseColor)
    ctx.write(result.View(), result.Color())
  }

  Eval(): Idea {
    return new Blank()
  }
}

// Op - base class for operators
export abstract class Op extends Idea {
  complete: boolean = false // Operators track completion

  consumePre(prev: Idea): Idea | null {
    return null
  }
}

// Value - base class for value ideas
export abstract class Value extends Idea {
  // Values are always complete, no tracking needed

  Eval(): Idea {
    return this // Values evaluate to themselves
  }
}

// Num idea - stores numeric values
export class Num extends Value {
  kind = Kind.Num
  returnKind = Kind.Num
  baseColor = Color.Number
  value: number

  constructor(match: string | number) {
    super()
    this.value = typeof match === "string" ? parseFloat(match) : match
  }

  View(): string {
    return this.value.toString()
  }

  Draw(ctx: DrawContext): void {
    ctx.write(this.View(), this.Color(), this)
  }
}

// Str idea - stores string values
export class Str extends Value {
  kind = Kind.Str
  returnKind = Kind.Str
  baseColor = Color.String
  value: string

  constructor(match: string) {
    super()
    this.value = match
  }

  View(): string {
    return '"' + this.value + '"'
  }

  Draw(ctx: DrawContext): void {
    ctx.write(this.View(), this.Color(), this)
  }
}

// Unquoted idea - stores unquoted string values
export class Unquoted extends Value {
  kind = Kind.Unquoted
  returnKind = Kind.Unquoted
  baseColor = Color.Unquoted
  value: string

  constructor(match: string) {
    super()
    this.value = match
  }

  View(): string {
    return this.value
  }

  Draw(ctx: DrawContext): void {
    ctx.write(this.View(), this.Color(), this)
  }
}

// Label idea - marks a value with a name (infix colon operator)
export class Label extends Op {
  kind = Kind.Label
  returnKind = Kind.Label
  baseColor = Color.Label
  name: string | null = null
  labeled: Idea | null = null

  constructor() {
    super()
    this.precedence = 1 // Very low - only higher than append (0)
  }

  consumePre(prev: Idea): Idea | null {
    if (prev.returnKind === Kind.Unquoted) {
      this.name = (prev as Unquoted).value
      return this
    }
    return null
  }

  consumePost(next: Idea): boolean {
    this.labeled = next
    this.complete = true
    return true
  }

  View(): string {
    const nameStr = this.name ?? "_"
    const labeledStr = this.labeled ? this.labeled.View() : "_"
    return nameStr + ":" + labeledStr
  }

  Draw(ctx: DrawContext): void {
    if (this.name !== null) {
      ctx.write(this.name + ":", this.Color(), this)
      ctx.write(" ", this.Color(), this)
    } else {
      ctx.write("_:", this.Color(), this)
      ctx.write(" ", this.Color(), this)
    }
    if (this.labeled !== null) {
      this.labeled.Draw(ctx)
    } else {
      ctx.write("_", this.Color(), this)
    }
  }
}

// List idea - contains sequence of ideas
export class List extends Value {
  kind = Kind.List
  returnKind = Kind.List
  baseColor = Color.List
  items: Idea[] = []
  labelMap: Map<string, Label> = new Map() // name → Label (fast lookup)
  breakpoint: number = -1 // -1: horizontal, 0: break immediately (vertical), >0: break after nth element

  constructor() {
    super()
  }

  append(idea: Idea) {
    this.items.push(idea)

    // If it's a Label, add to labelMap for fast lookup
    if (idea instanceof Label && idea.name !== null) {
      // Check for duplicate labels
      if (this.labelMap.has(idea.name)) {
        idea.error = `duplicate label`
      } else {
        this.labelMap.set(idea.name, idea)
      }
    }
  }

  View(): string {
    return "(" + this.items.map((item) => item.View()).join(" ") + ")"
  }

  LineView(): string {
    return this.items.map((item) => item.View()).join(" ")
  }

  Eval(): Idea {
    const result = new List()
    for (const item of this.items) {
      result.append(item.Eval())
    }
    return result
  }

  Draw(ctx: DrawContext): void {
    // Omit parens if at line start (implicit list), unless horizontal list starts with label
    const showParens =
      !ctx.lineStart ||
      (this.breakpoint !== 0 &&
        this.items.length > 0 &&
        this.items[0] instanceof Label)

    if (showParens) {
      ctx.write("(", this.Color(), this)
    } else if (this.breakpoint === -1) {
      // Only horizontal lists set lineStart to false when omitting parens
      ctx.lineStart = false
    }

    if (this.breakpoint === 0) {
      // Vertical layout: break immediately, each item on its own line
      for (let i = 0; i < this.items.length; i++) {
        if (!ctx.inSourceBounds()) break // Stop if out of bounds
        this.items[i].Draw(ctx)
        ctx.newLine()
      }
    } else {
      // Horizontal layout: all on one line with spaces
      for (let i = 0; i < this.items.length; i++) {
        this.items[i].Draw(ctx)
        if (i < this.items.length - 1) {
          ctx.write(" ", this.Color(), this)
        }
      }
    }

    if (showParens) {
      ctx.write(")", this.Color(), this)
    }
  }
}

// Nothing idea - empty expression
export class Nothing extends Value {
  kind = Kind.Nothing
  returnKind = Kind.Nothing
  baseColor = Color.List

  constructor() {
    super()
  }

  View(): string {
    return "()"
  }

  Draw(ctx: DrawContext): void {
    ctx.write(this.View(), this.Color(), this)
  }
}

// Closure idea - closing parenthesis marker (never inserted in AST)
export class Closure extends Idea {
  kind = Kind.Nothing
  returnKind = Kind.Nothing

  View(): string {
    throw new Error("Closure should never appear in AST")
  }

  Draw(ctx: DrawContext): void {
    throw new Error("Closure should never appear in AST")
  }
}

// Blank idea - represents missing/undefined values (marker, not a real node)
export class Blank extends Idea {
  kind = Kind.Blank
  returnKind = Kind.Blank

  View(): string {
    return "_"
  }

  Draw(ctx: DrawContext): void {
    ctx.write("_", this.Color(), this)
  }
}

// Add idea - addition operator
export class Add extends Op {
  kind = Kind.Add
  returnKind = Kind.Operator
  baseColor = Color.Operator
  left: Idea | null = null
  right: Idea | null = null

  constructor() {
    super()
    this.precedence = 10
  }

  consumePre(prev: Idea): Idea | null {
    if (prev.returnKind === Kind.Num) {
      this.left = prev
      return this
    }
    return null
  }

  consumePost(next: Idea): boolean {
    if (next.returnKind === Kind.Num) {
      this.right = next
      // Only complete when both left and right are filled
      if (this.left !== null) {
        this.complete = true
        this.returnKind = Kind.Num
      }
      return true
    }
    return false
  }

  View(): string {
    const leftArg = this.left === null ? "_" : this.left.View()
    const rightArg = this.right === null ? "_" : this.right.View()
    return leftArg + "+" + rightArg
  }

  Eval(): Idea {
    if (this.left === null || this.right === null) {
      return new Blank()
    }
    const leftResult = this.left.Eval()
    const rightResult = this.right.Eval()

    if (leftResult instanceof Num && rightResult instanceof Num) {
      return new Num(leftResult.value + rightResult.value)
    }
    return new Blank()
  }

  Draw(ctx: DrawContext): void {
    if (this.left !== null) {
      const needsParens =
        this.left.precedence > 0 && this.left.precedence < this.precedence
      if (needsParens) ctx.write("(", Color.List, this)
      this.left.Draw(ctx)
      if (needsParens) ctx.write(")", Color.List, this)
    } else {
      ctx.write("_", this.Color(), this)
    }
    ctx.write("+", this.Color(), this)
    if (this.right !== null) {
      const needsParens =
        this.right.precedence > 0 && this.right.precedence < this.precedence
      if (needsParens) ctx.write("(", Color.List, this)
      this.right.Draw(ctx)
      if (needsParens) ctx.write(")", Color.List, this)
    } else {
      ctx.write("_", this.Color(), this)
    }
  }
}

// Mul idea - multiplication operator
export class Mul extends Op {
  kind = Kind.Mul
  returnKind = Kind.Operator
  baseColor = Color.Operator
  left: Idea | null = null
  right: Idea | null = null

  constructor() {
    super()
    this.precedence = 20
  }

  consumePre(prev: Idea): Idea | null {
    if (prev.returnKind === Kind.Num) {
      this.left = prev
      return this
    }
    return null
  }

  consumePost(next: Idea): boolean {
    if (next.returnKind === Kind.Num) {
      this.right = next
      // Only complete when both left and right are filled
      if (this.left !== null) {
        this.complete = true
        this.returnKind = Kind.Num
      }
      return true
    }
    return false
  }

  View(): string {
    const leftArg = this.left === null ? "_" : this.left.View()
    const rightArg = this.right === null ? "_" : this.right.View()
    return leftArg + "*" + rightArg
  }

  Eval(): Idea {
    if (this.left === null || this.right === null) {
      return new Blank()
    }
    const leftResult = this.left.Eval()
    const rightResult = this.right.Eval()

    if (leftResult instanceof Num && rightResult instanceof Num) {
      return new Num(leftResult.value * rightResult.value)
    }
    return new Blank()
  }

  Draw(ctx: DrawContext): void {
    if (this.left !== null) {
      const needsParens =
        this.left.precedence > 0 && this.left.precedence < this.precedence
      if (needsParens) ctx.write("(", Color.List, this)
      this.left.Draw(ctx)
      if (needsParens) ctx.write(")", Color.List, this)
    } else {
      ctx.write("_", this.Color(), this)
    }
    ctx.write("*", this.Color(), this)
    if (this.right !== null) {
      const needsParens =
        this.right.precedence > 0 && this.right.precedence < this.precedence
      if (needsParens) ctx.write("(", Color.List, this)
      this.right.Draw(ctx)
      if (needsParens) ctx.write(")", Color.List, this)
    } else {
      ctx.write("_", this.Color(), this)
    }
  }
}
