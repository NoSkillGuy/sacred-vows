# Wedding Invitation Builder Platform

A full-featured wedding invitation builder platform that allows users to create, customize, and publish beautiful wedding invitations.

## Architecture

The platform consists of:

- **Builder App** (`apps/builder`) - React-based UI for creating invitations
- **API Server** (`apps/api-go`) - Go backend with authentication and data management
- **Layout Engine** (`apps/builder/src/template-engine`) - Layout rendering system
- **Shared Types** (`apps/builder/src/shared`) - Shared type definitions and utilities

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (for production) or use Docker Compose
- npm or yarn

### Development Setup

1. **Install dependencies:**

```bash
# Root dependencies
npm install

# Builder app
cd apps/builder
npm install

# API server (Go)
cd ../api-go
go mod download
```

2. **Set up database:**

```bash
# Using Docker Compose
docker-compose up -d postgres

# Or set up PostgreSQL manually and update DATABASE_URL in apps/api-go/.env
```

3. **Configure environment:**

```bash
# Copy example env file
cp apps/api-go/.env.example apps/api-go/.env

# Edit apps/api-go/.env with your configuration
```

4. **Start development servers:**

```bash
# Terminal 1: Start API server (Go)
cd apps/api-go
go run cmd/server/main.go

# Terminal 2: Start builder app
cd apps/builder
npm run dev

# Terminal 3: Start main invitation app (for preview)
npm run dev
```

**Note**: The Go API automatically runs database migrations on startup using GORM AutoMigrate.

## Project Structure

```
wedding-invitation-builder/
├── apps/
│   ├── builder/          # Builder UI application
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   ├── services/    # API services
│   │   │   └── store/      # Zustand state management
│   │   └── package.json
│   └── api-go/           # Backend API server (Go)
│       ├── cmd/server/   # Application entry point
│       ├── internal/     # Internal packages
│       └── migrations/   # Database migrations
├── apps/
│   ├── builder/
│   │   └── src/
│   │       ├── template-engine/  # Layout rendering engine
│   │       └── shared/            # Shared utilities
├── layouts/
│   └── royal-elegance/   # Layout definitions
└── docker-compose.yml    # Docker setup
```

## Features

### Builder UI

- Split-pane layout with form controls and live preview
- Form components for editing:
  - Couple information
  - Wedding details and venue
  - Events and schedule
  - Gallery images
  - RSVP configuration
  - Theme customization
  - Translations

### Backend API

- User authentication (JWT)
- Invitation CRUD operations
- Asset management
- RSVP tracking
- Analytics

### Layout System

- Configurable layout engine
- Dynamic layout loading
- User data merging

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Invitations
- `GET /api/invitations` - List user's invitations
- `POST /api/invitations` - Create new invitation
- `GET /api/invitations/:id` - Get invitation
- `PUT /api/invitations/:id` - Update invitation
- `DELETE /api/invitations/:id` - Delete invitation
- `GET /api/invitations/:id/preview` - Get preview data

### Assets
- `POST /api/assets/upload` - Upload image
- `GET /api/assets` - List assets
- `DELETE /api/assets/delete` - Delete asset

### RSVP
- `POST /api/rsvp/:invitationId` - Submit RSVP
- `GET /api/rsvp/:invitationId` - Get RSVP responses

### Analytics
- `POST /api/analytics/view` - Track view
- `GET /api/analytics/:invitationId` - Get analytics

## Deployment

### Builder App (Vercel/Netlify)

1. Build the app:
```bash
cd apps/builder
npm run build
```

2. Deploy the `dist` folder to Vercel or Netlify

### API Server (Railway/Render/AWS)

1. Set environment variables
2. Build and deploy:
```bash
cd apps/api-go
go build -o bin/server cmd/server/main.go
```

3. Deploy using Docker or platform-specific methods. The API automatically runs migrations on startup.

### Database

Use a managed PostgreSQL service (Railway, Supabase, AWS RDS, etc.)

## Environment Variables

### API Server (apps/api-go/.env)

```
DATABASE_URL=postgresql://user:password@localhost:5432/wedding_builder
JWT_SECRET=your-secret-key
PORT=3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
UPLOAD_PATH=./uploads
LAYOUTS_DIR=./layouts
```

### Builder App (.env)

```
VITE_API_URL=http://localhost:3000/api
```

## License

ISC

