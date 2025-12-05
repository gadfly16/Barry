// Input handler for console - manages command line input
import { Console, TokenInfo } from "./console.js"

interface InputConfig {
  onSubmit: (line: string) => void
}

export class InputHandler {
  private console: Console
  private config: InputConfig
  private prompt = "(_*_) "
  private currentLine: string = ""
  private cursorPosition: number = 0
  private history: string[] = []
  private historyIndex: number = -1

  constructor(console: Console, config: InputConfig) {
    this.console = console
    this.config = config
    this.setupKeyboardListeners()
    this.redraw()
  }

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
    // Insert character at cursor position
    this.currentLine =
      this.currentLine.slice(0, this.cursorPosition) +
      char +
      this.currentLine.slice(this.cursorPosition)
    this.cursorPosition++
    this.redraw()
  }

  private handleBackspace(): void {
    if (this.cursorPosition > 0) {
      this.currentLine =
        this.currentLine.slice(0, this.cursorPosition - 1) +
        this.currentLine.slice(this.cursorPosition)
      this.cursorPosition--
      this.redraw()
    }
  }

  private handleDelete(): void {
    if (this.cursorPosition < this.currentLine.length) {
      this.currentLine =
        this.currentLine.slice(0, this.cursorPosition) +
        this.currentLine.slice(this.cursorPosition + 1)
      this.redraw()
    }
  }

  private handleArrowLeft(): void {
    if (this.cursorPosition > 0) {
      this.cursorPosition--
      this.redraw()
    }
  }

  private handleArrowRight(): void {
    if (this.cursorPosition < this.currentLine.length) {
      this.cursorPosition++
      this.redraw()
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
    this.redraw()
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
    this.redraw()
  }

  private handleHome(): void {
    this.cursorPosition = 0
    this.redraw()
  }

  private handleEnd(): void {
    this.cursorPosition = this.currentLine.length
    this.redraw()
  }

  private handleSubmit(): void {
    const line = this.currentLine

    // Add to history if non-empty
    if (line.trim().length > 0) {
      this.history.push(line)
      this.historyIndex = -1
    }

    // Call the submit callback
    this.config.onSubmit(line)

    // Reset input state
    this.currentLine = ""
    this.cursorPosition = 0
    this.redraw()
  }

  private redraw(): void {
    // For now, no token coloring - just display text
    // TODO: Parse and generate tokens for syntax highlighting
    const tokens: TokenInfo[] = []

    // Build full command line text with prompt
    const fullText = this.prompt + this.currentLine
    const cursorCol = this.prompt.length + this.cursorPosition

    this.console.drawCommandLine(fullText, tokens, cursorCol)
  }

  // Update display after external changes (e.g., parser feedback)
  updateDisplay(tokens: TokenInfo[]): void {
    const fullText = this.prompt + this.currentLine
    const cursorCol = this.prompt.length + this.cursorPosition
    this.console.drawCommandLine(fullText, tokens, cursorCol)
  }

  // Get current input text (for external parsing)
  getCurrentLine(): string {
    return this.currentLine
  }
}
