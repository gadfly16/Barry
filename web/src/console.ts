// Console - Canvas-based 80x24 character grid for Barry playground

import { Parser, LineView, Idea, List } from "./barry.js"

export interface TokenInfo {
  endIndex: number // End position in text
  idea: Idea // The idea parsed from this text segment
}

// DrawContext - provides drawing operations for ideas
export class DrawContext {
  private console: Console
  col: number = 1
  row: number = 1
  lineStart: boolean = true

  // Target coordinates for cursor detection (1-indexed)
  targetCol: number = -1
  targetRow: number = -1

  // Idea under cursor (set during draw if coordinates match)
  ideaUnderCursor: Idea | null = null

  constructor(console: Console, targetCol: number = 0, targetRow: number = 0) {
    this.console = console
    this.targetCol = targetCol
    this.targetRow = targetRow
  }

  // Write text at current position and advance cursor
  write(text: string, color: string, idea: Idea | null = null): void {
    // Check if we're drawing at the target coordinates
    if (idea !== null && this.targetRow === this.row) {
      // Check if target column falls within this text span
      const startCol = this.col
      const endCol = this.col + text.length - 1
      if (this.targetCol >= startCol && this.targetCol <= endCol) {
        this.ideaUnderCursor = idea
      }
    }

    this.console.drawText(text, this.col, this.row, color)
    this.col += text.length
    this.lineStart = false
  }

  // Move to next line
  newLine(): void {
    this.row++
    this.col = 1
    this.lineStart = true
  }

  // Get remaining columns in current row
  remainingCols(): number {
    return this.console.getCols() - this.col + 1
  }

  // Check if position is within source bounds (rows 1-22)
  inSourceBounds(): boolean {
    return (
      this.row >= this.console.sourceStart && this.row <= this.console.sourceEnd
    )
  }
}

export class Console {
  private width = 100
  private height = 30
  sourceStart = 1
  sourceEnd = this.height - 2
  private statusLine = this.height - 1
  private cmdLine = this.height
  private fontSize: number
  private fontFamily = "JetBrains Mono"

  // Measured character metrics
  private charWidth: number = 0
  private charHeight: number = 0

  // Canvas
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  // Colors
  private bgColor = "#24273a" // Background
  private fgColor = "#cad3f5" // Default text
  private statusBg = "#1e2030" // Status line background

  // Parser
  private parser = new Parser()

  // Source - vertical implicit list of lines
  private source: List

  // Command line input state
  private prompt = "^..^ "
  private currentLine: string = ""
  private cursorPosition: number = 0
  private history: string[] = []
  private historyIndex: number = -1

  // Mouse tracking - target cell coordinates
  private targetCol: number = -1
  private targetRow: number = -1

  constructor(canvasId: string, fontSize: number) {
    this.fontSize = fontSize

    // Get canvas element
    const canvas = document.getElementById(canvasId)
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      throw new Error(`Canvas element "${canvasId}" not found`)
    }
    this.canvas = canvas

    // Get 2D context
    const ctx = this.canvas.getContext("2d", { alpha: false })
    if (!ctx) {
      throw new Error("Failed to get 2D context")
    }
    this.ctx = ctx

    // Initialize source as vertical implicit list
    this.source = new List()
    this.source.breakpoint = 0 // Break immediately - vertical layout

