#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const os = require("os");

const SKILL_NAME = "security-analysis-skill";
const home = os.homedir();
const pkgRoot = path.resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Content helpers
// ---------------------------------------------------------------------------

function readSkillBody() {
  const raw = fs.readFileSync(path.join(pkgRoot, "SKILL.md"), "utf8");
  // Strip YAML frontmatter (---...---\n)
  return raw.replace(/^---[\s\S]*?---\n/, "").trimStart();
}

/**
 * Build a single self-contained markdown document by embedding all reference
 * files inline. Used for agents that cannot load external files.
 */
function buildCombined() {
  let body = readSkillBody();

  // Rewrite Step 1 framework list to point to embedded sections below
  body = body.replace(
    /- \*\*Laravel\*\* → read `references\/laravel\.md`/,
    "- **Laravel** → see _Laravel Security Checklist_ section below"
  );
  body = body.replace(
    /- \*\*Next\.js\*\* → read `references\/nextjs\.md`/,
    "- **Next.js** → see _Next.js Security Checklist_ section below"
  );
  body = body.replace(
    /- \*\*ASP\.NET Core \(C#\)\*\* → read `references\/aspnet\.md`/,
    "- **ASP.NET Core (C#)** → see _ASP.NET Core Security Checklist_ section below"
  );
  body = body.replace(
    /- \*\*React \(any flavour\)\*\* → read `references\/react\.md`/,
    "- **React (any flavour)** → see _React Security Checklist_ section below"
  );
  body = body.replace(
    /- \*\*GraphQL\*\* → read `references\/graphql\.md`/,
    "- **GraphQL** → see _GraphQL Security Checklist_ section below"
  );

  // Rewrite Step 4 reference list to point to embedded sections
  body = body.replace(
    /- Laravel → `references\/laravel\.md`/,
    "- Laravel → _Laravel Security Checklist_ section below"
  );
  body = body.replace(
    /- Next\.js → `references\/nextjs\.md`/,
    "- Next.js → _Next.js Security Checklist_ section below"
  );
  body = body.replace(
    /- ASP\.NET C# → `references\/aspnet\.md`/,
    "- ASP.NET C# → _ASP.NET Core Security Checklist_ section below"
  );
  body = body.replace(
    /- React → `references\/react\.md`/,
    "- React → _React Security Checklist_ section below"
  );
  body = body.replace(
    /- GraphQL → `references\/graphql\.md`/,
    "- GraphQL → _GraphQL Security Checklist_ section below"
  );

  // Append all reference files
  const refsDir = path.join(pkgRoot, "references");
  body += "\n\n---\n\n## Framework-Specific Security Checks\n\n";
  for (const file of fs.readdirSync(refsDir).sort()) {
    const content = fs.readFileSync(path.join(refsDir, file), "utf8");
    body += `${content}\n\n---\n\n`;
  }

  return body.trimEnd();
}

// ---------------------------------------------------------------------------
// Helpers for sections inside shared markdown files (e.g. CLAUDE.md)
// ---------------------------------------------------------------------------

const MARKER_START = `<!-- ${SKILL_NAME}:start -->`;
const MARKER_END   = `<!-- ${SKILL_NAME}:end -->`;

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function appendOrReplaceSection(filePath, heading, content) {
  const block = `\n${MARKER_START}\n# ${heading}\n\n${content}\n${MARKER_END}\n`;
  if (fs.existsSync(filePath)) {
    let existing = fs.readFileSync(filePath, "utf8");
    if (existing.includes(MARKER_START)) {
      const re = new RegExp(
        `\n?${escapeRegex(MARKER_START)}[\\s\\S]*?${escapeRegex(MARKER_END)}\n?`,
        "g"
      );
      existing = existing.replace(re, block);
      fs.writeFileSync(filePath, existing, "utf8");
    } else {
      fs.appendFileSync(filePath, block, "utf8");
    }
  } else {
    fs.writeFileSync(filePath, block.trimStart(), "utf8");
  }
}

function removeSection(filePath) {
  if (!fs.existsSync(filePath)) return;
  const re = new RegExp(
    `\n?${escapeRegex(MARKER_START)}[\\s\\S]*?${escapeRegex(MARKER_END)}\n?`,
    "g"
  );
  const updated = fs.readFileSync(filePath, "utf8").replace(re, "");
  fs.writeFileSync(filePath, updated, "utf8");
}

// ---------------------------------------------------------------------------
// Agent definitions
// User-level agents: install once, active in every project.
// Project-level agents: install into the current working directory.
// ---------------------------------------------------------------------------

const AGENTS = {
  // ── User-level ────────────────────────────────────────────────────────────
  copilot: {
    name: "GitHub Copilot",
    scope: "user",
    install() {
      const targetDir = path.join(home, ".agents", "skills", SKILL_NAME);
      const refsTarget = path.join(targetDir, "references");
      fs.mkdirSync(refsTarget, { recursive: true });
      fs.copyFileSync(path.join(pkgRoot, "SKILL.md"), path.join(targetDir, "SKILL.md"));
      for (const file of fs.readdirSync(path.join(pkgRoot, "references"))) {
        fs.copyFileSync(
          path.join(pkgRoot, "references", file),
          path.join(refsTarget, file)
        );
      }
      return targetDir;
    },
    uninstall() {
      const targetDir = path.join(home, ".agents", "skills", SKILL_NAME);
      if (fs.existsSync(targetDir)) fs.rmSync(targetDir, { recursive: true });
      return targetDir;
    },
  },

  claude: {
    name: "Claude Code",
    scope: "user",
    install() {
      const dir = path.join(home, ".claude");
      fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, "CLAUDE.md");
      appendOrReplaceSection(file, "Security Analysis Skill", buildCombined());
      return file;
    },
    uninstall() {
      const file = path.join(home, ".claude", "CLAUDE.md");
      removeSection(file);
      return file;
    },
  },

  codex: {
    name: "Codex CLI",
    scope: "user",
    install() {
      const dir = path.join(home, ".codex");
      fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, "instructions.md");
      appendOrReplaceSection(file, "Security Analysis Skill", buildCombined());
      return file;
    },
    uninstall() {
      const file = path.join(home, ".codex", "instructions.md");
      removeSection(file);
      return file;
    },
  },

  cursor: {
    name: "Cursor",
    scope: "user",
    install() {
      const dir = path.join(home, ".cursor", "rules");
      fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, `${SKILL_NAME}.mdc`);
      const frontmatter =
        `---\n` +
        `description: Security audit — OWASP Top 10 for Laravel, Next.js, ASP.NET, React, GraphQL\n` +
        `alwaysApply: false\n` +
        `---\n\n`;
      fs.writeFileSync(file, frontmatter + buildCombined(), "utf8");
      return file;
    },
    uninstall() {
      const file = path.join(home, ".cursor", "rules", `${SKILL_NAME}.mdc`);
      if (fs.existsSync(file)) fs.unlinkSync(file);
      return file;
    },
  },

  gemini: {
    name: "Gemini CLI",
    scope: "user",
    install() {
      const dir = path.join(home, ".gemini");
      fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, "GEMINI.md");
      appendOrReplaceSection(file, "Security Analysis Skill", buildCombined());
      return file;
    },
    uninstall() {
      const file = path.join(home, ".gemini", "GEMINI.md");
      removeSection(file);
      return file;
    },
  },

  // ── Project-level (installed into cwd) ────────────────────────────────────
  zed: {
    name: "Zed",
    scope: "project",
    install() {
      const file = path.join(process.cwd(), ".rules");
      appendOrReplaceSection(file, "Security Analysis Skill", buildCombined());
      return file;
    },
    uninstall() {
      const file = path.join(process.cwd(), ".rules");
      removeSection(file);
      return file;
    },
  },

  windsurf: {
    name: "Windsurf",
    scope: "project",
    install() {
      const file = path.join(process.cwd(), ".windsurfrules");
      appendOrReplaceSection(file, "Security Analysis Skill", buildCombined());
      return file;
    },
    uninstall() {
      const file = path.join(process.cwd(), ".windsurfrules");
      removeSection(file);
      return file;
    },
  },

  cline: {
    name: "Cline",
    scope: "project",
    install() {
      const file = path.join(process.cwd(), ".clinerules");
      appendOrReplaceSection(file, "Security Analysis Skill", buildCombined());
      return file;
    },
    uninstall() {
      const file = path.join(process.cwd(), ".clinerules");
      removeSection(file);
      return file;
    },
  },

  aider: {
    name: "Aider",
    scope: "project",
    install() {
      const file = path.join(process.cwd(), "CONVENTIONS.md");
      appendOrReplaceSection(file, "Security Analysis Skill", buildCombined());
      return file;
    },
    uninstall() {
      const file = path.join(process.cwd(), "CONVENTIONS.md");
      removeSection(file);
      return file;
    },
  },

  continue: {
    name: "Continue.dev",
    scope: "project",
    install() {
      const file = path.join(process.cwd(), ".continuerules");
      appendOrReplaceSection(file, "Security Analysis Skill", buildCombined());
      return file;
    },
    uninstall() {
      const file = path.join(process.cwd(), ".continuerules");
      removeSection(file);
      return file;
    },
  },

  amazonq: {
    name: "Amazon Q Developer",
    scope: "project",
    install() {
      const dir = path.join(process.cwd(), ".amazonq", "rules");
      fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, "security-analysis.md");
      fs.writeFileSync(file, buildCombined(), "utf8");
      return file;
    },
    uninstall() {
      const file = path.join(process.cwd(), ".amazonq", "rules", "security-analysis.md");
      if (fs.existsSync(file)) fs.unlinkSync(file);
      return file;
    },
  },
};

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const isUninstall = args.includes("--uninstall");

