# Royal Ride Booker

Royal Ride Booker is a React + Vite web application for a self-drive car hire business.
It is a public-facing booking site backed by Supabase: customers browse vehicles, pick
dates, and submit a booking. Booking and vehicle management is done directly in the
Supabase dashboard rather than through a separate admin app.

## Features

- Landing page with featured vehicles and booking guidance
- Vehicle listing page
- Vehicle detail page with date selection
- Booking form and booking confirmation flow
- Booking success and failure states

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Supabase
- Tailwind CSS
- Radix UI primitives
- Vitest

## Project Structure

```text
src/
  components/      shared UI and layout components
  config/          environment and contact config
  hooks/           app state and data hooks
  integrations/    Supabase client helpers
  lib/             utilities
  pages/           public booking screens
  repositories/    Supabase repository layer
  test/            test setup and tests
supabase/
  schema.sql       database schema
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and set values:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Both values are required — the app calls Supabase directly and has no offline/demo
fallback.

### 3. Start the development server

```bash
npm run dev
```

`.env` is ignored by git. Only `.env.example` should be committed.

## Available Scripts

- `npm run dev` starts the local Vite server
- `npm run build` creates a production build
- `npm run build:dev` builds using development mode
- `npm run preview` previews the production build locally
- `npm run test` runs the Vitest test suite
- `npm run test:watch` runs tests in watch mode
- `npm run lint` runs ESLint

## Supabase

The database schema lives in `supabase/schema.sql`. It includes:

- `vehicles` and `bookings` tables (customer details are inlined on `bookings`)
- an index for booking-by-vehicle lookups
- an `updated_at` trigger for bookings
- row-level security policies: the public can read available vehicles and create
  bookings; reading/updating bookings and managing vehicles is done via the Supabase
  dashboard using the service role

## Production Readiness Notes

- Supabase credentials must be configured — there is no mock/offline mode
- Payment handling is manual: customers are guided to confirm payment over WhatsApp/bank
  transfer after booking; there is no in-app payment processing

## Quality Checks

Current local verification commands:

```bash
npm run build
npm run test
npm run lint
```

## Deployment

For a static frontend deployment:

1. Set the required `VITE_` environment variables in your hosting platform.
2. Run `npm run build`.
3. Deploy the generated `dist/` folder.

Apply `supabase/schema.sql` to your Supabase project before deploying.

## Repository Notes

- Do not commit `.env`
- Do not commit `node_modules`
- Do not commit `dist`
- Commit `package-lock.json` so installs stay reproducible

## License

Add a project license here before publishing publicly.
