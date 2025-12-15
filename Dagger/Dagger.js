// Dagger - First implementation of Barry (compiler + editor)
// Target: ECMAScript2024

// === Style System ===

// Syntax colors
const Color = {
  White: "#f7f8fa",
  Black: "#101113",
  Light: "#b2b3b5",
  Middle: "#8e8f91",
  Dark: "#1c1d21",
  Aqua: "#51dbe5",
  Blue: "#396cff",
  Brown: "#6f5700",
  Violet: "#ce51e4",
  Yellow: "#d6e26e",
  Pink: "#ce857a",
  Mint: "#aff188",
  Red: "#f01f1c",
  Green: "#74bb46",
  Orange: "#c85d18",
  Sky: "#6290ff",
}

// Font definitions
const Font = {
  Normal: "14px JetBrains Mono",
  Italic: "italic 14px JetBrains Mono",
}

// Character metrics - initialized by StyleInit()
let fresh = false
let charWidth = 0
let charHeight = 0

// Initialize style system - measures font metrics
function StyleInit() {
  if (fresh) return

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Failed to create measurement canvas context")
  }

  ctx.font = Font.Normal
  const metrics = ctx.measureText("M")
  charWidth = metrics.width
  // Line height is 1.5x measured font height
  const measuredHeight =
    metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
  charHeight = Math.floor(measuredHeight * 1.25)

  fresh = true
}

// Style functions - draw text with specific styling
// Each function: (canvasCtx, text, x, y) => renderedLength
const Style = {
  Number: (cctx, text, x, y) => {
    cctx.fillStyle = Color.Mint
    cctx.fillText(text, x, y)
    return text.length
  },

  String: (cctx, text, x, y) => {
    cctx.fillStyle = Color.Aqua
    cctx.font = Font.Italic
    cctx.fillText('"' + text + '"', x, y)
    cctx.font = Font.Normal
    return text.length + 2
  },

  Unquoted: (cctx, text, x, y) => {
    cctx.fillStyle = Color.Orange
    cctx.fillText(text, x, y)
    return text.length
  },

  Label: (cctx, text, x, y) => {
    cctx.fillStyle = Color.Blue
    cctx.fillText(text, x, y)
    cctx.fillStyle = Color.Sky
    cctx.fillText(": ", x + text.length * charWidth, y)
    return text.length + 2
  },

  List: (cctx, text, x, y) => {
    cctx.fillStyle = Color.Sky
    cctx.fillText(text, x, y)
    return text.length
  },

  Nothing: (cctx, text, x, y) => {
    cctx.fillStyle = Color.Middle
    cctx.fillText(text, x, y)
    return text.length
  },

  Operator: (cctx, text, x, y) => {
    cctx.fillStyle = Color.Violet
    cctx.fillText(text, x, y)
    return text.length
  },

  Blank: (cctx, text, x, y) => {
    cctx.fillStyle = Color.Middle
    cctx.fillText(text, x, y)
    return text.length
  },

  Jam: (cctx, text, x, y) => {
    cctx.fillStyle = Color.Red
    cctx.fillText(text, x, y)
    return text.length
  },
}

// === Barry Parser ===

// Kinds of ideas
const Kind = {
  Num: "Num",
  Str: "Str",
  Unquoted: "Unquoted",
  Label: "Label",
  List: "List",
  Nothing: "Bit",
  Operator: "Operator",
  Add: "Add",
  Mul: "Mul",
  Blank: "Blank",
}

// Bind values (precedence)
const Bind = {
  NonBinding: 0,
  Append: 1,
  LabelRight: 2,
  Additive: 3,
  Multiplicative: 4,
  LabelLeft: 5,
}

// Combined regex pattern for token matching
const TOKEN_PATTERN =
  /(?:"(?<quoted>[^"]*)"|(?<list>\()|(?<closure>\))|(?<number>-?\d+\.?\d*)|(?<seal>[^\w\s"()]+)|(?<unquoted>[^:\s]+)|(?<append>\s+))/g

// Helper function to display an idea - Lists without parentheses
function LineView(idea) {
  if (idea instanceof List) {
    return idea.LineView()
  }
  return idea.View()
}

