// Console - Canvas-based 80x24 character grid for Barry playground
// Line 1-22: Source section
// Line 23: Status line
// Line 24: Command line

import { Parser, LineView, Idea } from "./barry.js"

export interface TokenInfo {
  endIndex: number // End position in text
  idea: Idea // The idea parsed from this text segment
}

export class Console {
  private cols = 80
  private rows = 24
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

  // Command line input state
  private prompt = "(_*_) "
  private currentLine: string = ""
  private cursorPosition: number = 0
  private history: string[] = []
  private historyIndex: number = -1

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

    this.initialize()
    this.setupKeyboardListeners()
    this.redrawCommandLine()
  }

  private initialize(): void {
    // Set font and measure character dimensions
    this.ctx.font = `${this.fontSize}px ${this.fontFamily}`
    const metrics = this.ctx.measureText("M")
    this.charWidth = metrics.width
    // Line height is typically 1.5x font size for monospace
    this.charHeight = Math.ceil(this.fontSize * 1.5)

    // Size canvas to fit exactly 80x24 characters
    this.canvas.width = this.cols * this.charWidth
    this.canvas.height = this.rows * this.charHeight

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
    const height = 22 * this.charHeight
    this.ctx.fillRect(0, y, this.canvas.width, height)
  }

  // Clear status line (line 23)
  clearStatus(): void {
    this.ctx.fillStyle = this.statusBg
    const y = 22 * this.charHeight
    const height = this.charHeight
    this.ctx.fillRect(0, y, this.canvas.width, height)
  }

  // Clear command line (line 24)
  clearCommand(): void {
    this.ctx.fillStyle = this.bgColor
    const y = 23 * this.charHeight
    const height = this.charHeight
    this.ctx.fillRect(0, y, this.canvas.width, height)
  }

  // Draw text starting at console coordinates (col: 0-79, row: 1-24)
  drawText(text: string, col: number, row: number, color: string): void {
    if (row < 1 || row > this.rows || col < 0 || col >= this.cols) {
      return // Out of bounds
    }

    const x = col * this.charWidth
    const y = (row - 1) * this.charHeight + this.charHeight / 2 // Middle of cell

    this.ctx.fillStyle = color
    this.ctx.fillText(text, x, y)
  }

  // Draw status line text (always on line 23)
  drawStatus(text: string): void {
    this.clearStatus()
    this.drawText(text, 0, 23, this.fgColor)
  }

  // Draw command line with token-based coloring
  drawCommandLine(text: string, tokens: TokenInfo[], cursorPos: number): void {
    this.clearCommand()

    // Draw text with token colors
    let startIdx = 0
    for (const token of tokens) {
      const tokenText = text.slice(startIdx, token.endIndex)
      const color = token.idea.Color()
      this.drawText(tokenText, startIdx, 24, color)
      startIdx = token.endIndex
    }

    // Draw any remaining text (unparsed) in gray
    if (startIdx < text.length) {
      this.drawText(text.slice(startIdx), startIdx, 24, "#6c7086")
    }

    // Draw cursor
    this.drawCursor(cursorPos, 24)
  }

  // Draw cursor at position
  private drawCursor(col: number, row: number): void {
    if (row < 1 || row > this.rows || col < 0 || col >= this.cols) {
      return
    }

    const x = col * this.charWidth
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
    return this.cols
  }

  getRows(): number {
    return this.rows
  }

  // === Input handling ===

  private setupKeyboardListeners(): void {
    document.addEventListener("keydown", (e) => {
      this.handleKeyDown(e)
    })
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

    // Parse and display result
    if (line.trim()) {
      try {
        const result = this.parser.start(line)
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
        `  [${i}] endIndex: ${t.endIndex}, idea: ${t.idea.constructor.name}, text: "${this.currentLine.slice(i === 0 ? 0 : tokens[i - 1].endIndex, t.endIndex)}"`
      )
    })

    // Build full command line text with prompt
    const fullText = this.prompt + this.currentLine
    const cursorCol = this.prompt.length + this.cursorPosition

    // Adjust token endIndex to account for prompt
    const adjustedTokens = tokens.map(t => ({
      endIndex: t.endIndex + this.prompt.length,
      idea: t.idea
    }))

    this.drawCommandLine(fullText, adjustedTokens, cursorCol)
  }
}
