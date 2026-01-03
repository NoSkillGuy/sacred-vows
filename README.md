# Sacred Vows

A modern wedding invitation builder platform that enables users to create, customize, and publish beautiful wedding invitations. Built as a monorepo with a React/Vite frontend, Go backend API, and Cloudflare Workers edge service.

## Features

- 🎨 Modern, responsive design system
- 🏗️ Drag-and-drop invitation builder
- 🌐 Multi-language support
- 📱 Progressive Web App (PWA) with offline support
- 🔐 Secure authentication system
- ☁️ Cloud-based asset storage and CDN delivery
- 📊 Analytics and tracking
- 🚀 Fast edge deployment via Cloudflare

## Development

### Prerequisites

- Node.js 20.19.0+ and pnpm 10.24.0+

### Setup

1. Install pnpm (if not already installed):
```bash
npm install -g pnpm@10.24.0
```

2. Install dependencies:
```bash
pnpm install
```

3. Start development server:
```bash
pnpm run dev
```

4. Build for production:
```bash
pnpm run build
```

5. Preview production build:
```bash
pnpm run preview
```

## Deployment

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages via GitHub Actions.

1. **Enable GitHub Pages:**
   - Go to your repository Settings → Pages
   - Under "Source", select "GitHub Actions"

2. **Push to main/master branch:**
   - The workflow will automatically build and deploy on push to main/master
   - You can also trigger it manually from the Actions tab

3. **Custom Domain (Optional):**
   - Add a `CNAME` file in the `public` directory with your domain name
   - Configure DNS settings as per GitHub Pages documentation

### Manual Deployment

1. Build the project:
```bash
pnpm run build
```

2. Deploy the `dist` folder to your hosting provider

## Project Structure

This is a monorepo containing multiple applications:

```
sacred-vows/
├── apps/
│   ├── builder/          # React/Vite frontend builder application
│   ├── api-go/           # Go backend API server
│   └── edge-worker/      # Cloudflare Workers edge service
├── docs/                 # Comprehensive project documentation
├── infra/                # Terraform infrastructure as code
├── docker/               # Docker configurations
└── scripts/              # Utility scripts
```

## Technologies

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Go (Golang)
- **Edge**: Cloudflare Workers
- **Infrastructure**: Terraform, Docker
- **Storage**: Cloudflare R2, Firestore

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory. Start with the [Getting Started Guide](./docs/getting-started/README.md).

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

ISC - See [LICENSE](./LICENSE) file for details.

## Test Section

This is a test change for testing inline comments via GitHub MCP server.

