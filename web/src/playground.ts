// Barry Playground - Main entry point (v0.1.0)
import { Console } from "./console.js"
import { InputHandler } from "./input.js"
import { Parse, LineView } from "./barry.js"

function handleInput(line: string, con: Console): void {
  if (!line.trim()) {
    return
  }

  try {
    // Parse the input
    const result = Parse(line)

    // For now, just show result in status line
    const output = LineView(result)
    con.drawStatus(output)
  } catch (error) {
    // Display error in status line
    con.drawStatus("Error: " + (error as Error).message)
  }
}

// Wait for JetBrains Mono font to load before initializing
async function initPlayground() {
  try {
    // Load JetBrains Mono font
    await document.fonts.load('14px "JetBrains Mono"')
    console.log("JetBrains Mono font loaded")
  } catch (error) {
    console.error("Failed to load font:", error)
  }

  // Initialize console (80x24)
  const con = new Console("terminal-canvas", 14)

  // Initialize input handler
  const input = new InputHandler(con, {
    onSubmit: (line: string) => {
      handleInput(line, con)
    },
  })

  // Initial status message
  con.drawStatus("Barry v0.1.0 - Ready")
}

// Start when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPlayground)
} else {
  initPlayground()
}
