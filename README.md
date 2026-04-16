# Royal Ride Booker

Royal Ride Booker is a React + Vite web application for a self-drive car hire business. It includes a public booking flow for customers and a protected admin area for managing vehicles, bookings, customers, and payments.

## Overview

The app is built to support two data modes:

- `mock` mode for local/demo use
- `supabase` mode for live backend integration

By default, the application safely falls back to mock data unless valid Supabase environment variables are present and `VITE_USE_MOCK_DATA=false`.

## Features

### Public experience

- Landing page with featured vehicles and booking guidance
- Vehicle listing page
- Vehicle detail page with date selection
- Booking form and booking confirmation flow
- Booking success and failure states

### Admin area

- Admin login route
- Protected admin routes
- Dashboard summary
- Vehicle management
- Booking management
- Customer management
- Payment management

### Data layer

- Repository abstraction for swapping data sources
- Mock repository for development and demos
- Supabase repository foundation for production migration
- Starter Supabase schema in `supabase/schema.sql`

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
  data/            mock data
  hooks/           app state and data hooks
  integrations/    Supabase client helpers
  lib/             utilities
  pages/           public and admin screens
  repositories/    mock/supabase repository layer
  test/            test setup and tests
supabase/
  schema.sql       starter schema
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and set values as needed:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_USE_MOCK_DATA=true
```

### 3. Start the development server

```bash
npm run dev
```

## Environment Behavior

The app decides its data source using:

- `VITE_USE_MOCK_DATA`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Behavior summary:

- If `VITE_USE_MOCK_DATA=true`, the app uses mock data
- If `VITE_USE_MOCK_DATA=false` and Supabase values are present, the app uses Supabase
- If Supabase values are missing, the app falls back to mock data

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

The initial database schema lives in `supabase/schema.sql`.

It includes starter tables for:

- vehicles
- customers
- bookings
- payments

It also includes:

- indexes for common lookups
- an `updated_at` trigger for bookings
- starter row-level security policies

## Production Readiness Notes

This project is in a solid demo/dev state and has a clear backend migration path, but a few areas still depend on your deployment setup:

- Supabase credentials must be configured for live data mode
- Admin authentication should be reviewed for your production auth model
- Payment handling is structured in the UI and data model, but operational payment workflows should be validated before launch

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

If you are deploying with live Supabase data, make sure your database schema, policies, and environment values are in place first.

## Repository Notes

- Do not commit `.env`
- Do not commit `node_modules`
- Do not commit `dist`
- Commit `package-lock.json` so installs stay reproducible

## License

Add a project license here before publishing publicly.
