# BOX -- Health

Angular 19 frontend for BOX, a personal life-tracking application. The current
life area is **Health**, with habits for sleep, food, water, walking, sun
exposure, and standing breaks.

## Technology Stack

- **Framework:** Angular 19 (standalone components)
- **Build:** `@angular/build` (esbuild-based)
- **State:** Angular signals
- **HTTP:** `HttpClient` with RxJS observables
- **Routing:** Angular Router with lazy-loaded feature modules
- **Testing:** Karma + Jasmine
- **Theming:** CSS custom properties with `data-theme` and `localStorage`

## Prerequisites

- Node.js 20+ and npm 10+
- Angular CLI 19+ (`npm install -g @angular/cli`)

## Getting Started

```bash
npm install
ng serve
```

The app runs at `http://localhost:4200`. `ng serve` uses the development
environment, which points at a locally running backend on port `5000`.

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
    core/
      area.config.ts     # Life-area definitions (Health accent palette)
      theme.service.ts   # Light/dark theme with localStorage persistence
      date.utils.ts      # Local-calendar date helpers (no UTC drift)
      habit.service.ts   # API client for habits and daily entries
    features/
      dashboard/         # Daily progress view for the selected date
      habits/            # Habit target configuration
      history/           # Historical data by date range
    models/              # TypeScript interfaces
  environments/           # Build-time environment config (dev and prod)
  styles.css              # Design tokens, shared components, animations
```

## Theming and life areas

Design tokens live in `src/styles.css`. Health uses a light-green accent
(`--color-primary: #84CC16`). Themes are switched with the nav toggle; the
preference is stored in `localStorage` under `box-theme`, falling back to
`prefers-color-scheme` on a first visit.

Life areas are defined in `src/app/core/area.config.ts`. Registering a new
area means adding an entry there -- no component changes are required.

## Testing

```bash
# Single run (Chrome headless, exits when complete)
npx ng test --watch=false

# Watch mode
ng test
```

Tests use Karma + Jasmine via the `@angular/build:karma` builder. Chrome must
be installed locally; `karma-chrome-launcher` uses the system Chrome.

## Known limitation: tracked versus untracked days

`GET /api/daily-entries/history` returns **every active habit for every day**
in the requested range, using `0` when no entry exists. The response therefore
cannot distinguish between:

- a habit that was explicitly recorded as `0`,
- a habit that simply was never recorded that day.

Any future analytics built on this endpoint (completion rates, streaks,
consistency, trend charts) **must not silently treat a zero as an untracked or
failed day.** Doing so would report low accuracy for days the user never
tracked and would inflate "missed habit" counts.

A backend change is required to resolve this, for example returning only
recorded entries and adding an explicit `wasTracked` (or recorded-at) field, or
adding a separate endpoint for tracked-day counts. That change is intentionally
deferred to its own task; no API contract or schema is altered by the current
frontend work.

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
