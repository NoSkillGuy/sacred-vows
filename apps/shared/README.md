# @wedding-builder/shared

Shared code package for the wedding invitation builder platform.

This package contains code shared between the builder (editing UI) and renderer (static site generator) applications.

## Contents

- **Layouts** (`src/layouts/`) - Layout definitions, components, and export functions
- **Types** (`src/types/`) - TypeScript type definitions
- **Theme** (`src/theme/`) - Theme utilities

## Usage

### In Builder

```typescript
import { getLayout } from "@wedding-builder/shared/layouts";
import type { InvitationData } from "@wedding-builder/shared/types";
```

### In Renderer

```typescript
import { getLayoutExport } from "@wedding-builder/shared/layouts";
import type { InvitationData } from "@wedding-builder/shared/types";
```

## Development

```bash
# Type check
pnpm run type-check

# Build (no-op, types only)
pnpm run build
```

## Structure

```
src/
├── layouts/          # Layout definitions
│   ├── classic-scroll/
│   ├── editorial-elegance/
│   └── registry.ts
├── types/            # TypeScript types
│   ├── layout.ts
│   └── wedding-data.ts
└── theme/            # Theme utilities
    └── applyTheme.ts
```

## Adding New Layouts

1. Create layout directory in `src/layouts/`
2. Implement layout components and export functions
3. Register layout in `src/layouts/registry.ts`
4. Export from `src/layouts/index.ts`

## License

Proprietary - Sacred Vows

