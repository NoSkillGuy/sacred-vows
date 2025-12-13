# Wedding Invitation Builder Platform

A full-featured wedding invitation builder platform that allows users to create, customize, and publish beautiful wedding invitations.

## Architecture

The platform consists of:

- **Builder App** (`apps/builder`) - React-based UI for creating invitations
- **API Server** (`apps/api`) - Express.js backend with authentication and data management
- **Template Engine** (`apps/builder/src/template-engine`) - Template rendering system
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

# API server
cd ../api
npm install
```

2. **Set up database:**

```bash
# Using Docker Compose
docker-compose up -d postgres

# Or set up PostgreSQL manually and update DATABASE_URL in apps/api/.env
```

3. **Configure environment:**

```bash
# Copy example env file
cp apps/api/.env.example apps/api/.env

# Edit apps/api/.env with your configuration
```

4. **Run database migrations:**

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev
```

5. **Start development servers:**

```bash
# Terminal 1: Start API server
cd apps/api
npm run dev

# Terminal 2: Start builder app
cd apps/builder
npm run dev

# Terminal 3: Start main invitation app (for preview)
npm run dev
```

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
│   └── api/              # Backend API server
│       ├── src/
│       │   ├── routes/      # API routes
│       │   ├── middleware/  # Express middleware
│       │   └── services/    # Business logic
│       └── package.json
├── apps/
│   ├── builder/
│   │   └── src/
│   │       ├── template-engine/  # Template rendering engine
│   │       └── shared/            # Shared utilities
│   └── api/
│       └── prisma/
│           └── schema.prisma      # Prisma schema
├── templates/
│   └── royal-elegance/   # Template definitions
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

### Template System

- Configurable template engine
- Dynamic template loading
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
2. Run migrations:
```bash
npx prisma migrate deploy
```

3. Deploy using Docker or platform-specific methods

### Database

Use a managed PostgreSQL service (Railway, Supabase, AWS RDS, etc.)

## Environment Variables

### API Server (.env)

```
DATABASE_URL=postgresql://user:password@localhost:5432/wedding_builder
JWT_SECRET=your-secret-key
PORT=3000
```

### Builder App (.env)

```
VITE_API_URL=http://localhost:3000/api
```

## License

ISC

