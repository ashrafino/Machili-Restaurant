# Machili Restaurant App

Restaurant-facing web dashboard for the Machili food delivery platform. Restaurant managers use this app to manage their menu, view incoming orders, and update order statuses.

Built with **React 19 + Vite + Tailwind CSS v4 + shadcn/ui**.

---

## Project Structure

```
machili-restaurant/
├── src/
│   ├── App.tsx                  # Root component, router setup
│   ├── main.tsx                 # Entry point — sets API base URL
│   ├── index.css                # Global styles (Tailwind)
│   ├── components/
│   │   └── ui/                  # shadcn/ui component library (55 components)
│   ├── hooks/
│   │   ├── use-mobile.tsx       # Responsive breakpoint hook
│   │   └── use-toast.ts         # Toast notification hook
│   ├── lib/
│   │   ├── utils.ts             # cn() utility (clsx + tailwind-merge)
│   │   └── api-client/          # Bundled API client (copied from shared lib)
│   │       ├── index.ts         # Re-exports everything
│   │       ├── custom-fetch.ts  # Fetch wrapper with auth + base URL support
│   │       ├── api.ts           # Generated React Query hooks for all endpoints
│   │       └── api.schemas.ts   # Generated TypeScript types for all API models
│   └── pages/
│       └── not-found.tsx        # 404 page
├── public/
│   └── favicon.svg
├── .env                         # Environment variables (committed — private repo)
├── .env.example                 # Template for environment variables
├── .gitignore
├── index.html                   # Vite HTML entry
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Environment Variables

Stored in `.env` (already configured for development):

| Variable | Description | Current Value |
|----------|-------------|---------------|
| `VITE_API_URL` | URL of the Machili API server | `http://localhost:3000` |

For production, update `VITE_API_URL` to your deployed API URL (e.g. `https://api.machili.com`).

---

## Local Development

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

App runs at **http://localhost:5173**

The API server must be running at the URL set in `VITE_API_URL`. See the [API Server repo](https://github.com/ashrafino/Machili-api-server) for setup instructions.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build for production → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Run TypeScript type checking |

---

## Deployment

### Netlify (recommended — `netlify.toml` included)

```bash
# Build command
npm run build

# Publish directory
dist
```

Set environment variable in Netlify dashboard:
- `VITE_API_URL` = `https://api.machili.com`

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set `VITE_API_URL` in Vercel project settings → Environment Variables.

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

```bash
docker build -t machili-restaurant .
docker run -p 80:80 machili-restaurant
```

---

## API Client

The `src/lib/api-client/` directory contains the full typed API client. It is auto-generated from the OpenAPI spec and bundled directly into this repo (no external workspace dependency).

Key exports:
- `setBaseUrl(url)` — call this at app startup with `VITE_API_URL`
- React Query hooks: `useListAdminOrders()`, `useGetAdminStats()`, etc.
- TypeScript types: `Order`, `Driver`, `AdminRestaurant`, etc.

To regenerate the client if the API changes, run the code generator against the OpenAPI spec in the API server repo and replace the files in `src/lib/api-client/`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build tool | Vite 7 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Radix UI |
| Data fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Routing | Wouter |
| Charts | Recharts |
| Animations | Framer Motion |

---

## Related Repos

| Repo | Description |
|------|-------------|
| [Machili-Admin](https://github.com/ashrafino/Machili-Admin) | Admin dashboard (platform management) |
| [Machili-Driver](https://github.com/ashrafino/Machili-Driver) | Driver web app |
| [Machili-app-React-Native](https://github.com/ashrafino/Machili-app-React-Native) | Customer mobile app (Expo) |
| API Server | Express + Supabase backend (private) |
