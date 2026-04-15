#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const SKILL_NAME = "security-analysis-skill";

// Determine target directory
const home = process.env.HOME || process.env.USERPROFILE;
const targetDir = path.join(home, ".agents", "skills", SKILL_NAME);
const refsTarget = path.join(targetDir, "references");

// Source files (relative to the package root, not bin/)
const pkgRoot = path.resolve(__dirname, "..");
const skillSrc = path.join(pkgRoot, "SKILL.md");
const refsSrc = path.join(pkgRoot, "references");

// Handle --uninstall flag
if (process.argv.includes("--uninstall")) {
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true });
    console.log(`\u2713 Removed ${targetDir}`);
  } else {
    console.log("Nothing to uninstall.");
  }
  process.exit(0);
}

// Create directories
fs.mkdirSync(refsTarget, { recursive: true });

// Copy SKILL.md
fs.copyFileSync(skillSrc, path.join(targetDir, "SKILL.md"));

// Copy all reference files
for (const file of fs.readdirSync(refsSrc)) {
  fs.copyFileSync(path.join(refsSrc, file), path.join(refsTarget, file));
}

console.log(`\u2713 Installed "${SKILL_NAME}" to ${targetDir}`);
console.log("  Restart VS Code or reload the Copilot Chat window to use it.");
console.log("  Invoke with: /security-analysis-skill");
