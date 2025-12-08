// barry.ts
// A simple parser for parsing expressions into an AST of ideas

// Combined regex pattern for token matching with global flag
// Order matters: quoted strings, wraps (parens), numbers, seals, unquoted strings, whitespace
const TOKEN_PATTERN =
  /(?:"(?<quoted>[^"]*)"|(?<open>\()|(?<close>\))|(?<number>-?\d+\.?\d*)|(?<seal>[^\w\s"()]+)|(?<string>\S+)|(?<append>\s+))/g

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
const SealMap = new Map<string, () => Idea>([["+", () => new Add()]])

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

    // No match found - return error idea
    const errorIdea = new Err(`Unknown seal: ${sealString[0]}`)
    this.tokens.push({
      endIndex: matchEndPos,
      idea: errorIdea,
    })
    return errorIdea
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
    } else if (match.groups.open !== undefined) {
      // Opening parenthesis - create List
      idea = new List()
    } else if (match.groups.close !== undefined) {
      // Closing parenthesis - create Closure
      idea = new Closure()
    } else if (match.groups.string !== undefined) {
      // Look up in NameMap, create Str if not found
      if (NameMap.has(match.groups.string)) {
        idea = NameMap.get(match.groups.string)!()
      } else {
        idea = new Str(match.groups.string)
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

    console.log("Created idea:", idea instanceof Closure ? ")" : idea.View())

    // Look-ahead check: if prev is provided, try to consume it
    if (prev !== null) {
      // Check precedence: only consume if our precedence is >= suitor
      if (idea.precedence < suitor) {
        rewind()
        return null
      }
      const consumed = idea.consumePre(prev)
      if (consumed === null) {
        // prev not consumed, return null
        rewind()
        return null
      }
      // prev consumed, use the returned idea
      idea = consumed
    }

    // Handle Closure - return immediately after look-ahead check
    if (idea instanceof Closure) {
      return idea
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

      // Post-process: empty list becomes Nothing
      if (idea.items.length === 0) {
        idea = new Nothing()
      }
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
  finished: boolean = false
  complete: boolean = false // Ideas are incomplete by default

  // Default: ideas don't consume pre (return null)
  consumePre(prev: Idea): Idea | null {
    return null
  }

  abstract View(): string
  abstract Color(): string
}

// Err idea - represents a parse error
export class Err extends Idea {
  message: string

  constructor(message: string) {
    super()
    this.message = message
    this.complete = true // Error doesn't need arguments
  }

  View(): string {
    return `Error: ${this.message}`
  }

  Color(): string {
    return "#fc4b28" // Red for errors
  }
}

// Num idea - stores numeric values
export class Num extends Idea {
  value: number

  constructor(match: string) {
    super()
    this.value = parseFloat(match)
    this.complete = true
  }

  View(): string {
    return this.value.toString()
  }

  Color(): string {
    return "#a6da95" // Green for numbers
  }
}

// Str idea - stores string values
export class Str extends Idea {
  value: string

  constructor(match: string) {
    super()
    this.value = match
    this.complete = true
  }

  View(): string {
    return '"' + this.value + '"'
  }

  Color(): string {
    return "#eed49f" // Yellow for strings
  }
}

// List idea - contains sequence of ideas
export class List extends Idea {
  items: Idea[] = []

  constructor() {
    super()
    this.complete = true
  }

  append(idea: Idea) {
    this.items.push(idea)
  }

  View(): string {
    return "(" + this.items.map((item) => item.View()).join(" ") + ")"
  }

  LineView(): string {
    return this.items.map((item) => item.View()).join(" ")
  }

  Color(): string {
    return "#5da4f4" // Blue for lists/parens
  }
}

// Nothing idea - empty expression
export class Nothing extends Idea {
  constructor() {
    super()
    this.complete = true
  }

  View(): string {
    return "()"
  }

  Color(): string {
    return "#7dc4e4" // Brighter blue like lists
  }
}

// Closure idea - closing parenthesis marker (never inserted in AST)
export class Closure extends Idea {
  constructor() {
    super()
  }

  View(): string {
    throw new Error("Closure should never appear in AST")
  }

  Color(): string {
    return "#ff00ff" // Brighter blue like lists
  }
}

// Add idea - addition operator
export class Add extends Idea {
  left: Idea | null = null
  right: Idea | null = null

  constructor() {
    super()
    this.precedence = 10
  }

  consumePre(prev: Idea): Idea | null {
    if (prev instanceof Num) {
      this.left = prev
      return this
    }
    return null
  }

  consumePost(next: Idea): boolean {
    if (next instanceof Num) {
      this.right = next
      // Only complete when both left and right are filled
      if (this.left !== null) {
        this.complete = true
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

  Color(): string {
    return "#c680f6" // Purple for operators
  }
}
