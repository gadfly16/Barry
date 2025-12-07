// Barry Playground - Main entry point (v0.1.0)
import { Console } from "./console.js"

// Wait for JetBrains Mono font to load before initializing
async function initPlayground() {
  try {
    // Wait for JetBrains Mono font to be loaded
    await document.fonts.load('14px "JetBrains Mono"')
    console.log("JetBrains Mono font loaded")
  } catch (error) {
    console.error("Failed to load font:", error)
  }

  // Initialize console (80x24) - handles everything internally
  const con = new Console("console-canvas", 14)

  // Initial status message
  con.drawStatus("Barry v0.1.0 - Ready")
}

// Start when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPlayground)
} else {
  initPlayground()
}
