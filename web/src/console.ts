// Console - Canvas-based 80x24 character grid for Barry playground
// Line 1-22: Source section
// Line 23: Status line
// Line 24: Command line

export interface TokenInfo {
  endIndex: number // End position in text
  kind: string // Token type (for coloring)
  color: string // Display color
  error?: string // Optional error message
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

  constructor(canvasId: string, fontSize: number = 14) {
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
      this.drawText(tokenText, startIdx, 24, token.color)
      startIdx = token.endIndex
    }

    // Draw any remaining text
    if (startIdx < text.length) {
      this.drawText(text.slice(startIdx), startIdx, 24, this.fgColor)
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
}
