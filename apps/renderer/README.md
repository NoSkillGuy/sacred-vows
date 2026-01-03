# @wedding-builder/renderer

Static site generator for wedding invitations using Vite SSR.

## Purpose

This package generates static HTML/CSS/JS from React components for published wedding invitations. It uses Vite's SSR capabilities to render React components to static markup.

## Usage

### Build

```bash
# Build SSR bundle
pnpm run build:ssr

# Build client assets (if needed)
pnpm run build:client

# Build both
pnpm run build
```

### Render (CLI)

```bash
# Render from JSON input
echo '{"invitation":{"layoutId":"classic-scroll","data":{}}}' | \
  node dist-ssr/render.js --mode=bundle
```

### Integration with Go Backend

The renderer is invoked by the Go backend via `exec.Command`:

```go
cmd := exec.CommandContext(ctx, "node", "dist-ssr/render.js", "--mode=bundle")
cmd.Stdin = bytes.NewReader(stdinJSON)
```

**Input (stdin JSON):**
```json
{
  "invitation": {
    "layoutId": "classic-scroll",
    "data": { ... }
  },
  "translations": {}
}
```

**Output (stdout JSON):**
```json
{
  "html": "<!DOCTYPE html>...",
  "css": "/* styles */",
  "manifest": { ... },
  "assets": []
}
```

## Architecture

- **entry-server.tsx** - SSR entry point with render function
- **render.ts** - CLI tool for Go backend integration
- **entry-client.tsx** - Placeholder for future client hydration

## Dependencies

- `@wedding-builder/shared` - Shared layouts, types, and components
- `react` / `react-dom` - React SSR
- `vite` - Build tooling

## Development

```bash
# Type check
pnpm run type-check

# Build
pnpm run build
```

## License

Proprietary - Sacred Vows

