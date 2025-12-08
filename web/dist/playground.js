// web/src/barry.ts
var TOKEN_PATTERN = /(?:"(?<quoted>[^"]*)"|(?<open>\()|(?<close>\))|(?<number>-?\d+\.?\d*)|(?<seal>[^\w\s"()]+)|(?<string>\S+)|(?<append>\s+))/g;
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
var SealMap = /* @__PURE__ */ new Map([["+", () => new Add()]]);
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
        const consumedLength = len;
        this.regex.lastIndex = matchEndPos - sealString.length + consumedLength;
        return SealMap.get(candidate)();
      }
    }
    const errorIdea = new Err(`Unknown seal: ${sealString[0]}`);
    this.tokens.push({
      endIndex: matchEndPos,
      idea: errorIdea
    });
    return errorIdea;
  }
  // Entry point for parsing - handles root list with special processing
  start(input) {
    this.input = input;
    this.regex.lastIndex = 0;
    this.tokens = [];
    const rootList = new List();
    while (true) {
      const idea = this.next(null, 0);
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
    } else if (match.groups.open !== void 0) {
      idea = new List();
    } else if (match.groups.close !== void 0) {
      idea = new Closure();
    } else if (match.groups.string !== void 0) {
      if (NameMap.has(match.groups.string)) {
        idea = NameMap.get(match.groups.string)();
      } else {
        idea = new Str(match.groups.string);
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
    console.log("Created idea:", idea instanceof Closure ? ")" : idea.View());
    if (prev !== null) {
      if (idea.precedence < suitor) {
        rewind();
        return null;
      }
      const consumed = idea.consumePre(prev);
      if (consumed === null) {
        rewind();
        return null;
      }
      idea = consumed;
    }
    if (idea instanceof Closure) {
      return idea;
    }
    if (idea instanceof List) {
      while (true) {
        const item = this.next(null, 0);
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
      }
    }
    if ("consumePost" in idea) {
      const postPos = this.regex.lastIndex;
      const rewindPost = () => {
        this.regex.lastIndex = postPos;
      };
      const nextIdea2 = this.next(null, idea.precedence);
      if (nextIdea2 !== null) {
        if (!idea.consumePost(nextIdea2)) {
          rewindPost();
        }
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
  precedence = 0;
  finished = false;
  complete = false;
  // Ideas are incomplete by default
  // Default: ideas don't consume pre (return null)
  consumePre(prev) {
    return null;
  }
};
var Err = class extends Idea {
  message;
  constructor(message) {
    super();
    this.message = message;
    this.complete = true;
  }
  View() {
    return `Error: ${this.message}`;
  }
  Color() {
    return "#fc4b28";
  }
  Draw(ctx) {
    ctx.write(this.View(), this.Color());
  }
};
var Num = class extends Idea {
  value;
  constructor(match) {
    super();
    this.value = parseFloat(match);
    this.complete = true;
  }
  View() {
    return this.value.toString();
  }
  Color() {
    return "#a6da95";
  }
  Draw(ctx) {
    ctx.write(this.View(), this.Color());
  }
};
var Str = class extends Idea {
  value;
  constructor(match) {
    super();
    this.value = match;
    this.complete = true;
  }
  View() {
    return '"' + this.value + '"';
  }
  Color() {
    return "#eed49f";
  }
  Draw(ctx) {
    ctx.write(this.View(), this.Color());
  }
};
var List = class extends Idea {
  items = [];
  breakpoint = -1;
  // -1: horizontal, 0: break immediately (vertical), >0: break after nth element
  constructor() {
    super();
    this.complete = true;
  }
  append(idea) {
    this.items.push(idea);
  }
  View() {
    return "(" + this.items.map((item) => item.View()).join(" ") + ")";
  }
  LineView() {
    return this.items.map((item) => item.View()).join(" ");
  }
  Color() {
    return "#5da4f4";
  }
  Draw(ctx) {
    const showParens = !ctx.lineStart;
    if (showParens) {
      ctx.write("(", this.Color());
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
          ctx.write(" ", this.Color());
        }
      }
    }
    if (showParens) {
      ctx.write(")", this.Color());
    }
  }
};
var Nothing = class extends Idea {
  constructor() {
    super();
    this.complete = true;
  }
  View() {
    return "()";
  }
  Color() {
    return "#7dc4e4";
  }
  Draw(ctx) {
    ctx.write(this.View(), this.Color());
  }
};
var Closure = class extends Idea {
  constructor() {
    super();
  }
  View() {
    throw new Error("Closure should never appear in AST");
  }
  Color() {
    return "#ff00ff";
  }
  Draw(ctx) {
    throw new Error("Closure should never appear in AST");
  }
};
var Add = class extends Idea {
  left = null;
  right = null;
  constructor() {
    super();
    this.precedence = 10;
  }
  consumePre(prev) {
    if (prev instanceof Num) {
      this.left = prev;
      return this;
    }
    return null;
  }
  consumePost(next) {
    if (next instanceof Num) {
      this.right = next;
      if (this.left !== null) {
        this.complete = true;
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
  Color() {
    return "#c680f6";
  }
  Draw(ctx) {
    if (this.left !== null) {
      this.left.Draw(ctx);
    } else {
      ctx.write("_", this.Color());
    }
    ctx.write("+", this.Color());
    if (this.right !== null) {
      this.right.Draw(ctx);
    } else {
      ctx.write("_", this.Color());
    }
  }
};

// web/src/console.ts
var DrawContext2 = class {
  console;
  col = 1;
  row = 1;
  lineStart = true;
  constructor(console2) {
    this.console = console2;
  }
  // Write text at current position and advance cursor
  write(text, color) {
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
    return this.row >= 1 && this.row <= 22;
  }
};
var Console = class {
  cols = 80;
  rows = 24;
  fontSize;
  fontFamily = "JetBrains Mono";
  // Measured character metrics
  charWidth = 0;
  charHeight = 0;
  // Canvas
  canvas;
  ctx;
  // Colors
  bgColor = "#24273a";
  // Background
  fgColor = "#cad3f5";
  // Default text
  statusBg = "#1e2030";
  // Status line background
  // Parser
  parser = new Parser();
  // Source - vertical implicit list of lines
  source;
  // Command line input state
  prompt = "(_*_) ";
  currentLine = "";
  cursorPosition = 0;
  history = [];
  historyIndex = -1;
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
    this.redrawCommandLine();
  }
  initialize() {
    this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
    const metrics = this.ctx.measureText("M");
    this.charWidth = metrics.width;
    this.charHeight = Math.ceil(this.fontSize * 1.5);
    this.canvas.width = this.cols * this.charWidth;
    this.canvas.height = this.rows * this.charHeight;
    this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "left";
    this.clear();
  }
  // Clear entire console
  clear() {
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  // Clear source section (lines 1-22)
  clearSource() {
    this.ctx.fillStyle = this.bgColor;
    const y = 0;
    const height = 22 * this.charHeight;
    this.ctx.fillRect(0, y, this.canvas.width, height);
  }
  // Clear status line (line 23)
  clearStatus() {
    this.ctx.fillStyle = this.statusBg;
    const y = 22 * this.charHeight;
    const height = this.charHeight;
    this.ctx.fillRect(0, y, this.canvas.width, height);
  }
  // Clear command line (line 24)
  clearCommand() {
    this.ctx.fillStyle = this.bgColor;
    const y = 23 * this.charHeight;
    const height = this.charHeight;
    this.ctx.fillRect(0, y, this.canvas.width, height);
  }
  // Draw text starting at console coordinates (col: 0-79, row: 1-24)
  drawText(text, col, row, color) {
    if (row < 1 || row > this.rows || col < 0 || col >= this.cols) {
      return;
    }
    const x = col * this.charWidth;
    const y = (row - 1) * this.charHeight + this.charHeight / 2;
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
  }
  // Draw status line text (always on line 23)
  drawStatus(text) {
    this.clearStatus();
    this.drawText(text, 0, 23, this.fgColor);
  }
  // Draw source section from source tree
  drawSource() {
    this.clearSource();
    const ctx = new DrawContext2(this);
    this.source.Draw(ctx);
  }
  // Draw command line with token-based coloring
  drawCommandLine(text, tokens, cursorPos) {
    this.clearCommand();
    let startIdx = 0;
    for (const token of tokens) {
      const tokenText = text.slice(startIdx, token.endIndex);
      const color = token.idea.Color();
      this.drawText(tokenText, startIdx, 24, color);
      startIdx = token.endIndex;
    }
    if (startIdx < text.length) {
      this.drawText(text.slice(startIdx), startIdx, 24, "#6c7086");
    }
    this.drawCursor(cursorPos, 24);
  }
  // Draw cursor at position
  drawCursor(col, row) {
    if (row < 1 || row > this.rows || col < 0 || col >= this.cols) {
      return;
    }
    const x = col * this.charWidth;
    const y = row * this.charHeight - 2;
    this.ctx.fillStyle = this.fgColor;
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
    return this.cols;
  }
  getRows() {
    return this.rows;
  }
  // === Input handling ===
  setupKeyboardListeners() {
    document.addEventListener("keydown", (e) => {
      this.handleKeyDown(e);
    });
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
      " "
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
    const cursorCol = this.prompt.length + this.cursorPosition;
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
