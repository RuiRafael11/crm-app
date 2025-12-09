# CRM Pro - Production Deployment

## Environment Setup

Create a `.env.production` file with:

```env
DATABASE_URL="file:./prod.db"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

For PostgreSQL:
```env
DATABASE_URL="postgresql://user:password@host:5432/crm_db"
```

## Build & Deploy

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma db push

# Seed initial data (optional)
npx prisma db seed

# Build for production
npm run build

# Start production server
npm start
```

## Database Migration

For production databases, use migrations:

```bash
npx prisma migrate deploy
```

## Features Included

- ✅ Full CRUD operations for all entities
- ✅ Multi-language support (EN/PT) with persistence
- ✅ Real-time search filtering
- ✅ Toast notifications for user feedback
- ✅ Error boundaries for graceful error handling
- ✅ Responsive design
- ✅ Premium dark-mode UI
