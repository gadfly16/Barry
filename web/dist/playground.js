// web/src/barry.ts
var Kind = /* @__PURE__ */ ((Kind2) => {
  Kind2["Num"] = "Num";
  Kind2["Str"] = "Str";
  Kind2["Unquoted"] = "Unquoted";
  Kind2["Label"] = "Label";
  Kind2["List"] = "List";
  Kind2["Nothing"] = "Bit";
  Kind2["Operator"] = "Operator";
  Kind2["Add"] = "Add";
  Kind2["Mul"] = "Mul";
  Kind2["Blank"] = "Blank";
  return Kind2;
})(Kind || {});
var Color = /* @__PURE__ */ ((Color2) => {
  Color2["White"] = "#f7f8fa";
  Color2["Black"] = "#101113";
  Color2["Light"] = "#b2b3b5";
  Color2["Middle"] = "#8e8f91";
  Color2["Dark"] = "#202123";
  Color2["Aqua"] = "#61cbd5";
  Color2["Blue"] = "#2d5ccb";
  Color2["Brown"] = "#6f5700";
  Color2["Violet"] = "#ce51e4";
  Color2["Yellow"] = "#d6e26e";
  Color2["Pink"] = "#ce857a";
  Color2["Mint"] = "#aff188";
  Color2["Red"] = "#f01f1c";
  Color2["Green"] = "#74bb46";
  Color2["Orange"] = "#c85d18";
  Color2["Sky"] = "#6d90f1";
  return Color2;
})(Color || {});
var Bind = /* @__PURE__ */ ((Bind2) => {
  Bind2[Bind2["NonBinding"] = 0] = "NonBinding";
  Bind2[Bind2["Append"] = 1] = "Append";
  Bind2[Bind2["LabelRight"] = 2] = "LabelRight";
  Bind2[Bind2["Additive"] = 3] = "Additive";
  Bind2[Bind2["Multiplicative"] = 4] = "Multiplicative";
  Bind2[Bind2["LabelLeft"] = 5] = "LabelLeft";
  return Bind2;
})(Bind || {});
var TOKEN_PATTERN = /(?:"(?<quoted>[^"]*)"|(?<list>\()|(?<closure>\))|(?<number>-?\d+\.?\d*)|(?<seal>[^\w\s"()]+)|(?<unquoted>[^:\s]+)|(?<append>\s+))/g;
function LineView(idea) {
  if (idea instanceof List) {
    return idea.LineView();
  }
  return idea.View();
}
function Test() {
  console.log("=== Barry Parser Tests ===");
  const testCases = [
    "1234",
    "  42.5  ",
    "-7",
    "12 34",
    "12 (34 56) 78",
    "12+34",
    "1+2+3"
  ];
  const parser = new Parser();
  for (const input of testCases) {
    console.log(`
Input: "${input}"`);
    try {
      const result = parser.start(input);
      console.log(`  Result: ${LineView(result)}`);
    } catch (e) {
      console.error(`  Error: ${e}`);
    }
  }
  console.log("\n=== Tests Complete ===");
}
var SealMap = /* @__PURE__ */ new Map([
  ["+", () => new Add()],
  ["*", () => new Mul()],
  [":", () => new Label()]
]);
var NameMap = /* @__PURE__ */ new Map([]);
var Parser = class {
  regex;
  input = "";
  tokens = [];
  constructor() {
    this.regex = new RegExp(TOKEN_PATTERN.source, TOKEN_PATTERN.flags);
  }
  // Parse a seal string and return the longest matching seal idea
  // Resets regex index so remaining characters will be matched in next call
  parseSeal(sealString, matchEndPos) {
    for (let len = sealString.length; len > 0; len--) {
      const candidate = sealString.substring(0, len);
      if (SealMap.has(candidate)) {
        const consumedLength2 = len;
        this.regex.lastIndex = matchEndPos - sealString.length + consumedLength2;
        return SealMap.get(candidate)();
      }
    }
    let unknownBuffer = sealString[0];
    let consumedLength = 1;
    for (let i = 1; i < sealString.length; i++) {
      const remaining = sealString.substring(i);
      let foundMatch = false;
      for (let len = remaining.length; len > 0; len--) {
        const candidate = remaining.substring(0, len);
        if (SealMap.has(candidate)) {
          foundMatch = true;
          break;
        }
      }
      if (foundMatch) {
        break;
      }
      unknownBuffer += sealString[i];
      consumedLength++;
    }
    this.regex.lastIndex = matchEndPos - sealString.length + consumedLength;
    const unquotedIdea = new Unquoted(unknownBuffer);
    this.tokens.push({
      endIndex: this.regex.lastIndex,
      idea: unquotedIdea
    });
    return unquotedIdea;
  }
  // Entry point for parsing - handles root list with special processing
  start(input) {
    this.input = input;
    this.regex.lastIndex = 0;
    this.tokens = [];
    const rootList = new List();
    while (true) {
      const idea = this.next(null, 1 /* Append */);
      if (idea === null) {
        break;
      }
      rootList.append(idea);
    }
    if (rootList.items.length === 0) {
      return new Nothing();
    } else if (rootList.items.length === 1) {
      return rootList.items[0];
    }
    return rootList;
  }
  // Get next idea from current position
  // prev is the idea to the left (can be null)
  // suitor is the precedence of the left suitor (0 = no suitor, e.g. in append loops)
  // Returns null if EOF or no valid idea can be created
  // In look-ahead mode (prev !== null), returns null if idea doesn't need prev as left argument
  // Rewinds position if returning null
  next(prev, suitor) {
    const savedPos = this.regex.lastIndex;
    const savedTokenCount = this.tokens.length;
    const rewind = () => {
      this.regex.lastIndex = savedPos;
      this.tokens.length = savedTokenCount;
    };
    let match = this.regex.exec(this.input);
    while (match && match.groups?.append !== void 0) {
      match = this.regex.exec(this.input);
    }
    if (!match || !match.groups) {
      rewind();
      return null;
    }
    let idea = null;
    if (match.groups.number !== void 0) {
      idea = new Num(match.groups.number);
    } else if (match.groups.quoted !== void 0) {
      idea = new Str(match.groups.quoted);
    } else if (match.groups.list !== void 0) {
      idea = new List();
    } else if (match.groups.closure !== void 0) {
      idea = new Closure();
    } else if (match.groups.unquoted !== void 0) {
      if (NameMap.has(match.groups.unquoted)) {
        idea = NameMap.get(match.groups.unquoted)();
      } else {
        idea = new Unquoted(match.groups.unquoted);
      }
    } else if (match.groups.seal !== void 0) {
      idea = this.parseSeal(match.groups.seal, this.regex.lastIndex);
    } else {
      rewind();
      return null;
    }
    if (!(idea instanceof Closure)) {
      this.tokens.push({
        endIndex: this.regex.lastIndex,
        idea
      });
    }
    if (prev !== null) {
      if (idea.lBind < suitor) {
        rewind();
        return null;
      }
      if (idea instanceof Op) {
        const consumed = idea.consumePre(prev);
        if (consumed === null) {
          rewind();
          return null;
        }
        idea = consumed;
        if (idea instanceof Label) {
          this.tokens.splice(this.tokens.length - 2, 1);
        }
      } else {
        rewind();
        return null;
      }
    }
    if (idea instanceof Closure) {
      return idea;
    }
    if ("consumePost" in idea) {
      const postPos = this.regex.lastIndex;
      const rewindPost = () => {
        this.regex.lastIndex = postPos;
      };
      const nextIdea2 = this.next(null, idea.rBind);
      if (nextIdea2 !== null) {
        if (!idea.consumePost(nextIdea2)) {
          rewindPost();
        }
      }
    }
    if (idea instanceof List) {
      while (true) {
        const item = this.next(null, 1 /* Append */);
        if (item === null) {
          break;
        }
        if (item instanceof Closure) {
          this.tokens.push({
            endIndex: this.regex.lastIndex,
            idea
          });
          break;
        }
        idea.append(item);
      }
      if (idea.items.length === 0) {
        idea = new Nothing();
      } else if (idea.items.length === 1) {
        idea = idea.items[0];
      }
    }
    const nextIdea = this.next(idea, suitor);
    if (nextIdea !== null) {
      return nextIdea;
    }
    return idea;
  }
};
var Idea = class {
  lBind = 0 /* NonBinding */;
  rBind = 0 /* NonBinding */;
  jam = null;
  baseColor = "#101113" /* Black */;
  Color() {
    if (this.jam !== null) return "#f01f1c" /* Red */;
    return this.baseColor;
  }
  Info(ctx) {
    ctx.write(this.kind, this.baseColor);
    this.JamInfo(ctx);
    const result = this.Eval();
    ctx.write(" => ", this.baseColor);
    ctx.write(result.View(), result.Color());
  }
  JamInfo(ctx) {
    if (this.jam !== null) {
      ctx.write(' !"' + this.jam + '"', "#f01f1c" /* Red */);
    }
  }
  Eval() {
    return new Blank();
  }
};
var Op = class extends Idea {
  complete = false;
  // Operators track completion
  baseColor = "#ce51e4" /* Violet */;
  consumePre(prev) {
    return null;
  }
};
var Value = class extends Idea {
  // Values are always complete, no tracking needed
  Eval() {
    return this;
  }
};
var Num = class extends Value {
  kind = "Num" /* Num */;
  returnKind = "Num" /* Num */;
  baseColor = "#aff188" /* Mint */;
  value;
  constructor(match) {
    super();
    this.value = typeof match === "string" ? parseFloat(match) : match;
  }
  View() {
    return this.value.toString();
  }
  Draw(ctx) {
    ctx.write(this.View(), this.Color(), this);
  }
};
var Str = class extends Value {
  kind = "Str" /* Str */;
  returnKind = "Str" /* Str */;
  baseColor = "#6d90f1" /* Sky */;
  value;
  constructor(match) {
    super();
    this.value = match;
  }
  View() {
    return '"' + this.value + '"';
  }
  Draw(ctx) {
    ctx.write(this.View(), this.Color(), this);
  }
};
var Unquoted = class extends Value {
  kind = "Unquoted" /* Unquoted */;
  returnKind = "Unquoted" /* Unquoted */;
  baseColor = "#c85d18" /* Orange */;
  value;
  constructor(match) {
    super();
    this.value = match;
  }
  View() {
    return this.value;
  }
  Draw(ctx) {
    ctx.write(this.View(), this.Color(), this);
  }
};
var Label = class extends Op {
  kind = "Label" /* Label */;
  returnKind = "Label" /* Label */;
  baseColor = "#2d5ccb" /* Blue */;
  name = null;
  labeled = null;
  constructor() {
    super();
    this.lBind = 5 /* LabelLeft */;
    this.rBind = 2 /* LabelRight */;
  }
  consumePre(prev) {
    if (prev.returnKind === "Unquoted" /* Unquoted */) {
      this.name = prev.value;
      return this;
    }
    return null;
  }
  consumePost(next) {
    this.labeled = next;
    this.returnKind = next.returnKind;
    this.lBind = next.lBind;
    this.rBind = next.rBind;
    this.complete = true;
    return true;
  }
  View() {
    const nameStr = this.name ?? "_";
    const labeledStr = this.labeled ? this.labeled.View() : "_";
    return nameStr + ":" + labeledStr;
  }
  Draw(ctx) {
    if (this.name !== null) {
      ctx.write(this.name + ":", this.Color(), this);
      ctx.write(" ", this.Color(), this);
    } else {
      ctx.write("_:", this.Color(), this);
      ctx.write(" ", this.Color(), this);
    }
    if (this.labeled !== null) {
      this.labeled.Draw(ctx);
    } else {
      ctx.write("_", this.Color(), this);
    }
  }
  Eval() {
    if (this.labeled === null) {
      return new Blank();
    }
    return this.labeled.Eval();
  }
  Info(ctx) {
    ctx.write("Label ", this.baseColor);
    if (this.name !== null) {
      ctx.write(this.name + ":", "#c85d18" /* Orange */);
    } else {
      ctx.write("_:", this.baseColor);
    }
    this.JamInfo(ctx);
    ctx.write(" => ", this.baseColor);
    const result = this.Eval();
    ctx.write(result.View(), result.Color());
  }
};
var List = class _List extends Value {
  kind = "List" /* List */;
  returnKind = "List" /* List */;
  baseColor = "#6d90f1" /* Sky */;
  items = [];
  labelMap = /* @__PURE__ */ new Map();
  // name → Label (fast lookup)
  breakpoint = -1;
  // -1: horizontal, 0: break immediately (vertical), >0: break after nth element
  append(idea) {
    this.items.push(idea);
    if (idea instanceof Label && idea.name !== null) {
      if (this.labelMap.has(idea.name)) {
        let newName = idea.name + "'";
        while (this.labelMap.has(newName)) {
          newName += "'";
        }
        idea.name = newName;
      }
      this.labelMap.set(idea.name, idea);
    }
  }
  View() {
    return "(" + this.items.map((item) => item.View()).join(" ") + ")";
  }
  LineView() {
    return this.items.map((item) => item.View()).join(" ");
  }
  Eval() {
    const result = new _List();
    for (const item of this.items) {
      result.append(item.Eval());
    }
    return result;
  }
  Draw(ctx) {
    const showParens = !ctx.lineStart || this.breakpoint !== 0 && this.items.length > 0 && this.items[0] instanceof Label;
    if (showParens) {
      ctx.write("(", this.Color(), this);
    } else if (this.breakpoint === -1) {
      ctx.lineStart = false;
    }
    if (this.breakpoint === 0) {
      for (let i = 0; i < this.items.length; i++) {
        if (!ctx.inSourceBounds()) break;
        this.items[i].Draw(ctx);
        ctx.newLine();
      }
    } else {
      for (let i = 0; i < this.items.length; i++) {
        this.items[i].Draw(ctx);
        if (i < this.items.length - 1) {
          ctx.write(" ", this.Color(), this);
        }
      }
    }
    if (showParens) {
      ctx.write(")", this.Color(), this);
    }
  }
  Info(ctx) {
    ctx.write("List ", this.baseColor);
    ctx.write("#" + this.items.length + " ", this.baseColor);
    const result = this.Eval();
    ctx.write(" => ", this.baseColor);
    ctx.write(result.View(), result.Color());
  }
};
var Nothing = class extends Value {
  kind = "Bit" /* Nothing */;
  returnKind = "Bit" /* Nothing */;
  baseColor = "#8e8f91" /* Middle */;
  View() {
    return "()";
  }
  Draw(ctx) {
    ctx.write(this.View(), this.Color(), this);
  }
};
var Closure = class extends Idea {
  kind = "Bit" /* Nothing */;
  returnKind = "Bit" /* Nothing */;
  View() {
    throw new Error("Closure should never appear in AST");
  }
  Draw(ctx) {
    throw new Error("Closure should never appear in AST");
  }
};
var Blank = class extends Idea {
  kind = "Blank" /* Blank */;
  returnKind = "Blank" /* Blank */;
  View() {
    return "_";
  }
  Draw(ctx) {
    ctx.write("_", this.Color(), this);
  }
};
var Add = class extends Op {
  kind = "Add" /* Add */;
  returnKind = "Operator" /* Operator */;
  left = null;
  right = null;
  constructor() {
    super();
    this.lBind = 3 /* Additive */;
    this.rBind = 3 /* Additive */;
  }
  consumePre(prev) {
    if (prev.returnKind === "Num" /* Num */) {
      this.left = prev;
      return this;
    }
    return null;
  }
  consumePost(next) {
    if (next.returnKind === "Num" /* Num */) {
      this.right = next;
      if (this.left !== null) {
        this.complete = true;
        this.returnKind = "Num" /* Num */;
      }
      return true;
    }
    return false;
  }
  View() {
    const leftArg = this.left === null ? "_" : this.left.View();
    const rightArg = this.right === null ? "_" : this.right.View();
    return leftArg + "+" + rightArg;
  }
  Eval() {
    if (this.left === null || this.right === null) {
      return new Blank();
    }
    const leftResult = this.left.Eval();
    const rightResult = this.right.Eval();
    if (leftResult instanceof Num && rightResult instanceof Num) {
      return new Num(leftResult.value + rightResult.value);
    }
    return new Blank();
  }
  Draw(ctx) {
    if (this.left !== null) {
      const needsParens = this.left.rBind > 0 /* NonBinding */ && this.left.rBind < this.lBind || this.left instanceof Label;
      if (needsParens) ctx.write("(", "#aff188" /* Mint */, this);
      this.left.Draw(ctx);
      if (needsParens) ctx.write(")", "#aff188" /* Mint */, this);
    } else {
      ctx.write("_", this.Color(), this);
    }
    ctx.write("+", this.Color(), this);
    if (this.right !== null) {
      const needsParens = this.right.lBind > 0 /* NonBinding */ && this.right.lBind < this.rBind || this.right instanceof Label;
      if (needsParens) ctx.write("(", "#aff188" /* Mint */, this);
      this.right.Draw(ctx);
      if (needsParens) ctx.write(")", "#aff188" /* Mint */, this);
    } else {
      ctx.write("_", this.Color(), this);
    }
  }
};
var Mul = class extends Op {
  kind = "Mul" /* Mul */;
  returnKind = "Operator" /* Operator */;
  left = null;
  right = null;
  constructor() {
    super();
    this.lBind = 4 /* Multiplicative */;
    this.rBind = 4 /* Multiplicative */;
  }
  consumePre(prev) {
    if (prev.returnKind === "Num" /* Num */) {
      this.left = prev;
      return this;
    }
    return null;
  }
  consumePost(next) {
    if (next.returnKind === "Num" /* Num */) {
      this.right = next;
      if (this.left !== null) {
        this.complete = true;
        this.returnKind = "Num" /* Num */;
      }
      return true;
    }
    return false;
  }
  View() {
    const leftArg = this.left === null ? "_" : this.left.View();
    const rightArg = this.right === null ? "_" : this.right.View();
    return leftArg + "*" + rightArg;
  }
  Eval() {
    if (this.left === null || this.right === null) {
      return new Blank();
    }
    const leftResult = this.left.Eval();
    const rightResult = this.right.Eval();
    if (leftResult instanceof Num && rightResult instanceof Num) {
      return new Num(leftResult.value * rightResult.value);
    }
    return new Blank();
  }
  Draw(ctx) {
    if (this.left !== null) {
      const needsParens = this.left.rBind > 0 /* NonBinding */ && this.left.rBind < this.lBind || this.left instanceof Label;
      if (needsParens) ctx.write("(", "#aff188" /* Mint */, this);
      this.left.Draw(ctx);
      if (needsParens) ctx.write(")", "#aff188" /* Mint */, this);
    } else {
      ctx.write("_", this.Color(), this);
    }
    ctx.write("*", this.Color(), this);
    if (this.right !== null) {
      const needsParens = this.right.lBind > 0 /* NonBinding */ && this.right.lBind < this.rBind || this.right instanceof Label;
      if (needsParens) ctx.write("(", "#aff188" /* Mint */, this);
      this.right.Draw(ctx);
      if (needsParens) ctx.write(")", "#aff188" /* Mint */, this);
    } else {
      ctx.write("_", this.Color(), this);
    }
  }
};

