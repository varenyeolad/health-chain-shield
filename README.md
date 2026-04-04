# MedChain Frontend + Backend Workspace

Monorepo for MedChain demo platform:
- `src/` — React frontend
- `backend/` — NestJS gateway backend

## Frontend (Vite)

```bash
npm install
npm run dev
```

### Connect frontend to backend

Create `.env.local` at repo root:

```env
VITE_USE_BACKEND=true
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

If `VITE_USE_BACKEND` is not `true`, the app uses mock gateway mode.

## Backend (NestJS)

```bash
cd backend
npm install
npm run start
```

See `backend/.env.example` for backend env vars.

## Notes

- This repository is configured for MedChain branding (no Lovable branding metadata).
- Docker stack for backend dependencies is available at `backend/docker/docker-compose.yml`.
