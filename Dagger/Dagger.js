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
  Yellow: "#f6d21e",
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
let wchar = 0
let hchar = 0

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
  wchar = metrics.width
  // Line height is 1.5x measured font height
  const measuredHeight =
    metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
  hchar = Math.floor(measuredHeight * 1.25)

  fresh = true
}

// Style functions - draw text with specific styling
// Each function: (w, idea, input) => renderedLength
const Style = {
  Num: (w, num, input) => {
    w.cc.fillStyle = Color.Mint
    if (!input) input = num.value.toString()
    w.cc.fillText(input, w.cx, w.cy)
    return input.length
  },

  Str: (w, str, input) => {
    w.cc.fillStyle = Color.Aqua
    w.cc.font = Font.Italic
    if (!input) input = '"' + str.value + '"'
    w.cc.fillText(input, w.cx, w.cy)
    w.cc.font = w.base
    return input.length
  },

  Unquoted: (w, uq, input) => {
    w.cc.fillStyle = Color.Orange
    if (!input) input = uq.value
    w.cc.fillText(input, w.cx, w.cy)
    return input.length
  },

  Tag: (w, idea) => {
    const text = idea.constructor.name
    w.cc.fillStyle = Color.Yellow
    w.cc.fillText(text + " ", w.cx, w.cy)
    return text.length + 1
  },

  Label: (w, label, input) => {
    if (input) {
      w.cc.fillStyle = Color.Blue
      w.cc.font = Font.Italic
      w.cc.fillText(input, w.cx, w.cy)
      w.cc.font = w.base
      return input.length
    } else {
      w.cc.fillStyle = Color.Blue
      w.cc.font = Font.Italic
      w.cc.fillText(label.name, w.cx, w.cy)
      w.cc.font = w.base
      w.cc.fillStyle = Color.Sky
      w.cc.fillText(": ", w.cx + label.name.length * wchar, w.cy)
      return label.name.length + 2
    }
  },

  List: (w, _, input) => {
    w.cc.fillStyle = Color.Sky
    if (!input) input = "("
    w.cc.fillText(input, w.cx, w.cy)
    return input.length
  },

  Push: (w, _, input) => {
    if (!input) input = " "
    w.cc.fillText(input, w.cx, w.cy)
    return input.length
  },

  Close: (w, _, input) => {
    w.cc.fillStyle = Color.Sky
    if (!input) input = ")"
    w.cc.fillText(input, w.cx, w.cy)
    return input.length
  },

  Nothing: (w, _, input) => {
    w.cc.fillStyle = Color.Middle
    if (!input) input = "()"
    w.cc.fillText(input, w.cx, w.cy)
    return input.length
  },

  Add: (w, _, input) => {
    w.cc.fillStyle = Color.Violet
    if (!input) input = "+"
    w.cc.fillText(input, w.cx, w.cy)
    return input.length
  },

  Mul: (w, _, input) => {
    w.cc.fillStyle = Color.Violet
    if (!input) input = "*"
    w.cc.fillText(input, w.cx, w.cy)
    return input.length
  },

  Eval: (w, _, input) => {
    w.cc.fillStyle = Color.Green
    if (!input) input = "=> "
    w.cc.fillText(input, w.cx, w.cy)
    return input.length
  },

  Blank: (w, _, input) => {
    w.cc.fillStyle = Color.Middle
    if (!input) input = "_"
    w.cc.fillText(input, w.cx, w.cy)
    return input.length
  },

  Spaces: (w, spaces, input) => {
    // Don't call fillText - spaces are rendered as part of adjacent tokens
    // Just return length to advance cursor position
    return input.length
  },

  Jam: (w, _, text) => {
    w.cc.fillStyle = Color.Red
    w.cc.fillText(text, w.cx, w.cy)
    return text.length
  },

  Raw: (w, _, text) => {
    w.cc.fillStyle = Color.White
    w.cc.font = Font.Italic
    w.cc.fillText(text, w.cx, w.cy)
    w.cc.font = w.base
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
  Push: 1,
  LabelRight: 2,
  Additive: 3,
  Multiplicative: 4,
  LabelLeft: 5,
}

// Combined regex pattern for token matching
const TOKEN_PATTERN =
  /(?:"(?<quoted>[^"]*)"|(?<list>\()|(?<close>\))|(?<number>-?\d+\.?\d*)|(?<seal>[^\w\s"()]+)|(?<unquoted>[^:\s]+)|(?<push>\s+))/g

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
  tokenMap = []

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
    return unquotedIdea
  }

  // Entry point for parsing
  start(input) {
    this.input = input
    this.regex.lastIndex = 0
    this.tokenMap = []
    this.fresh = true

    const result = this.next(null, Bind.Push)
    return result ?? new Nothing()
  }

  // Get next idea from current position
  next(prev, suitor) {
    const savedPos = this.regex.lastIndex
    const savedTokenCount = this.tokenMap.length
    const rewind = () => {
      this.regex.lastIndex = savedPos
      this.tokenMap.length = savedTokenCount
    }

    let idea = null

    if (this.fresh) {
      idea = new List(true)
      this.fresh = false
    } else {
      let match = this.regex.exec(this.input)

      while (match && match.groups?.push !== undefined) {
        this.tokenMap.push([this.regex.lastIndex, new Spaces()])
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
      } else if (match.groups.close !== undefined) {
        idea = new Close()
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

      if (!(idea instanceof Close)) {
        this.tokenMap.push([this.regex.lastIndex, idea])
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
          this.tokenMap.splice(this.tokenMap.length - 2, 1)
        }
      } else {
        rewind()
        return null
      }
    }

    if (idea instanceof Close) {
      return idea
    }

    // Fill recursion
    if ("consumePost" in idea) {
      const postPos = this.regex.lastIndex
      const postTokenCount = this.tokenMap.length
      const rewindPost = () => {
        this.regex.lastIndex = postPos
        this.tokenMap.length = postTokenCount
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
      while (true) {
        let item = this.next(null, Bind.Push)
        if (item === null) break
        if (item instanceof Close) {
          if (idea.implicit) {
            const nll = new List()
            nll.implicit = true
            idea.implicit = false
            nll.push(idea)
            this.tokenMap.push([this.regex.lastIndex, idea])
            idea = nll
            continue
          } else {
            this.tokenMap.push([this.regex.lastIndex, idea])
            break
          }
        }
        idea.push(item)
      }

      // Apply single element rule
      if (idea.items.length === 0) {
        idea = new Nothing()
      } else if (idea.items.length === 1) {
        idea = idea.items[0]
      } else {
        idea = idea
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

  Status(wctx) {
    this.JamInfo(wctx)
    const result = this.Eval()
    wctx.Write(Style.Eval)
    wctx.SetBase(Font.Italic)
    wctx.lineStart = true
    result.Write(wctx)
    wctx.SetBase(Font.Normal)
  }

  JamInfo(wctx) {
    if (this.jam !== null) {
      wctx.Write(Style.Jam, null, ' !"' + this.jam + '"')
    }
  }

  Eval() {
    return new Blank()
  }
}

// Op - base class for operators
class Op extends Idea {
  complete = false

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
  baseStyle = Style.Num
  value

  constructor(match) {
    super()
    this.value = parseFloat(match)
  }

  Str() {
    return this.value.toString()
  }

  Write(wctx) {
    wctx.Write(Style.Num, this)
  }
}

// Str idea - stores string values
class Str extends Value {
  kind = Kind.Str
  returnKind = Kind.Str
  baseStyle = Style.Str
  value

  constructor(match) {
    super()
    this.value = match
  }

  Str() {
    return '"' + this.value + '"'
  }

  Write(wctx) {
    wctx.Write(Style.Str, this)
  }
}

// Unquoted idea - stores unquoted string values
class Unquoted extends Value {
  kind = Kind.Unquoted
  returnKind = Kind.Unquoted
  baseStyle = Style.Unquoted
  value

  constructor(match) {
    super()
    this.value = match
  }

  Str() {
    return this.value
  }

  Write(wctx) {
    wctx.Write(Style.Unquoted, this)
  }
}

// Label idea - marks a value with a name (infix colon operator)
class Label extends Op {
  kind = Kind.Label
  returnKind = Kind.Label
  baseStyle = Style.Label
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

  Str() {
    const nameStr = this.name ?? "_"
    const labeledStr = this.labeled ? this.labeled.Str() : "_"
    return nameStr + ":" + labeledStr
  }

  Write(wctx) {
    if (this.name !== null) {
      wctx.Write(Style.Label, this)
    } else {
      wctx.Write(Style.Blank, this)
    }
    if (this.labeled !== null) {
      this.labeled.Write(wctx)
    } else {
      wctx.Write(Style.Blank, this)
    }
  }

  Eval() {
    if (this.labeled === null) {
      return new Blank()
    }
    return this.labeled.Eval()
  }

  Status(wctx) {
    if (this.name !== null) {
      wctx.Write(Style.Label, this)
    } else {
      wctx.Write(Style.Raw, null, "_:")
    }
    this.JamInfo(wctx)
    wctx.Write(Style.Eval)
    const result = this.Eval()
    wctx.SetBase(Font.Italic)
    wctx.lineStart = true
    result.Write(wctx)
    wctx.SetBase(Font.Normal)
  }
}

// List idea - contains sequence of ideas
class List extends Value {
  kind = Kind.List
  returnKind = Kind.List
  baseStyle = Style.List
  items = []
  labelMap = new Map()
  breakpoint = -1
  implicit

  constructor(isLine = false) {
    super()
    this.implicit = isLine
  }

  push(idea) {
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

  Str() {
    return "(" + this.items.map((item) => item.Str()).join(" ") + ")"
  }

  Eval() {
    const result = new List()
    for (const item of this.items) {
      result.push(item.Eval())
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
      wctx.Write(Style.List, this)
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
          wctx.Write(Style.Push, this)
        }
      }
    }

    if (showParens) {
      wctx.Write(Style.Close, this)
    }
  }

  Status(wctx) {
    wctx.Write(Style.Raw, null, "of " + this.items.length + " ")
    const result = this.Eval()
    wctx.Write(Style.Eval)
    wctx.SetBase(Font.Italic)
    wctx.lineStart = true
    result.Write(wctx)
    wctx.SetBase(Font.Normal)
  }
}

// Close idea - closing parenthesis marker
class Close extends Idea {
  kind = Kind.Nothing
  returnKind = Kind.Nothing

  Str() {
    throw new Error("Close should never appear in AST")
  }

  Write(wctx) {
    throw new Error("Close should never appear in AST")
  }
}

// Nothing idea - empty expression
class Nothing extends Value {
  kind = Kind.Nothing
  returnKind = Kind.Nothing
  baseStyle = Style.Nothing

  constructor() {
    super()
  }

  Str() {
    return "()"
  }

  Write(wctx) {
    wctx.Write(Style.Nothing, this)
  }
}

// Blank idea - represents missing/undefined values
class Blank extends Idea {
  kind = Kind.Blank
  returnKind = Kind.Blank
  baseStyle = Style.Blank

  Str() {
    return "_"
  }

  Write(wctx) {
    wctx.Write(Style.Blank, this)
  }
}

// Spaces idea - represents whitespace belonging to an Op or List
class Spaces extends Idea {
  baseStyle = Style.Spaces
  owner = null

  Str() {
    return ""
  }

  Write(wctx, input) {
    wctx.Write(Style.Spaces, this, input)
  }
}

// Add idea - addition operator
class Add extends Op {
  kind = Kind.Add
  returnKind = Kind.Operator
  baseStyle = Style.Add
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

  Str() {
    const leftArg = this.left === null ? "_" : this.left.Str()
    const rightArg = this.right === null ? "_" : this.right.Str()
    return leftArg + "+" + rightArg
  }

  Eval() {
    if (this.left === null || this.right === null) {
      return this
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
      if (needsParens) wctx.Write(Style.List, this.left)
      this.left.Write(wctx)
      if (needsParens) wctx.Write(Style.Close, this.left)
    } else {
      wctx.Write(Style.Blank, this)
    }
    wctx.Write(Style.Add, this)
    if (this.right !== null) {
      const needsParens =
        (this.right.lBind > Bind.NonBinding && this.right.lBind < this.rBind) ||
        this.right instanceof Label
      if (needsParens) wctx.Write(Style.List, this.right)
      this.right.Write(wctx)
      if (needsParens) wctx.Write(Style.Close, this.right)
    } else {
      wctx.Write(Style.Blank, this)
    }
  }
}

// Mul idea - multiplication operator
class Mul extends Op {
  kind = Kind.Mul
  returnKind = Kind.Operator
  baseStyle = Style.Mul
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

  Str() {
    const leftArg = this.left === null ? "_" : this.left.Str()
    const rightArg = this.right === null ? "_" : this.right.Str()
    return leftArg + "*" + rightArg
  }

  Eval() {
    if (this.left === null || this.right === null) {
      return this
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
      if (needsParens) wctx.Write(Style.List, this.left)
      this.left.Write(wctx)
      if (needsParens) wctx.Write(Style.Close, this.left)
    } else {
      wctx.Write(Style.Blank, this)
    }
    wctx.Write(Style.Mul, this)
    if (this.right !== null) {
      const needsParens =
        (this.right.lBind > Bind.NonBinding && this.right.lBind < this.rBind) ||
        this.right instanceof Label
      if (needsParens) wctx.Write(Style.List, this.right)
      this.right.Write(wctx)
      if (needsParens) wctx.Write(Style.Close, this.right)
    } else {
      wctx.Write(Style.Blank, this)
    }
  }
}

// === Console & Rendering ===

// WriteContext - provides drawing operations for ideas
class WriteContext {
  x = 1
  y = 1
  lineStart = true
  ideaUnderCursor = null
  console
  tx
  ty
  cc = null
  cx = 0
  cy = 0
  base = Font.Normal

  constructor(console, targetCol = 0, targetRow = 0) {
    this.console = console
    this.tx = targetCol
    this.ty = targetRow
    this.cc = this.console.ctx
  }

  SetBase(font) {
    this.base = font
    this.cc.font = font
  }

  // Write text at current position using a style function
  Write(style, idea = null, input = null) {
    // Calculate pixel coordinates
    this.cx = (this.x - 1) * wchar
    this.cy = (this.y - 1) * hchar + hchar / 2

    // Call style function and get rendered length
    const wlen = style(this, idea, input)

    // Cursor detection
    if (idea !== null && typeof idea !== "string" && this.ty === this.y) {
      if (this.tx >= this.x && this.tx <= this.x + wlen - 1) {
        this.ideaUnderCursor = idea
      }
    }

    this.x += wlen
    this.lineStart = false
  }

  newLine() {
    this.y++
    this.x = 1
    this.lineStart = true
  }

  remainingCols() {
    return this.console.getCols() - this.x + 1
  }

  inSourceBounds() {
    return (
      this.y >= this.console.sourceStart && this.y <= this.console.sourceEnd
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
  shLine = ""
  cursorPosition = 0
  history = []
  historyIndex = -1
  targetCol = -1
  targetRow = -1
  sourceStart
  sourceEnd
  statusLine
  shell
  canvas
  ctx

  constructor(canvasId) {
    StyleInit()

    this.sourceStart = 1
    this.sourceEnd = this.height - 2
    this.statusLine = this.height - 1
    this.shell = this.height

    // Canvas
    const canvas = document.getElementById(canvasId)
    this.canvas = canvas

    const ctx = this.canvas.getContext("2d", { alpha: false })
    this.ctx = ctx
    this.source.breakpoint = 0

    this.initialize()
    this.setupKeyboardListeners()
    this.setupMouseListeners()
    this.drawStatus(WelcomeMessage)
    this.drawShell()
  }

  initialize() {
    this.canvas.width = this.width * wchar
    this.canvas.height = this.height * hchar

    this.ctx.font = Font.Normal
    this.ctx.textBaseline = "middle"
    this.ctx.textAlign = "left"

    this.ctx.fillStyle = this.sourceColor
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawText(text, col, row, color) {
    if (row < 1 || row > this.height || col < 1 || col > this.width) {
      return
    }

    const x = (col - 1) * wchar
    const y = (row - 1) * hchar + hchar / 2

    this.ctx.fillStyle = color
    this.ctx.fillText(text, x, y)
  }

  drawStatus(idea) {
    this.ctx.fillStyle = this.statusBg
    this.ctx.fillRect(
      0,
      (this.statusLine - 1) * hchar,
      this.canvas.width,
      hchar,
    )
    const statusWctx = new WriteContext(this)
    statusWctx.y = this.statusLine
    statusWctx.x = 2
    statusWctx.Write(Style.Tag, idea)
    idea.Status(statusWctx)
  }

  drawSource() {
    this.ctx.fillStyle = this.sourceColor
    this.ctx.fillRect(0, 0, this.canvas.width, this.sourceEnd * hchar)
    const wctx = new WriteContext(this, this.targetCol, this.targetRow)
    this.source.Write(wctx)

    if (wctx.ideaUnderCursor !== null) {
      this.drawStatus(wctx.ideaUnderCursor)
    } else if (
      this.targetRow >= this.sourceStart &&
      this.targetRow <= this.sourceEnd
    ) {
      const index = this.targetRow - 1
      if (index < this.source.items.length) {
        this.drawStatus(this.source.items[index])
      } else {
        this.drawStatus(this.source)
      }
    }
  }

  drawShell() {
    const result = this.parser.start(this.shLine)
    this.ctx.fillStyle = this.sourceColor
    this.ctx.fillRect(0, (this.shell - 1) * hchar, this.canvas.width, hchar)

    // Create WriteContext with cursor detection
    const wctx = new WriteContext(this, this.targetCol, this.targetRow)
    wctx.y = this.shell
    wctx.x = 1

    // Draw prompt
    wctx.Write(Style.Raw, null, this.prompt)

    // Draw tokens starting after prompt
    let startIdx = 0

    console.log(this.parser.tokenMap)

    for (const [endIdx, idea] of this.parser.tokenMap) {
      const tokenText = this.shLine.slice(startIdx, endIdx)
      wctx.Write(idea.baseStyle, idea, tokenText)
      startIdx = endIdx
    }

    // Draw remaining unparsed text
    if (startIdx < this.shLine.length) {
      wctx.Write(Style.Raw, null, this.shLine.slice(startIdx))
    }

    // Draw cursor
    const cursorPos = this.prompt.length + this.cursorPosition + 1
    this.drawCursor(cursorPos, this.shell)

    // Show status
    if (wctx.ideaUnderCursor !== null) {
      this.drawStatus(wctx.ideaUnderCursor)
    } else if (
      this.targetRow === this.shell &&
      this.targetCol > this.prompt.length + this.shLine.length
    ) {
      this.drawStatus(result)
    }
  }

  drawCursor(col, row) {
    if (row < 1 || row > this.height || col < 1 || col > this.width) {
      return
    }

    const x = (col - 1) * wchar
    const y = row * hchar - 2

    this.ctx.fillStyle = this.cursorColor
    this.ctx.fillRect(x, y, wchar, 2)
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
    const col = Math.floor(e.offsetX / wchar) + 1
    const row = Math.floor(e.offsetY / hchar) + 1

    this.targetCol = col
    this.targetRow = row

    if (row >= this.sourceStart && row <= this.sourceEnd) {
      this.drawSource()
    } else if (row === this.shell) {
      this.drawShell()
    }
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
    this.shLine =
      this.shLine.slice(0, this.cursorPosition) +
      char +
      this.shLine.slice(this.cursorPosition)
    this.cursorPosition++
    this.drawShell()
  }

  handleBackspace() {
    if (this.cursorPosition > 0) {
      this.shLine =
        this.shLine.slice(0, this.cursorPosition - 1) +
        this.shLine.slice(this.cursorPosition)
      this.cursorPosition--
      this.drawShell()
    }
  }

  handleDelete() {
    if (this.cursorPosition < this.shLine.length) {
      this.shLine =
        this.shLine.slice(0, this.cursorPosition) +
        this.shLine.slice(this.cursorPosition + 1)
      this.drawShell()
    }
  }

  handleArrowLeft() {
    if (this.cursorPosition > 0) {
      this.cursorPosition--
      this.drawShell()
    }
  }

  handleArrowRight() {
    if (this.cursorPosition < this.shLine.length) {
      this.cursorPosition++
      this.drawShell()
    }
  }

  handleArrowUp() {
    if (this.history.length === 0) return

    if (this.historyIndex === -1) {
      this.historyIndex = this.history.length - 1
    } else if (this.historyIndex > 0) {
      this.historyIndex--
    }

    this.shLine = this.history[this.historyIndex]
    this.cursorPosition = this.shLine.length
    this.drawShell()
  }

  handleArrowDown() {
    if (this.historyIndex === -1) return

    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++
      this.shLine = this.history[this.historyIndex]
    } else {
      this.historyIndex = -1
      this.shLine = ""
    }

    this.cursorPosition = this.shLine.length
    this.drawShell()
  }

  handleHome() {
    this.cursorPosition = 0
    this.drawShell()
  }

  handleEnd() {
    this.cursorPosition = this.shLine.length
    this.drawShell()
  }

  handleSubmit() {
    const line = this.shLine

    if (line.trim()) {
      this.history.push(line)
      this.historyIndex = -1
      try {
        const result = this.parser.start(line)
        this.source.push(result)
        this.drawSource()
        this.drawStatus(result)
      } catch (error) {
        console.log("Error:", error.message)
      }
    }

    this.shLine = ""
    this.cursorPosition = 0
    this.drawShell()
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
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDagger)
} else {
  initDagger()
}

// Constants
const WelcomeMessage = new Str("Dagger v0.0.0 - An ICE for Barry")
