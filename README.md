# Machili Restaurant

Restaurant-facing web app for the Machili food delivery platform. Built with React, Vite, Tailwind CSS, and shadcn/ui.

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env and set VITE_API_URL to your API server URL

# Start development server
npm run dev
```

The app will be available at http://localhost:5173

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Run TypeScript type checking |

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | URL of the Machili API server | `http://localhost:3000` |

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** — build tool
- **Tailwind CSS v4** — styling
- **shadcn/ui** + **Radix UI** — component library
- **TanStack Query** — data fetching
- **React Hook Form** + **Zod** — forms and validation
- **Wouter** — routing