    this.initialize()
    this.setupKeyboardListeners()
    this.setupMouseListeners()
    this.redrawCommandLine()
  }

  private initialize(): void {
    // Set font and measure character dimensions
    this.ctx.font = `${this.fontSize}px ${this.fontFamily}`
    const metrics = this.ctx.measureText("M")
    this.charWidth = metrics.width
    // Line height is typically 1.5x font size for monospace
    this.charHeight = Math.ceil(this.fontSize * 1.5)

    // Size canvas to fit exactly colxrows characters
    this.canvas.width = this.width * this.charWidth
    this.canvas.height = this.height * this.charHeight

    // Configure rendering context
    this.ctx.font = `${this.fontSize}px ${this.fontFamily}`
    this.ctx.textBaseline = "middle"
    this.ctx.textAlign = "left"

    // Initial clear
    this.clear()
  }

  // Clear entire console
  clear(): void {
    this.ctx.fillStyle = this.bgColor
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  // Clear source section (lines 1-22)
  clearSource(): void {
    this.ctx.fillStyle = this.bgColor
    const y = 0
    const height = this.sourceEnd * this.charHeight
    this.ctx.fillRect(0, y, this.canvas.width, height)
  }

  // Clear status line
  clearStatus(): void {
    this.ctx.fillStyle = this.statusBg
    const y = (this.statusLine - 1) * this.charHeight
    const height = this.charHeight
    this.ctx.fillRect(0, y, this.canvas.width, height)
  }

  // Clear command line (line 24)
  clearCommand(): void {
    this.ctx.fillStyle = this.bgColor
    const y = (this.cmdLine - 1) * this.charHeight
    const height = this.charHeight
    this.ctx.fillRect(0, y, this.canvas.width, height)
  }

  // Draw text starting at console coordinates
  drawText(text: string, col: number, row: number, color: string): void {
    if (row < 1 || row > this.height || col < 1 || col > this.width) {
      return // Out of bounds
    }

    const x = (col - 1) * this.charWidth
    const y = (row - 1) * this.charHeight + this.charHeight / 2 // Middle of cell

    this.ctx.fillStyle = color
    this.ctx.fillText(text, x, y)
  }

  // Draw status line text (always on line 23)
  drawStatus(text: string): void {
    this.clearStatus()
    this.drawText(text, 1, this.statusLine, this.fgColor)
  }

  // Draw source section from source tree
  drawSource(): void {
    this.clearSource()
    const ctx = new DrawContext(this, this.targetCol, this.targetRow)
    this.source.Draw(ctx)

    // Display info about idea under cursor
    if (ctx.ideaUnderCursor !== null) {
      this.clearStatus()
      const statusCtx = new DrawContext(this)
      statusCtx.row = this.statusLine
      statusCtx.col = 2
      ctx.ideaUnderCursor.Info(statusCtx)
    }
  }

  // Draw command line with token-based coloring
  drawCommandLine(text: string, tokens: TokenInfo[], cursorPos: number): void {
    this.clearCommand()

    // Draw text with token colors (using 1-indexed positions)
    let startPos = 1
    for (const token of tokens) {
      // token.endIndex comes from parser as 0-indexed offset, convert to 1-indexed position
      const endPos = token.endIndex + 1
      // Convert 1-indexed positions to 0-indexed offsets for slicing
      const tokenText = text.slice(startPos - 1, endPos - 1)
      const color = token.idea.Color()
      this.drawText(tokenText, startPos, this.cmdLine, color)
      startPos = endPos
    }

    // Draw any remaining text (unparsed) in gray
    if (startPos <= text.length) {
      this.drawText(text.slice(startPos - 1), startPos, this.cmdLine, "#6c7086")
    }

    // Draw cursor
    this.drawCursor(cursorPos, this.cmdLine)
  }

  // Draw cursor at position (1-indexed column)
  private drawCursor(col: number, row: number): void {
    if (row < 1 || row > this.height || col < 1 || col > this.width) {
      return
    }

    // Convert 1-indexed column to 0-indexed offset for pixel calculation
    const x = (col - 1) * this.charWidth
    const y = row * this.charHeight - 2 // Bottom of cell

    this.ctx.fillStyle = this.fgColor
    this.ctx.fillRect(x, y, this.charWidth, 2)
  }

  // Get character dimensions (for DrawContext)
  getCharWidth(): number {
    return this.charWidth
  }

  getCharHeight(): number {
    return this.charHeight
  }

  // Get canvas dimensions
  getCols(): number {
    return this.width
  }

  getRows(): number {
    return this.height
  }

  // === Input handling ===

  private setupKeyboardListeners(): void {
    document.addEventListener("keydown", (e) => {
      this.handleKeyDown(e)
    })
  }

  private setupMouseListeners(): void {
    this.canvas.addEventListener("mousemove", (e) => {
      this.handleMouseMove(e)
    })
  }

  private handleMouseMove(e: MouseEvent): void {
    // Convert pixel coordinates to cell coordinates
    // Note: col is 1-indexed (1-80), row is 1-indexed (1-24)
    const col = Math.floor(e.offsetX / this.charWidth) + 1
    const row = Math.floor(e.offsetY / this.charHeight) + 1

    this.targetCol = col
    this.targetRow = row

    // Redraw source to detect idea under cursor
    this.drawSource()
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Prevent default browser behavior for keys we handle
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
        // Handle printable characters
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          this.handleCharacterInput(e.key)
        }
        break
    }
  }

  private handleCharacterInput(char: string): void {
    this.currentLine =
      this.currentLine.slice(0, this.cursorPosition) +
      char +
      this.currentLine.slice(this.cursorPosition)
    this.cursorPosition++
    this.redrawCommandLine()
  }

  private handleBackspace(): void {
    if (this.cursorPosition > 0) {
      this.currentLine =
        this.currentLine.slice(0, this.cursorPosition - 1) +
        this.currentLine.slice(this.cursorPosition)
      this.cursorPosition--
      this.redrawCommandLine()
    }
  }

  private handleDelete(): void {
    if (this.cursorPosition < this.currentLine.length) {
      this.currentLine =
        this.currentLine.slice(0, this.cursorPosition) +
        this.currentLine.slice(this.cursorPosition + 1)
      this.redrawCommandLine()
    }
  }

  private handleArrowLeft(): void {
    if (this.cursorPosition > 0) {
      this.cursorPosition--
      this.redrawCommandLine()
    }
  }

  private handleArrowRight(): void {
    if (this.cursorPosition < this.currentLine.length) {
      this.cursorPosition++
      this.redrawCommandLine()
    }
  }

  private handleArrowUp(): void {
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

  private handleArrowDown(): void {
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

  private handleHome(): void {
    this.cursorPosition = 0
    this.redrawCommandLine()
  }

  private handleEnd(): void {
    this.cursorPosition = this.currentLine.length
    this.redrawCommandLine()
  }

  private handleSubmit(): void {
    const line = this.currentLine

    // Add to history if non-empty
    if (line.trim().length > 0) {
      this.history.push(line)
      this.historyIndex = -1
    }

    // Parse and add to source
    if (line.trim()) {
      try {
        const result = this.parser.start(line)
        this.source.append(result)
        this.drawSource()
        // Also show in status line
        const output = LineView(result)
        this.drawStatus(output)
      } catch (error) {
        this.drawStatus("Error: " + (error as Error).message)
      }
    }

    // Reset input state
    this.currentLine = ""
    this.cursorPosition = 0
    this.redrawCommandLine()
  }

  private redrawCommandLine(): void {
    // Parse the current line to get token coloring
    this.parser.start(this.currentLine)
    const tokens = this.parser.tokens

    // Debug: dump tokens to console
    console.log("Tokens for:", this.currentLine)
    tokens.forEach((t, i) => {
      console.log(
        `  [${i}] endIndex: ${t.endIndex}, idea: ${t.idea.constructor.name}, text: "${this.currentLine.slice(i === 0 ? 0 : tokens[i - 1].endIndex, t.endIndex)}"`,
      )
    })

    // Build full command line text with prompt
    const fullText = this.prompt + this.currentLine
    // Convert cursorPosition (0-indexed offset) to 1-indexed column position
    const cursorCol = this.prompt.length + this.cursorPosition + 1

    // Adjust token endIndex to account for prompt
    const adjustedTokens = tokens.map((t) => ({
      endIndex: t.endIndex + this.prompt.length,
      idea: t.idea,
    }))

    this.drawCommandLine(fullText, adjustedTokens, cursorCol)
  }
}
