// Console renderer using canvas for character display
// Cappuccino-inspired color scheme with JetBrains Mono

interface ConsoleConfig {
  cols: number
  rows: number
  fontSize: number
  fontFamily: string
  charWidth: number
  charHeight: number
  backgroundColor: string
  foregroundColor: string
}

interface Cell {
  char: string
  fg: string
  bg: string
}

class Console {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private config: ConsoleConfig
  private buffer: Cell[][]
  private cursorX: number = 0
  private cursorY: number = 0
  private cursorVisible: boolean = true
  private cursorBlinkInterval: number | null = null

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement
    if (!this.canvas) {
      throw new Error(`Canvas element with id "${canvasId}" not found`)
    }

    const ctx = this.canvas.getContext("2d", { alpha: false })
    if (!ctx) {
      throw new Error("Failed to get 2D context")
    }
    this.ctx = ctx

    // Cappuccino-inspired colors
    this.config = {
      cols: 120,
      rows: 80,
      fontSize: 14,
      fontFamily: "JetBrains Mono",
      charWidth: 0, // Will be calculated
      charHeight: 0, // Will be calculated
      backgroundColor: "#24273a", // Canvas background (catppuccin-inspired)
      foregroundColor: "#cad3f5", // Text color (soft white-blue)
    }

    this.initialize()
    this.buffer = this.createBuffer()
    this.startCursorBlink()
  }

  private initialize(): void {
    // Measure character dimensions
    this.ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`
    const metrics = this.ctx.measureText("M")
    this.config.charWidth = metrics.width
    // Line height is typically 1.2-1.5 times font size for monospace
    this.config.charHeight = Math.ceil(this.config.fontSize * 1.5)

    // Set canvas size
    this.canvas.width = this.config.cols * this.config.charWidth
    this.canvas.height = this.config.rows * this.config.charHeight

    // Configure context
    this.ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`
    this.ctx.textBaseline = "top"
    this.ctx.textAlign = "left"
  }

  private createBuffer(): Cell[][] {
    const buffer: Cell[][] = []
    for (let row = 0; row < this.config.rows; row++) {
      buffer[row] = []
      for (let col = 0; col < this.config.cols; col++) {
        buffer[row][col] = {
          char: " ",
          fg: this.config.foregroundColor,
          bg: this.config.backgroundColor,
        }
      }
    }
    return buffer
  }

  private startCursorBlink(): void {
    this.cursorBlinkInterval = window.setInterval(() => {
      this.cursorVisible = !this.cursorVisible
      this.renderCursor()
    }, 500)
  }

  public clear(): void {
    this.buffer = this.createBuffer()
    this.cursorX = 0
    this.cursorY = 0
    this.render()
  }

  public writeChar(char: string, x?: number, y?: number): void {
    const col = x ?? this.cursorX
    const row = y ?? this.cursorY

    if (
      row >= 0 &&
      row < this.config.rows &&
      col >= 0 &&
      col < this.config.cols
    ) {
      this.buffer[row][col] = {
        char: char,
        fg: this.config.foregroundColor,
        bg: this.config.backgroundColor,
      }
      this.renderCell(col, row)
    }

    // Auto-advance cursor if using current position
    if (x === undefined && y === undefined) {
      this.cursorX++
      if (this.cursorX >= this.config.cols) {
        this.cursorX = 0
        this.cursorY++
        if (this.cursorY >= this.config.rows) {
          this.scroll()
        }
      }
    }
  }

  public write(text: string): void {
    for (const char of text) {
      if (char === "\n") {
        this.cursorX = 0
        this.cursorY++
        if (this.cursorY >= this.config.rows) {
          this.scroll()
        }
      } else if (char === "\r") {
        this.cursorX = 0
      } else {
        this.writeChar(char)
      }
    }
    this.renderCursor()
  }

  public writeLine(text: string): void {
    this.write(text + "\n")
  }

  private scroll(): void {
    // Move all rows up by one
    for (let row = 0; row < this.config.rows - 1; row++) {
      this.buffer[row] = this.buffer[row + 1]
    }
    // Clear the last row
    this.buffer[this.config.rows - 1] = []
    for (let col = 0; col < this.config.cols; col++) {
      this.buffer[this.config.rows - 1][col] = {
        char: " ",
        fg: this.config.foregroundColor,
        bg: this.config.backgroundColor,
      }
    }
    this.cursorY = this.config.rows - 1
    this.render()
  }

  private renderCell(col: number, row: number): void {
    const cell = this.buffer[row][col]
    const x = col * this.config.charWidth
    const y = row * this.config.charHeight

    // Draw background
    this.ctx.fillStyle = cell.bg
    this.ctx.fillRect(x, y, this.config.charWidth, this.config.charHeight)

    // Draw character
    this.ctx.fillStyle = cell.fg
    this.ctx.fillText(cell.char, x, y)
  }

  private renderCursor(): void {
    const x = this.cursorX * this.config.charWidth
    const y = this.cursorY * this.config.charHeight

    // Redraw the cell at cursor position first
    this.renderCell(this.cursorX, this.cursorY)

    // Draw cursor if visible
    if (this.cursorVisible) {
      this.ctx.fillStyle = this.config.foregroundColor
      this.ctx.fillRect(
        x,
        y + this.config.charHeight - 2,
        this.config.charWidth,
        2,
      )
    }
  }

  public render(): void {
    // Clear canvas
    this.ctx.fillStyle = this.config.backgroundColor
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Render all cells
    for (let row = 0; row < this.config.rows; row++) {
      for (let col = 0; col < this.config.cols; col++) {
        this.renderCell(col, row)
      }
    }

    this.renderCursor()
  }

  public setCursor(x: number, y: number): void {
    this.cursorX = Math.max(0, Math.min(x, this.config.cols - 1))
    this.cursorY = Math.max(0, Math.min(y, this.config.rows - 1))
    this.render()
  }

  public getCursor(): { x: number; y: number } {
    return { x: this.cursorX, y: this.cursorY }
  }

  public destroy(): void {
    if (this.cursorBlinkInterval !== null) {
      clearInterval(this.cursorBlinkInterval)
    }
  }
}

// Export for use in other modules
export { Console }
