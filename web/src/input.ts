// Keyboard input handler for canvas-based console

import { Console } from './console.js'

interface InputConfig {
  promptSymbol: string
  onSubmit: (line: string) => void
}

class InputHandler {
  private console: Console
  private config: InputConfig
  private currentLine: string = ''
  private cursorPosition: number = 0
  private promptLength: number = 0
  private history: string[] = []
  private historyIndex: number = -1

  constructor(console: Console, config: InputConfig) {
    this.console = console
    this.config = config
    this.promptLength = config.promptSymbol.length
    this.setupKeyboardListeners()
  }

  private setupKeyboardListeners(): void {
    document.addEventListener('keydown', (e) => {
      this.handleKeyDown(e)
    })
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Prevent default browser behavior for keys we handle
    const handledKeys = [
      'Enter',
      'Backspace',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
      'Delete',
    ]
    if (handledKeys.includes(e.key)) {
      e.preventDefault()
    }

    switch (e.key) {
      case 'Enter':
        this.handleSubmit()
        break
      case 'Backspace':
        this.handleBackspace()
        break
      case 'Delete':
        this.handleDelete()
        break
      case 'ArrowLeft':
        this.handleArrowLeft()
        break
      case 'ArrowRight':
        this.handleArrowRight()
        break
      case 'ArrowUp':
        this.handleArrowUp()
        break
      case 'ArrowDown':
        this.handleArrowDown()
        break
      case 'Home':
        this.handleHome()
        break
      case 'End':
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
    this.redrawLine()
  }

  private handleBackspace(): void {
    if (this.cursorPosition > 0) {
      this.currentLine =
        this.currentLine.slice(0, this.cursorPosition - 1) +
        this.currentLine.slice(this.cursorPosition)
      this.cursorPosition--
      this.redrawLine()
    }
  }

  private handleDelete(): void {
    if (this.cursorPosition < this.currentLine.length) {
      this.currentLine =
        this.currentLine.slice(0, this.cursorPosition) +
        this.currentLine.slice(this.cursorPosition + 1)
      this.redrawLine()
    }
  }

  private handleArrowLeft(): void {
    if (this.cursorPosition > 0) {
      this.cursorPosition--
      this.updateCursorPosition()
    }
  }

  private handleArrowRight(): void {
    if (this.cursorPosition < this.currentLine.length) {
      this.cursorPosition++
      this.updateCursorPosition()
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
    this.redrawLine()
  }

  private handleArrowDown(): void {
    if (this.historyIndex === -1) return

    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++
      this.currentLine = this.history[this.historyIndex]
    } else {
      this.historyIndex = -1
      this.currentLine = ''
    }

    this.cursorPosition = this.currentLine.length
    this.redrawLine()
  }

  private handleHome(): void {
    this.cursorPosition = 0
    this.updateCursorPosition()
  }

  private handleEnd(): void {
    this.cursorPosition = this.currentLine.length
    this.updateCursorPosition()
  }

  private handleSubmit(): void {
    const line = this.currentLine

    // Add to history if non-empty
    if (line.trim().length > 0) {
      this.history.push(line)
      this.historyIndex = -1
    }

    // Move to next line
    this.console.write('\n')

    // Call the submit callback
    this.config.onSubmit(line)

    // Reset input state
    this.currentLine = ''
    this.cursorPosition = 0

    // Show new prompt
    this.showPrompt()
  }

  private redrawLine(): void {
    const cursor = this.console.getCursor()
    const lineY = cursor.y

    // Clear the current line from prompt onwards
    this.console.setCursor(this.promptLength, lineY)
    const clearText = ' '.repeat(120 - this.promptLength)
    this.console.write(clearText)

    // Redraw the line content
    this.console.setCursor(this.promptLength, lineY)
    this.console.write(this.currentLine)

    // Position cursor
    this.updateCursorPosition()
  }

  private updateCursorPosition(): void {
    const cursor = this.console.getCursor()
    this.console.setCursor(this.promptLength + this.cursorPosition, cursor.y)
  }

  public showPrompt(): void {
    this.console.write(this.config.promptSymbol)
  }
}

export { InputHandler }
