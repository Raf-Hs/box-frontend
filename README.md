# Daily Tracker -- Frontend

Angular 19 single-page application for tracking daily habits.

## Technology Stack

- **Framework:** Angular 19 (standalone components)
- **Build:** `@angular/build` (esbuild-based)
- **State:** Angular signals
- **HTTP:** `HttpClient` with RxJS observables
- **Routing:** Angular Router with lazy-loaded feature modules

## Prerequisites

- Node.js 20+ and npm 10+
- Angular CLI 19+ (`npm install -g @angular/cli`)

## Getting Started

```bash
npm install
ng serve
```

The app runs at `http://localhost:4200`.

## Configuration

The API base URL is configured per environment:

| File | Environment | Default API URL |
|------|-------------|-----------------|
| `src/environments/environment.ts` | Development | `http://localhost:5000/api` |
| `src/environments/environment.prod.ts` | Production | `https://box-backend-um5d.onrender.com/api` |

Angular's build system automatically selects the correct file based on the active build configuration. Production builds (`ng build` with no `--configuration` flag) use `environment.prod.ts`.

To point at a different backend, edit the `apiBaseUrl` value in the appropriate environment file.

## Build

```bash
# Development build (unminified, source maps)
ng build --configuration development

# Production build (minified, tree-shaken)
ng build
```

Output goes to `dist/daily-tracker-frontend/`.

## Project Structure

```
src/
  app/
    core/           # Shared services (HabitService)
    features/
      dashboard/    # Daily progress view
      habits/       # Target configuration
      history/      # Date range viewer
    models/         # TypeScript interfaces
  environments/     # Build-time environment config
```

## Deployment

### Vercel

1. Import the repository into Vercel.
2. Set **Root Directory** to `frontend` (if the repo root contains both frontend and backend).
3. Vercel auto-detects Angular and runs `npm run build`.
4. The build output directory is `dist/daily-tracker-frontend`.

No environment variables are required -- the production API URL is compiled into the build via Angular's `fileReplacements`.

## Development Workflow

- `main` -- production-ready code
- `develop` -- integration branch
- `feature/<name>` -- individual features
