#!/usr/bin/env node
/**
 * Markdown validation script for pre-commit hook
 * Validates that all markdown files can be rendered properly
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Colors for output
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const RESET = "\x1b[0m";

let marked;
try {
  marked = require("marked");
} catch (e) {
  console.error(`${RED}Error: marked package not found${RESET}`);
  console.error(`${YELLOW}Please run: npm install${RESET}`);
  process.exit(1);
}

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
});

/**
 * Validate a single markdown file
 */
function validateMarkdownFile(filePath) {
  const issues = [];
  const content = fs.readFileSync(filePath, "utf-8");
  const relativePath = path.relative(process.cwd(), filePath);

  // Check 1: Unclosed code blocks
  const codeBlockMatches = content.match(/```/g);
  if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
    issues.push("Unclosed code block");
  }

  // Check 2: Try to parse with marked
  try {
    const html = marked.parse(content);
    if (!html || html.trim().length === 0) {
      issues.push("Rendered HTML is empty");
    }
  } catch (e) {
    issues.push(`Markdown parse/render error: ${e.message}`);
  }

  // Check 3: Mermaid diagram syntax issues
  const mermaidBlocks = content.match(/```mermaid\n([\s\S]*?)```/g);
  if (mermaidBlocks) {
    mermaidBlocks.forEach((block, idx) => {
      const mermaidContent = block.replace(/```mermaid\n/, "").replace(/```$/, "");

      // Check for unescaped < characters that might be interpreted as HTML tags
      // Allow common mermaid patterns like "->" and "<-"
      // Use explicit character class to avoid overly permissive range
      // Match < that is not part of ->, <-, or HTML tag patterns
      // Avoid using negation character classes that are too broad
      const problematicLt = mermaidContent.match(/[a-zA-Z0-9_]\s*<\s*[0-9]/g);
      if (problematicLt) {
        problematicLt.forEach((match) => {
          // Check if it's a comparison operator that should be escaped
          if (match.match(/[^&]<[0-9]/)) {
            issues.push(
              `Unescaped < character in mermaid diagram (line ~${idx + 1}). Use &lt; instead of < for comparison operators`
            );
          }
        });
      }
    });
  }

  // Check 4: Check for malformed links
  const lines = content.split("\n");
  lines.forEach((line, idx) => {
    // Check for malformed markdown links
    const linkMatches = line.match(/\[([^\]]*)\]\(([^)]*)\)/g);
    if (linkMatches) {
      linkMatches.forEach((link) => {
        // Basic validation - link should have both text and URL
        if (!link.match(/\[([^\]]+)\]\(([^)]+)\)/)) {
          issues.push(`Malformed link at line ${idx + 1}: ${link.substring(0, 50)}`);
        }
      });
    }
  });

  return { file: relativePath, issues };
}

/**
 * Main validation function
 */
function main() {
  // Get staged markdown files from git
  let stagedFiles = [];
  try {
    const gitOutput = execSync("git diff --cached --name-only --diff-filter=ACM", {
      encoding: "utf-8",
    });
    stagedFiles = gitOutput
      .split("\n")
      .filter((file) => file.trim() && file.endsWith(".md"))
      .map((file) => path.resolve(process.cwd(), file))
      .filter((file) => fs.existsSync(file));
  } catch (e) {
    console.error(`${RED}Error getting staged files: ${e.message}${RESET}`);
    process.exit(1);
  }

  if (stagedFiles.length === 0) {
    console.log(`${GREEN}✓ No markdown files staged${RESET}`);
    return;
  }

  console.log(`\n${YELLOW}📝 Validating ${stagedFiles.length} markdown file(s)...${RESET}\n`);

  const results = [];
  for (const file of stagedFiles) {
    const result = validateMarkdownFile(file);
    results.push(result);
  }

  // Report results
  const filesWithIssues = results.filter((r) => r.issues.length > 0);
  const filesWithoutIssues = results.filter((r) => r.issues.length === 0);

  // Print results
  filesWithoutIssues.forEach(({ file }) => {
    console.log(`${GREEN}✓${RESET} ${file}`);
  });

  if (filesWithIssues.length > 0) {
    console.log("");
    filesWithIssues.forEach(({ file, issues }) => {
      console.log(`${RED}✗${RESET} ${file}`);
      issues.forEach((issue) => {
        console.log(`  ${RED}→${RESET} ${issue}`);
      });
    });
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log(`✓ Files without issues: ${filesWithoutIssues.length}`);
  console.log(`✗ Files with issues: ${filesWithIssues.length}`);

  if (filesWithIssues.length > 0) {
    console.log(`\n${RED}❌ Markdown validation failed${RESET}`);
    console.log(`${YELLOW}Please fix the issues above before committing.${RESET}\n`);
    process.exit(1);
  } else {
    console.log(`\n${GREEN}✅ All markdown files are valid${RESET}\n`);
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { validateMarkdownFile };