// web/src/console.ts
var DrawContext2 = class {
  console;
  col = 1;
  row = 1;
  lineStart = true;
  // Target coordinates for cursor detection (1-indexed)
  targetCol = -1;
  targetRow = -1;
  // Idea under cursor (set during draw if coordinates match)
  ideaUnderCursor = null;
  constructor(console2, targetCol = 0, targetRow = 0) {
    this.console = console2;
    this.targetCol = targetCol;
    this.targetRow = targetRow;
  }
  // Write text at current position and advance cursor
  write(text, color, idea = null) {
    if (idea !== null && this.targetRow === this.row) {
      const startCol = this.col;
      const endCol = this.col + text.length - 1;
      if (this.targetCol >= startCol && this.targetCol <= endCol) {
        this.ideaUnderCursor = idea;
      }
    }
    this.console.drawText(text, this.col, this.row, color);
    this.col += text.length;
    this.lineStart = false;
  }
  // Move to next line
  newLine() {
    this.row++;
    this.col = 1;
    this.lineStart = true;
  }
  // Get remaining columns in current row
  remainingCols() {
    return this.console.getCols() - this.col + 1;
  }
  // Check if position is within source bounds (rows 1-22)
  inSourceBounds() {
    return this.row >= this.console.sourceStart && this.row <= this.console.sourceEnd;
  }
};
var Console = class {
  width = 100;
  height = 30;
  sourceStart = 1;
  sourceEnd = this.height - 2;
  statusLine = this.height - 1;
  cmdLine = this.height;
  fontSize;
  fontFamily = "JetBrains Mono";
  // Measured character metrics
  charWidth = 0;
  charHeight = 0;
  // Canvas
  canvas;
  ctx;
  // Colors
  sourceColor = "#202123" /* Dark */;
  statusBg = "#101113" /* Black */;
  cursorColor = "#8e8f91" /* Middle */;
  // Parser
  parser = new Parser();
  // Source - vertical implicit list of lines
  source;
  // Command line input state
  prompt = "^..^ ";
  currentLine = "";
  cursorPosition = 0;
  history = [];
  historyIndex = -1;
  // Mouse tracking - target cell coordinates
  targetCol = -1;
  targetRow = -1;
  constructor(canvasId, fontSize) {
    this.fontSize = fontSize;
    const canvas = document.getElementById(canvasId);
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      throw new Error(`Canvas element "${canvasId}" not found`);
    }
    this.canvas = canvas;
    const ctx = this.canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      throw new Error("Failed to get 2D context");
    }
    this.ctx = ctx;
    this.source = new List();
    this.source.breakpoint = 0;
    this.initialize();
    this.setupKeyboardListeners();
    this.setupMouseListeners();
    this.redrawCommandLine();
  }
  initialize() {
    this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
    const metrics = this.ctx.measureText("M");
    this.charWidth = metrics.width;
    this.charHeight = Math.ceil(this.fontSize * 1.5);
    this.canvas.width = this.width * this.charWidth;
    this.canvas.height = this.height * this.charHeight;
    this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "left";
    this.clear();
  }
  // Clear entire console
  clear() {
    this.ctx.fillStyle = this.sourceColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  // Clear source section (lines 1-22)
  clearSource() {
    this.ctx.fillStyle = this.sourceColor;
    const y = 0;
    const height = this.sourceEnd * this.charHeight;
    this.ctx.fillRect(0, y, this.canvas.width, height);
  }
  // Clear status line
  clearStatus() {
    this.ctx.fillStyle = this.statusBg;
    const y = (this.statusLine - 1) * this.charHeight;
    const height = this.charHeight;
    this.ctx.fillRect(0, y, this.canvas.width, height);
  }
  // Clear command line (line 24)
  clearCommand() {
    this.ctx.fillStyle = this.sourceColor;
    const y = (this.cmdLine - 1) * this.charHeight;
    const height = this.charHeight;
    this.ctx.fillRect(0, y, this.canvas.width, height);
  }
  // Draw text starting at console coordinates
  drawText(text, col, row, color) {
    if (row < 1 || row > this.height || col < 1 || col > this.width) {
      return;
    }
    const x = (col - 1) * this.charWidth;
    const y = (row - 1) * this.charHeight + this.charHeight / 2;
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
  }
  // Draw status line text (always on line 23)
  drawStatus(text) {
    this.clearStatus();
    this.drawText(text, 1, this.statusLine, this.cursorColor);
  }
  // Draw source section from source tree
  drawSource() {
    this.clearSource();
    const ctx = new DrawContext2(this, this.targetCol, this.targetRow);
    this.source.Draw(ctx);
    if (ctx.ideaUnderCursor !== null) {
      this.clearStatus();
      const statusCtx = new DrawContext2(this);
      statusCtx.row = this.statusLine;
      statusCtx.col = 2;
      ctx.ideaUnderCursor.Info(statusCtx);
    }
  }
  // Draw command line with token-based coloring
  drawCommandLine(text, tokens, cursorPos) {
    this.clearCommand();
    let startPos = 1;
    for (const token of tokens) {
      const endPos = token.endIndex + 1;
      const tokenText = text.slice(startPos - 1, endPos - 1);
      const color = token.idea.Color();
      this.drawText(tokenText, startPos, this.cmdLine, color);
      startPos = endPos;
    }
    if (startPos <= text.length) {
      this.drawText(text.slice(startPos - 1), startPos, this.cmdLine, "#6c7086");
    }
    this.drawCursor(cursorPos, this.cmdLine);
  }
  // Draw cursor at position (1-indexed column)
  drawCursor(col, row) {
    if (row < 1 || row > this.height || col < 1 || col > this.width) {
      return;
    }
    const x = (col - 1) * this.charWidth;
    const y = row * this.charHeight - 2;
    this.ctx.fillStyle = this.cursorColor;
    this.ctx.fillRect(x, y, this.charWidth, 2);
  }
  // Get character dimensions (for DrawContext)
  getCharWidth() {
    return this.charWidth;
  }
  getCharHeight() {
    return this.charHeight;
  }
  // Get canvas dimensions
  getCols() {
    return this.width;
  }
  getRows() {
    return this.height;
  }
  // === Input handling ===
  setupKeyboardListeners() {
    document.addEventListener("keydown", (e) => {
      this.handleKeyDown(e);
    });
  }
  setupMouseListeners() {
    this.canvas.addEventListener("mousemove", (e) => {
      this.handleMouseMove(e);
    });
  }
  handleMouseMove(e) {
    const col = Math.floor(e.offsetX / this.charWidth) + 1;
    const row = Math.floor(e.offsetY / this.charHeight) + 1;
    this.targetCol = col;
    this.targetRow = row;
    this.drawSource();
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
      "'"
    ];
    if (handledKeys.includes(e.key)) {
      e.preventDefault();
    }
    switch (e.key) {
      case "Enter":
        this.handleSubmit();
        break;
      case "Backspace":
        this.handleBackspace();
        break;
      case "Delete":
        this.handleDelete();
        break;
      case "ArrowLeft":
        this.handleArrowLeft();
        break;
      case "ArrowRight":
        this.handleArrowRight();
        break;
      case "ArrowUp":
        this.handleArrowUp();
        break;
      case "ArrowDown":
        this.handleArrowDown();
        break;
      case "Home":
        this.handleHome();
        break;
      case "End":
        this.handleEnd();
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          this.handleCharacterInput(e.key);
        }
        break;
    }
  }
  handleCharacterInput(char) {
    this.currentLine = this.currentLine.slice(0, this.cursorPosition) + char + this.currentLine.slice(this.cursorPosition);
    this.cursorPosition++;
    this.redrawCommandLine();
  }
  handleBackspace() {
    if (this.cursorPosition > 0) {
      this.currentLine = this.currentLine.slice(0, this.cursorPosition - 1) + this.currentLine.slice(this.cursorPosition);
      this.cursorPosition--;
      this.redrawCommandLine();
    }
  }
  handleDelete() {
    if (this.cursorPosition < this.currentLine.length) {
      this.currentLine = this.currentLine.slice(0, this.cursorPosition) + this.currentLine.slice(this.cursorPosition + 1);
      this.redrawCommandLine();
    }
  }
  handleArrowLeft() {
    if (this.cursorPosition > 0) {
      this.cursorPosition--;
      this.redrawCommandLine();
    }
  }
  handleArrowRight() {
    if (this.cursorPosition < this.currentLine.length) {
      this.cursorPosition++;
      this.redrawCommandLine();
    }
  }
  handleArrowUp() {
    if (this.history.length === 0) return;
    if (this.historyIndex === -1) {
      this.historyIndex = this.history.length - 1;
    } else if (this.historyIndex > 0) {
      this.historyIndex--;
    }
    this.currentLine = this.history[this.historyIndex];
    this.cursorPosition = this.currentLine.length;
    this.redrawCommandLine();
  }
  handleArrowDown() {
    if (this.historyIndex === -1) return;
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.currentLine = this.history[this.historyIndex];
    } else {
      this.historyIndex = -1;
      this.currentLine = "";
    }
    this.cursorPosition = this.currentLine.length;
    this.redrawCommandLine();
  }
  handleHome() {
    this.cursorPosition = 0;
    this.redrawCommandLine();
  }
  handleEnd() {
    this.cursorPosition = this.currentLine.length;
    this.redrawCommandLine();
  }
  handleSubmit() {
    const line = this.currentLine;
    if (line.trim().length > 0) {
      this.history.push(line);
      this.historyIndex = -1;
    }
    if (line.trim()) {
      try {
        const result = this.parser.start(line);
        this.source.append(result);
        this.drawSource();
        const output = LineView(result);
        this.drawStatus(output);
      } catch (error) {
        this.drawStatus("Error: " + error.message);
      }
    }
    this.currentLine = "";
    this.cursorPosition = 0;
    this.redrawCommandLine();
  }
  redrawCommandLine() {
    this.parser.start(this.currentLine);
    const tokens = this.parser.tokens;
    console.log("Tokens for:", this.currentLine);
    tokens.forEach((t, i) => {
      console.log(
        `  [${i}] endIndex: ${t.endIndex}, idea: ${t.idea.constructor.name}, text: "${this.currentLine.slice(i === 0 ? 0 : tokens[i - 1].endIndex, t.endIndex)}"`
      );
    });
    const fullText = this.prompt + this.currentLine;
    const cursorCol = this.prompt.length + this.cursorPosition + 1;
    const adjustedTokens = tokens.map((t) => ({
      endIndex: t.endIndex + this.prompt.length,
      idea: t.idea
    }));
    this.drawCommandLine(fullText, adjustedTokens, cursorCol);
  }
};

// web/src/playground.ts
async function initPlayground() {
  try {
    await document.fonts.load('14px "JetBrains Mono"');
    console.log("JetBrains Mono font loaded");
  } catch (error) {
    console.error("Failed to load font:", error);
  }
  const con = new Console("console-canvas", 14);
  con.drawStatus("Barry v0.1.0 - Ready");
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPlayground);
} else {
  initPlayground();
}
//# sourceMappingURL=playground.js.map
