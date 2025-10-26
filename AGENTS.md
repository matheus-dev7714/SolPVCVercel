# Repository Guidelines

## Project Structure & Module Organization
- `app/` Next.js App Router pages, layouts, and API routes.
- `components/` Reusable React components (PascalCase filenames).
- `lib/` Client/server utilities and helpers (TypeScript modules).
- `hooks/` Reusable React hooks (prefixed `use*`).
- `prisma/` `schema.prisma`, `seed.ts`, and local `dev.db`.
- `programs/solpve/` Anchor (Solana) program in Rust.
- `public/` Static assets; `styles/` global styles (Tailwind CSS).
- `types/` Shared TypeScript types.
- `.env` from `.env.example` for local config.

## Build, Test, and Development Commands
- `npm run dev` Start Next.js dev server.
- `npm run build` Build the web app for production.
- `npm start` Run the built app.
- `npm run lint` ESLint via Next.js.
- `npm run db:generate` Generate Prisma client.
- `npm run db:migrate` Apply dev migrations; `npm run db:reset` reset DB.
- `npm run db:seed` Seed local data; `npm run db:studio` open Prisma Studio.
- Anchor (programs): `anchor build` compile, `anchor test` run program tests (when present).

## Coding Style & Naming Conventions
- TypeScript, 2‑space indent; prefer functional, typed components.
- Components: PascalCase (e.g., `components/PoolCard.tsx`). Hooks: `useSomething.ts`.
- Routes follow Next.js conventions (e.g., `app/api/pools/route.ts`).
- Keep utilities small and testable in `lib/`; export named functions.
- Run `npm run lint` before pushing; fix warnings.

## Testing Guidelines
- Frontend tests are not configured yet. If adding, co‑locate near code or under `__tests__/` and document the runner.
- Anchor tests use ts‑mocha per `Anchor.toml` (`tests/**/*.ts`); run with `anchor test`.
- Aim for meaningful coverage around pricing, pool lifecycle, and DB interactions.

## Commit & Pull Request Guidelines
- Prefer Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- PRs include: clear description, linked issues, screenshots (UI), DB migration notes, and rollout steps.
- For program changes: update `declare_id!` in `programs/solpve/src/lib.rs` and IDs in `Anchor.toml` after deploy; never commit private keys.

## Security & Configuration Tips
- Copy `.env.example` to `.env`; set `DATABASE_URL` and Solana RPCs safely.
- Localnet: use `solana-test-validator`; wallet path is set in `Anchor.toml`.
- Do not commit secrets or generated artifacts.
