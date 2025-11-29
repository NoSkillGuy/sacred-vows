# Wedding Invitation - React Application

A beautiful, modern wedding invitation PWA built with React and Vite.

## Features

- 🎨 Modern, responsive design
- 🌐 Multi-language support (English, Hindi, Telugu)
- 📱 Progressive Web App (PWA) with offline support
- 🎵 Background music
- 🎉 Celebration animations
- 📧 RSVP via WhatsApp integration
- 🗺️ Interactive venue map

## Development

### Prerequisites

- Node.js 18+ and npm

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
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
npm run build
```

2. Deploy the `dist` folder to your hosting provider

## Project Structure

```
wedding-invitation/
├── public/           # Static assets and service worker
├── src/
│   ├── components/  # React components
│   ├── hooks/       # Custom React hooks
│   ├── styles/      # CSS styles
│   └── utils/       # Utility functions
├── .github/
│   └── workflows/   # GitHub Actions workflows
└── dist/            # Build output (generated)
```

## Technologies

- React 18
- Vite
- Vite PWA Plugin
- CSS3 with CSS Variables

## License

ISC

