// Barry Playground - Main entry point
import { Console } from "./console.js"
import { InputHandler } from "./input.js"
import { Parse, LineView } from "./barry.js"

function handleInput(
  line: string,
  con: Console,
  input: InputHandler,
): void {
  if (!line.trim()) {
    input.showPrompt()
    return
  }

  try {
    // Parse the input
    const result = Parse(line)

    // Display the result
    const output = LineView(result)
    con.writeLine(output)
  } catch (error) {
    // Display error
    con.writeLine("Error: " + (error as Error).message)
  }

  // Show new prompt
  input.showPrompt()
}

// Wait for JetBrains Mono font to load before initializing console
async function initPlayground() {
  try {
    // Load JetBrains Mono font
    await document.fonts.load('14px "JetBrains Mono"')
    console.log("JetBrains Mono font loaded")
  } catch (error) {
    console.error("Failed to load font:", error)
  }

  // Initialize console
  const con = new Console("terminal-canvas")
  con.clear()

  // Welcome message
  con.writeLine("Barry - A Programming Language to Get Lucky")
  con.writeLine("(_*_) ")
  con.writeLine("")

  // Initialize input handler
  const input = new InputHandler(con, {
    promptSymbol: "> ",
    onSubmit: (line: string) => {
      handleInput(line, con, input)
    },
  })

  // Show initial prompt
  input.showPrompt()
}

// Start when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPlayground)
} else {
  initPlayground()
}