// --agent=copilot,cursor  or  --agent=user  or  --agent=project  or  omitted (all)
const agentArg = args.find((a) => a.startsWith("--agent="));
let selectedKeys;

if (!agentArg) {
  selectedKeys = Object.keys(AGENTS);
} else {
  const value = agentArg.replace("--agent=", "");
  if (value === "user") {
    selectedKeys = Object.keys(AGENTS).filter((k) => AGENTS[k].scope === "user");
  } else if (value === "project") {
    selectedKeys = Object.keys(AGENTS).filter((k) => AGENTS[k].scope === "project");
  } else {
    selectedKeys = value.split(",").map((s) => s.trim());
  }
}

let anyFailed = false;

for (const key of selectedKeys) {
  const agent = AGENTS[key];
  if (!agent) {
    console.warn(`\u2717 Unknown agent: "${key}". Valid: ${Object.keys(AGENTS).join(", ")}`);
    anyFailed = true;
    continue;
  }
  try {
    if (isUninstall) {
      const location = agent.uninstall();
      console.log(`\u2713 Uninstalled from ${agent.name} (${location})`);
    } else {
      const location = agent.install();
      console.log(`\u2713 ${agent.name} \u2192 ${location}`);
    }
  } catch (err) {
    console.error(`\u2717 ${agent.name}: ${err.message}`);
    anyFailed = true;
  }
}

if (!isUninstall) {
  console.log("\n  Restart your editor / agent to pick up the changes.");
  console.log('  Ask: "audit my code for security issues"');
}

process.exit(anyFailed ? 1 : 0);
