# Pre-Commit Hooks

This repository uses comprehensive pre-commit hooks to ensure code quality, security, and consistency before commits.

## What Runs on Commit

### 1. File Checks (`scripts/pre-commit-checks.sh`)

- **Blocked File Patterns**: Prevents committing `.env`, `*.key`, `node_modules/`, and other sensitive files
- **File Size Checks**:
  - Warns if files > 1MB
  - Blocks files > 10MB
- **Trailing Whitespace**: Automatically removes trailing whitespace
- **EOF Newlines**: Ensures files end with a newline
- **Secret Detection**: Basic pattern matching for common secrets (API keys, tokens, private keys)

### 2. Formatting & Linting (`lint-staged`)

**TypeScript/JavaScript:**
- **Prettier**: Auto-formats `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.md`, `.yml`, `.yaml`
- **ESLint**: Lints and auto-fixes TypeScript/JavaScript code

**Go:**
- **gofmt**: Formats Go code
- **go vet**: Basic static analysis

### 3. Fast Unit Tests

- **Go**: Runs `go test ./... -short` (only if Go files changed)
- **TypeScript**:
  - **Builder**: Runs `vitest --run` (only if builder TS/TSX files changed)
  - **Edge Worker**: Type checking via `tsc --noEmit` (only if edge-worker TS files changed)

### 4. Commit Message Linting

Enforces [Conventional Commits](https://www.conventionalcommits.org/) format:

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: formatting changes
refactor: code restructuring
perf: performance improvements
test: add tests
chore: maintenance tasks
```

## Manual Commands

### Format Code

```bash
# Format all code
npm run format

# Format specific app
npm run format:builder
npm run format:edge-worker
```

### Lint Code

```bash
# Lint all code
npm run lint

# Lint specific app
npm run lint:builder
npm run lint:edge-worker
npm run lint:go
```

### Check Dependencies

```bash
# Check for vulnerable dependencies
npm run deps:check
```

### Run Pre-Commit Checks Manually

```bash
npm run pre-commit
```

## Skipping Hooks

If you need to skip hooks (use sparingly):

```bash
git commit --no-verify -m "your message"
```

## Configuration Files

- `.lintstagedrc.json` - lint-staged configuration
- `.prettierrc.json` - Prettier formatting rules
- `.prettierignore` - Files to exclude from Prettier
- `.commitlintrc.json` - Commit message rules
- `apps/builder/.eslintrc.json` - ESLint config for builder
- `apps/edge-worker/.eslintrc.json` - ESLint config for edge-worker
- `apps/api-go/.golangci.yml` - golangci-lint config (optional, install separately)

## Optional: golangci-lint

For more comprehensive Go linting, install and use golangci-lint:

```bash
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
cd apps/api-go
golangci-lint run
```

The configuration file is already set up at `apps/api-go/.golangci.yml`.

## Troubleshooting

### Hook is too slow

The hooks are designed to be fast. If they're slow:
- Only changed files are processed
- Go tests run with `-short` flag
- TypeScript tests run with `--run` flag (non-watch mode)
- Type checking only runs on changed TypeScript files

### Hook fails but code looks fine

1. Run `npm run format` to auto-fix formatting
2. Run `npm run lint` to see linting errors
3. Check commit message format matches Conventional Commits

### Need to commit without hooks

Use `git commit --no-verify` (use sparingly and only when necessary).