// Test function
function Test() {
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
const SealMap = new Map([
  ["+", () => new Add()],
  ["*", () => new Mul()],
  [":", () => new Label()],
])

// Name map - maps unquoted strings to their idea constructors
const NameMap = new Map()

// Parser extracts tokens on-demand and creates ideas from input string
class Parser {
  regex = new RegExp(TOKEN_PATTERN.source, TOKEN_PATTERN.flags)
  input = ""
  fresh = false
  tokens = []

  // Parse a seal string and return the longest matching seal idea
  parseSeal(sealString, matchEndPos) {
    // Try matching from longest to shortest
    for (let len = sealString.length; len > 0; len--) {
      const candidate = sealString.substring(0, len)
      if (SealMap.has(candidate)) {
        const consumedLength = len
        this.regex.lastIndex = matchEndPos - sealString.length + consumedLength
        return SealMap.get(candidate)()
      }
    }

    // No match found - collect consecutive unmatched characters
    let unknownBuffer = sealString[0]
    let consumedLength = 1

    for (let i = 1; i < sealString.length; i++) {
      const remaining = sealString.substring(i)
      let foundMatch = false
      for (let len = remaining.length; len > 0; len--) {
        const candidate = remaining.substring(0, len)
        if (SealMap.has(candidate)) {
          foundMatch = true
          break
        }
      }
      if (foundMatch) break
      unknownBuffer += sealString[i]
      consumedLength++
    }

    this.regex.lastIndex = matchEndPos - sealString.length + consumedLength
    const unquotedIdea = new Unquoted(unknownBuffer)
    this.tokens.push({
      endIndex: this.regex.lastIndex,
      idea: unquotedIdea,
    })
    return unquotedIdea
  }

  // Entry point for parsing
  start(input) {
    this.input = input
    this.regex.lastIndex = 0
    this.tokens = []
    this.fresh = true

    const result = this.next(null, Bind.Append)
    return result ?? new Nothing()
  }

  // Get next idea from current position
  next(prev, suitor) {
    const savedPos = this.regex.lastIndex
    const savedTokenCount = this.tokens.length
    const rewind = () => {
      this.regex.lastIndex = savedPos
      this.tokens.length = savedTokenCount
    }

    let idea = null

    if (this.fresh) {
      idea = new List(true)
      this.fresh = false
    } else {
      let match = this.regex.exec(this.input)

      while (match && match.groups?.append !== undefined) {
        match = this.regex.exec(this.input)
      }

      if (!match || !match.groups) {
        rewind()
        return null
      }

      if (match.groups.number !== undefined) {
        idea = new Num(match.groups.number)
      } else if (match.groups.quoted !== undefined) {
        idea = new Str(match.groups.quoted)
      } else if (match.groups.list !== undefined) {
        idea = new List()
      } else if (match.groups.closure !== undefined) {
        idea = new Closure()
      } else if (match.groups.unquoted !== undefined) {
        if (NameMap.has(match.groups.unquoted)) {
          idea = NameMap.get(match.groups.unquoted)()
        } else {
          idea = new Unquoted(match.groups.unquoted)
        }
      } else if (match.groups.seal !== undefined) {
        idea = this.parseSeal(match.groups.seal, this.regex.lastIndex)
      } else {
        rewind()
        return null
      }

      if (!(idea instanceof Closure)) {
        this.tokens.push({
          endIndex: this.regex.lastIndex,
          idea: idea,
        })
      }
    }

    // Look-ahead check
    if (prev !== null) {
      if (idea.lBind < suitor) {
        rewind()
        return null
      }
      if (idea instanceof Op) {
        const consumed = idea.consumePre(prev)
        if (consumed === null) {
          rewind()
          return null
        }
        idea = consumed

        if (idea instanceof Label) {
          this.tokens.splice(this.tokens.length - 2, 1)
        }
      } else {
        rewind()
        return null
      }
    }

    if (idea instanceof Closure) {
      return idea
    }

    // Fill recursion
    if ("consumePost" in idea) {
      const postPos = this.regex.lastIndex
      const rewindPost = () => {
        this.regex.lastIndex = postPos
      }
      const nextIdea = this.next(null, idea.rBind)
      if (nextIdea !== null) {
        if (!idea.consumePost(nextIdea)) {
          rewindPost()
        }
      }
    }

    // Handle List
    if (idea instanceof List) {
      let list = idea
      while (true) {
        let item = this.next(null, Bind.Append)
        if (item === null) break
        if (item instanceof Closure) {
          if (list.implicit) {
            const nll = new List()
            nll.implicit = true
            list.implicit = false
            nll.append(list)
            this.tokens.push({
              endIndex: this.regex.lastIndex,
              idea: list,
            })
            list = nll
            continue
          } else {
            this.tokens.push({
              endIndex: this.regex.lastIndex,
              idea: item,
            })
            break
          }
        }
        list.append(item)
      }

      // Apply single element rule
      if (list.items.length === 0) {
        idea = new Nothing()
      } else if (list.items.length === 1) {
        idea = list.items[0]
      } else {
        idea = list
      }
    }

    // Look-ahead recursion
    const nextIdea = this.next(idea, suitor)
    if (nextIdea !== null) {
      return nextIdea
    }

    return idea
  }
}

// === Ideas (AST nodes) ===

// Base class for all ideas
class Idea {
  lBind = Bind.NonBinding
  rBind = Bind.NonBinding
  jam = null
  baseColor = Color.Black

  Color() {
    if (this.jam !== null) return Color.Red
    return this.baseColor
  }

  Status(wctx) {
    wctx.Write(this.kind, Style.Unquoted)
    this.JamInfo(wctx)
    const result = this.Eval()
    wctx.Write(" => ", Style.Operator)
    wctx.Write(result.View(), Style.Unquoted)
  }

  JamInfo(wctx) {
    if (this.jam !== null) {
      wctx.Write(' !"' + this.jam + '"', Style.Jam)
    }
  }

  Eval() {
    return new Blank()
  }
}

// Op - base class for operators
class Op extends Idea {
  complete = false
  baseColor = Color.Violet

  constructor() {
    super()
  }

  consumePre(prev) {
    return null
  }
}

// Value - base class for value ideas
class Value extends Idea {
  Eval() {
    return this
  }
}

// Num idea - stores numeric values
class Num extends Value {
  kind = Kind.Num
  returnKind = Kind.Num
  baseColor = Color.Mint
  value

  constructor(match) {
    super()
    this.value = typeof match === "string" ? parseFloat(match) : match
  }

  View() {
    return this.value.toString()
  }

  Write(wctx) {
    wctx.Write(this.View(), Style.Number, this)
  }
}

// Str idea - stores string values
class Str extends Value {
  kind = Kind.Str
  returnKind = Kind.Str
  baseColor = Color.Aqua
  value

  constructor(match) {
    super()
    this.value = match
  }

  View() {
    return '"' + this.value + '"'
  }

  Write(wctx) {
    wctx.Write(this.value, Style.String, this)
  }
}

// Unquoted idea - stores unquoted string values
class Unquoted extends Value {
  kind = Kind.Unquoted
  returnKind = Kind.Unquoted
  baseColor = Color.Pink
  value

  constructor(match) {
    super()
    this.value = match
  }

  View() {
    return this.value
  }

  Write(wctx) {
    wctx.Write(this.View(), Style.Unquoted, this)
  }
}

// Label idea - marks a value with a name (infix colon operator)
class Label extends Op {
  kind = Kind.Label
  returnKind = Kind.Label
  baseColor = Color.Blue
  name = null
  labeled = null
  lBind = Bind.LabelLeft
  rBind = Bind.LabelRight

  constructor() {
    super()
  }

  consumePre(prev) {
    if (prev.returnKind === Kind.Unquoted) {
      this.name = prev.value
      return this
    }
    return null
  }

  consumePost(next) {
    this.labeled = next
    this.returnKind = next.returnKind
    this.lBind = next.lBind
    this.rBind = next.rBind
    this.complete = true
    return true
  }

  View() {
    const nameStr = this.name ?? "_"
    const labeledStr = this.labeled ? this.labeled.View() : "_"
    return nameStr + ":" + labeledStr
  }

  Write(wctx) {
    if (this.name !== null) {
      wctx.Write(this.name, Style.Label, this)
    } else {
      wctx.Write("_", Style.Label, this)
    }
    if (this.labeled !== null) {
      this.labeled.Write(wctx)
    } else {
      wctx.Write("_", Style.Blank, this)
    }
  }

  Eval() {
    if (this.labeled === null) {
      return new Blank()
    }
    return this.labeled.Eval()
  }

  Status(wctx) {
    wctx.Write("Label ", Style.Unquoted)
    if (this.name !== null) {
      wctx.Write(this.name, Style.Label)
    } else {
      wctx.Write("_:", Style.Label)
    }
    this.JamInfo(wctx)
    wctx.Write(" => ", Style.Operator)
    const result = this.Eval()
    wctx.Write(result.View(), Style.Unquoted)
  }
}

// List idea - contains sequence of ideas
class List extends Value {
  kind = Kind.List
  returnKind = Kind.List
  baseColor = Color.Sky
  items = []
  labelMap = new Map()
  breakpoint = -1
  implicit

  constructor(isLine = false) {
    super()
    this.implicit = isLine
  }

  append(idea) {
    this.items.push(idea)

    if (idea instanceof Label && idea.name !== null) {
      if (this.labelMap.has(idea.name)) {
        let newName = idea.name + "'"
        while (this.labelMap.has(newName)) {
          newName += "'"
        }
        idea.name = newName
      }
      this.labelMap.set(idea.name, idea)
    }
  }

  View() {
    return "(" + this.items.map((item) => item.View()).join(" ") + ")"
  }

  LineView() {
    return this.items.map((item) => item.View()).join(" ")
  }

  Eval() {
    const result = new List()
    for (const item of this.items) {
      result.append(item.Eval())
    }
    return result
  }

  Write(wctx) {
    const showParens =
      !wctx.lineStart ||
      (this.breakpoint !== 0 &&
        this.items.length > 0 &&
        this.items[0] instanceof Label)

    if (showParens) {
      wctx.Write("(", Style.List, this)
    } else if (this.breakpoint === -1) {
      wctx.lineStart = false
    }

    if (this.breakpoint === 0) {
      // Vertical layout
      for (let i = 0; i < this.items.length; i++) {
        if (!wctx.inSourceBounds()) break
        this.items[i].Write(wctx)
        wctx.newLine()
      }
    } else {
      // Horizontal layout
      for (let i = 0; i < this.items.length; i++) {
        this.items[i].Write(wctx)
        if (i < this.items.length - 1) {
          wctx.Write(" ", Style.List, this)
        }
      }
    }

    if (showParens) {
      wctx.Write(")", Style.List, this)
    }
  }

  Status(wctx) {
    wctx.Write("List ", Style.Unquoted)
    wctx.Write("#" + this.items.length + " ", Style.Number)
    const result = this.Eval()
    wctx.Write(" => ", Style.Operator)
    wctx.Write(result.View(), Style.Unquoted)
  }
}

// Nothing idea - empty expression
class Nothing extends Value {
  kind = Kind.Nothing
  returnKind = Kind.Nothing
  baseColor = Color.Middle

  constructor() {
    super()
  }

  View() {
    return "()"
  }

  Write(wctx) {
    wctx.Write(this.View(), Style.Nothing, this)
  }
}

// Closure idea - closing parenthesis marker
class Closure extends Idea {
  kind = Kind.Nothing
  returnKind = Kind.Nothing

  constructor() {
    super()
  }

  View() {
    throw new Error("Closure should never appear in AST")
  }

  Write(wctx) {
    throw new Error("Closure should never appear in AST")
  }
}

// Blank idea - represents missing/undefined values
class Blank extends Idea {
  kind = Kind.Blank
  returnKind = Kind.Blank

  constructor() {
    super()
  }

  View() {
    return "_"
  }

  Write(wctx) {
    wctx.Write("_", Style.Blank, this)
  }
}

// Add idea - addition operator
class Add extends Op {
  kind = Kind.Add
  returnKind = Kind.Operator
  left = null
  right = null
  lBind = Bind.Additive
  rBind = Bind.Additive

  constructor() {
    super()
  }

  consumePre(prev) {
    if (prev.returnKind === Kind.Num) {
      this.left = prev
      return this
    }
    return null
  }

  consumePost(next) {
    if (next.returnKind === Kind.Num) {
      this.right = next
      if (this.left !== null) {
        this.complete = true
        this.returnKind = Kind.Num
      }
      return true
    }
    return false
  }

  View() {
    const leftArg = this.left === null ? "_" : this.left.View()
    const rightArg = this.right === null ? "_" : this.right.View()
    return leftArg + "+" + rightArg
  }

  Eval() {
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

  Write(wctx) {
    if (this.left !== null) {
      const needsParens =
        (this.left.rBind > Bind.NonBinding && this.left.rBind < this.lBind) ||
        this.left instanceof Label
      if (needsParens) wctx.Write("(", Style.Number, this)
      this.left.Write(wctx)
      if (needsParens) wctx.Write(")", Style.Number, this)
    } else {
      wctx.Write("_", Style.Blank, this)
    }
    wctx.Write("+", Style.Operator, this)
    if (this.right !== null) {
      const needsParens =
        (this.right.lBind > Bind.NonBinding && this.right.lBind < this.rBind) ||
        this.right instanceof Label
      if (needsParens) wctx.Write("(", Style.Number, this)
      this.right.Write(wctx)
      if (needsParens) wctx.Write(")", Style.Number, this)
    } else {
      wctx.Write("_", Style.Blank, this)
    }
  }
}

// Mul idea - multiplication operator
class Mul extends Op {
  kind = Kind.Mul
  returnKind = Kind.Operator
  left = null
  right = null
  lBind = Bind.Multiplicative
  rBind = Bind.Multiplicative

  constructor() {
    super()
  }

  consumePre(prev) {
    if (prev.returnKind === Kind.Num) {
      this.left = prev
      return this
    }
    return null
  }

  consumePost(next) {
    if (next.returnKind === Kind.Num) {
      this.right = next
      if (this.left !== null) {
        this.complete = true
        this.returnKind = Kind.Num
      }
      return true
    }
    return false
  }

  View() {
    const leftArg = this.left === null ? "_" : this.left.View()
    const rightArg = this.right === null ? "_" : this.right.View()
    return leftArg + "*" + rightArg
  }

  Eval() {
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

  Write(wctx) {
    if (this.left !== null) {
      const needsParens =
        (this.left.rBind > Bind.NonBinding && this.left.rBind < this.lBind) ||
        this.left instanceof Label
      if (needsParens) wctx.Write("(", Style.Number, this)
      this.left.Write(wctx)
      if (needsParens) wctx.Write(")", Style.Number, this)
    } else {
      wctx.Write("_", Style.Blank, this)
    }
    wctx.Write("*", Style.Operator, this)
    if (this.right !== null) {
      const needsParens =
        (this.right.lBind > Bind.NonBinding && this.right.lBind < this.rBind) ||
        this.right instanceof Label
      if (needsParens) wctx.Write("(", Style.Number, this)
      this.right.Write(wctx)
      if (needsParens) wctx.Write(")", Style.Number, this)
    } else {
      wctx.Write("_", Style.Blank, this)
    }
  }
}

// === Console & Rendering ===

// WriteContext - provides drawing operations for ideas
class WriteContext {
  col = 1
  row = 1
  lineStart = true
  ideaUnderCursor = null
  console
  targetCol
  targetRow

  constructor(console, targetCol = 0, targetRow = 0) {
    this.console = console
    this.targetCol = targetCol
    this.targetRow = targetRow
  }

  // Write text at current position using a style function
  Write(text, style, idea = null) {
    // Calculate pixel coordinates
    const x = (this.col - 1) * charWidth
    const y = (this.row - 1) * charHeight + charHeight / 2

    // Call style function and get rendered length
    const renderedLength = style(this.console.ctx, text, x, y)

    // Cursor detection
    if (idea !== null && this.targetRow === this.row) {
      const startCol = this.col
      const endCol = this.col + renderedLength - 1
      if (this.targetCol >= startCol && this.targetCol <= endCol) {
        this.ideaUnderCursor = idea
      }
    }

    this.col += renderedLength
    this.lineStart = false
  }

  newLine() {
    this.row++
    this.col = 1
    this.lineStart = true
  }

  remainingCols() {
    return this.console.getCols() - this.col + 1
  }

  inSourceBounds() {
    return (
      this.row >= this.console.sourceStart && this.row <= this.console.sourceEnd
    )
  }
}

class Console {
  width = 100
  height = 30
  sourceColor = Color.Dark
  statusBg = Color.Black
  cursorColor = Color.Middle
  parser = new Parser()
  source = new List()
  prompt = "^..^ "
  currentLine = ""
  cursorPosition = 0
  history = []
  historyIndex = -1
  targetCol = -1
  targetRow = -1
  sourceStart
  sourceEnd
  statusLine
  cmdLine
  canvas
  ctx

  constructor(canvasId) {
    StyleInit()

    this.sourceStart = 1
    this.sourceEnd = this.height - 2
    this.statusLine = this.height - 1
    this.cmdLine = this.height

    // Canvas
    const canvas = document.getElementById(canvasId)
    this.canvas = canvas

    const ctx = this.canvas.getContext("2d", { alpha: false })
    if (!ctx) {
      throw new Error("Failed to get 2D context")
    }
    this.ctx = ctx
    this.source.breakpoint = 0

    this.initialize()
    this.setupKeyboardListeners()
    this.setupMouseListeners()
    this.redrawCommandLine()
  }

  initialize() {
    this.canvas.width = this.width * charWidth
    this.canvas.height = this.height * charHeight

    this.ctx.font = Font.Normal
    this.ctx.textBaseline = "middle"
    this.ctx.textAlign = "left"

    this.clear()
  }

  clear() {
    this.ctx.fillStyle = this.sourceColor
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  clearSource() {
    this.ctx.fillStyle = this.sourceColor
    const y = 0
    const height = this.sourceEnd * charHeight
    this.ctx.fillRect(0, y, this.canvas.width, height)
  }

  clearStatus() {
    this.ctx.fillStyle = this.statusBg
    const y = (this.statusLine - 1) * charHeight
    const height = charHeight
    this.ctx.fillRect(0, y, this.canvas.width, height)
  }

  clearCommand() {
    this.ctx.fillStyle = this.sourceColor
    const y = (this.cmdLine - 1) * charHeight
    const height = charHeight
    this.ctx.fillRect(0, y, this.canvas.width, height)
  }

  drawText(text, col, row, color) {
    if (row < 1 || row > this.height || col < 1 || col > this.width) {
      return
    }

    const x = (col - 1) * charWidth
    const y = (row - 1) * charHeight + charHeight / 2

    this.ctx.fillStyle = color
    this.ctx.fillText(text, x, y)
  }

  drawStatus(text) {
    this.clearStatus()
    this.drawText(text, 1, this.statusLine, this.cursorColor)
  }

  drawSource() {
    this.clearSource()
    const wctx = new WriteContext(this, this.targetCol, this.targetRow)
    this.source.Write(wctx)

    if (wctx.ideaUnderCursor !== null) {
      this.clearStatus()
      const statusWctx = new WriteContext(this)
      statusWctx.row = this.statusLine
      statusWctx.col = 2
      wctx.ideaUnderCursor.Status(statusWctx)
    }
  }

  drawCommandLine(text, tokens, cursorPos) {
    this.clearCommand()

    let startPos = 1
    for (const token of tokens) {
      const endPos = token.endIndex + 1
      const tokenText = text.slice(startPos - 1, endPos - 1)
      const color = token.idea.Color()
      this.drawText(tokenText, startPos, this.cmdLine, color)
      startPos = endPos
    }

    if (startPos <= text.length) {
      this.drawText(text.slice(startPos - 1), startPos, this.cmdLine, "#6c7086")
    }

    this.drawCursor(cursorPos, this.cmdLine)
  }

  drawCursor(col, row) {
    if (row < 1 || row > this.height || col < 1 || col > this.width) {
      return
    }

    const x = (col - 1) * charWidth
    const y = row * charHeight - 2

    this.ctx.fillStyle = this.cursorColor
    this.ctx.fillRect(x, y, charWidth, 2)
  }

  getCharWidth() {
    return charWidth
  }

  getCharHeight() {
    return charHeight
  }

  getCols() {
    return this.width
  }

  getRows() {
    return this.height
  }

  setupKeyboardListeners() {
    document.addEventListener("keydown", (e) => {
      this.handleKeyDown(e)
    })
  }

  setupMouseListeners() {
    this.canvas.addEventListener("mousemove", (e) => {
      this.handleMouseMove(e)
    })
  }

  handleMouseMove(e) {
    const col = Math.floor(e.offsetX / charWidth) + 1
    const row = Math.floor(e.offsetY / charHeight) + 1

    this.targetCol = col
    this.targetRow = row

    this.drawSource()
  }

  handleKeyDown(e) {
    const handledKeys = [
      "Enter",
      "Backspace",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "Delete",
      " ",
      "'",
    ]
    if (handledKeys.includes(e.key)) {
      e.preventDefault()
    }

    switch (e.key) {
      case "Enter":
        this.handleSubmit()
        break
      case "Backspace":
        this.handleBackspace()
        break
      case "Delete":
        this.handleDelete()
        break
      case "ArrowLeft":
        this.handleArrowLeft()
        break
      case "ArrowRight":
        this.handleArrowRight()
        break
      case "ArrowUp":
        this.handleArrowUp()
        break
      case "ArrowDown":
        this.handleArrowDown()
        break
      case "Home":
        this.handleHome()
        break
      case "End":
        this.handleEnd()
        break
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          this.handleCharacterInput(e.key)
        }
        break
    }
  }

  handleCharacterInput(char) {
    this.currentLine =
      this.currentLine.slice(0, this.cursorPosition) +
      char +
      this.currentLine.slice(this.cursorPosition)
    this.cursorPosition++
    this.redrawCommandLine()
  }

  handleBackspace() {
    if (this.cursorPosition > 0) {
      this.currentLine =
        this.currentLine.slice(0, this.cursorPosition - 1) +
        this.currentLine.slice(this.cursorPosition)
      this.cursorPosition--
      this.redrawCommandLine()
    }
  }

  handleDelete() {
    if (this.cursorPosition < this.currentLine.length) {
      this.currentLine =
        this.currentLine.slice(0, this.cursorPosition) +
        this.currentLine.slice(this.cursorPosition + 1)
      this.redrawCommandLine()
    }
  }

  handleArrowLeft() {
    if (this.cursorPosition > 0) {
      this.cursorPosition--
      this.redrawCommandLine()
    }
  }

  handleArrowRight() {
    if (this.cursorPosition < this.currentLine.length) {
      this.cursorPosition++
      this.redrawCommandLine()
    }
  }

  handleArrowUp() {
    if (this.history.length === 0) return

    if (this.historyIndex === -1) {
      this.historyIndex = this.history.length - 1
    } else if (this.historyIndex > 0) {
      this.historyIndex--
    }

    this.currentLine = this.history[this.historyIndex]
    this.cursorPosition = this.currentLine.length
    this.redrawCommandLine()
  }

  handleArrowDown() {
    if (this.historyIndex === -1) return

    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++
      this.currentLine = this.history[this.historyIndex]
    } else {
      this.historyIndex = -1
      this.currentLine = ""
    }

    this.cursorPosition = this.currentLine.length
    this.redrawCommandLine()
  }

  handleHome() {
    this.cursorPosition = 0
    this.redrawCommandLine()
  }

  handleEnd() {
    this.cursorPosition = this.currentLine.length
    this.redrawCommandLine()
  }

  handleSubmit() {
    const line = this.currentLine

    if (line.trim().length > 0) {
      this.history.push(line)
      this.historyIndex = -1
    }

    if (line.trim()) {
      try {
        const result = this.parser.start(line)
        this.source.append(result)
        this.drawSource()
        const output = LineView(result)
        this.drawStatus(output)
      } catch (error) {
        this.drawStatus("Error: " + error.message)
      }
    }

    this.currentLine = ""
    this.cursorPosition = 0
    this.redrawCommandLine()
  }

  redrawCommandLine() {
    this.parser.start(this.currentLine)
    const tokens = this.parser.tokens

    const fullText = this.prompt + this.currentLine
    const cursorCol = this.prompt.length + this.cursorPosition + 1

    const adjustedTokens = tokens.map((t) => ({
      endIndex: t.endIndex + this.prompt.length,
      idea: t.idea,
    }))

    this.drawCommandLine(fullText, adjustedTokens, cursorCol)
  }
}

// === Main Entry Point ===

async function initDagger() {
  try {
    await document.fonts.load('14px "JetBrains Mono"')
    console.log("JetBrains Mono font loaded")
  } catch (error) {
    console.error("Failed to load font:", error)
  }

  const con = new Console("console-canvas")
  con.drawStatus("Dagger v0.0.0 - Ready")
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDagger)
} else {
  initDagger()
}
