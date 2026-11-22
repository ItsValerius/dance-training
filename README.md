# Dance Training

Trainers create YouTube-based exercises as reusable building blocks and bundle them into **training plans** with a due date. A plan is assigned to students or groups and can be duplicated with a new due date (exercises and assignments are copied, progress starts fresh). Students see their current plan (the next one due, today or later) on `/`, past plans on `/verlauf`, and check exercises off per plan; trainers see per plan who has finished what.

Stack: Next.js 16 (App Router, Cache Components), better-auth (email/password + admin plugin), Drizzle + SQLite/libsql, shadcn/ui on Base UI, Tailwind 4 via `@tailwindcss/postcss` (`postcss.config.mjs`), nodemailer.

Product context lives in `PRODUCT.md`, the design system (tokens, components, motion) in `DESIGN.md`.

## Setup

```sh
pnpm install
cp .env.example .env        # fill BETTER_AUTH_SECRET (openssl rand -base64 32)
pnpm db:migrate
pnpm create-trainer <email> <password> "<Display Name>"
pnpm dev
```

## Roles

- **Trainer** = better-auth `admin` role. Created only via `pnpm create-trainer`.
- **Student** = default `user` role. Created only via email invite: a trainer sends it from `/trainer/schueler`, and the recipient picks name and password on `/einladung/<token>`. Public sign-up is disabled.

Everyone logs in with email + password. One account per email (`user.email` is unique), so siblings need separate addresses. The same address gets invites and "Passwort vergessen" mails (`/passwort-vergessen`).

All trainers share the same students, groups and exercises (one club).

## Mail

Set `SMTP_URL` (e.g. `smtps://user:pass@host:465`) and `MAIL_FROM` in `.env`. Without `SMTP_URL`, mails are printed to the server log in development; in production sending fails instead. `BETTER_AUTH_URL` must be the public URL, since links in mails are built from it.

## Database changes

Schema changes are versioned SQL migrations in `drizzle/`:

1. Edit `src/db/schema.ts`.
2. `pnpm db:generate`, then read the new `drizzle/*.sql`. Fix it by hand where data must survive (drizzle-kit drops and recreates; see `0001_training_plans.sql` for copying data across).
3. `pnpm db:migrate` to apply it locally, and commit the SQL with the code.

Production deploys on Vercel run `pnpm db:migrate` before `pnpm build` (`vercel.json`); preview deploys skip it. A failed migration fails the deploy, and the old version keeps running.

`0000_baseline` is the schema from before migrations, written with `IF NOT EXISTS`, so it is a no-op on databases created with `db:push`. `0001_training_plans` keeps exercises and their categories but empties `assignment` and `completion`: those now belong to a plan, so old assignments and done states are gone after the deploy. Rebuild them as plans.

A local database already at the current schema via `db:push` needs the migrations marked as applied once: copy the `__drizzle_migrations` rows from a fresh `DATABASE_URL=file:/tmp/x.db pnpm db:migrate`.

## Scripts

- `pnpm seed` — dev data on an empty database (trainer `coach@example.com`, students `mia@`, `leo@`, `ella@example.com`; password `password123`)
- `pnpm test` — unit tests (`node --test`)
- `pnpm db:generate` / `pnpm db:migrate` — create / apply schema migrations; `pnpm db:studio` — browse the database
- For Turso: set `DATABASE_URL=libsql://…` and `DATABASE_AUTH_TOKEN`.
