# Dance Training

Trainers create YouTube-based exercises and assign them to students or groups. Students see only what's assigned to them (directly or via a group), check exercises off as done, and trainers see per exercise who has finished it.

Stack: Next.js 16 (App Router, Cache Components), better-auth (username + admin plugins), Drizzle + SQLite/libsql, shadcn/ui on Base UI, Tailwind 4 via `@tailwindcss/postcss` (`postcss.config.mjs`), nodemailer.

Product context lives in `PRODUCT.md`, the design system (tokens, components, motion) in `DESIGN.md`.

## Setup

```sh
pnpm install
cp .env.example .env        # fill BETTER_AUTH_SECRET (openssl rand -base64 32)
pnpm db:push
pnpm create-trainer <username> <password> "<Display Name>" <email>
pnpm dev
```

## Roles

- **Trainer** = better-auth `admin` role. Created only via `pnpm create-trainer`.
- **Student** = default `user` role. Created only via email invite: a trainer sends it from `/trainer/schueler`, and the recipient picks name, username and password on `/einladung/<token>`. Public sign-up is disabled.

Students log in with a username or their contact email (if exactly one account uses it); better-auth still requires an email, so a placeholder `<username>@students.invalid` is stored. The real address (student or parent; siblings may share it) lives in `user.contact_email` and is used for invites and "Passwort vergessen" (`/passwort-vergessen`).

All trainers share the same students, groups and exercises (one club).

## Mail

Set `SMTP_URL` (e.g. `smtps://user:pass@host:465`) and `MAIL_FROM` in `.env`. Without `SMTP_URL`, mails are printed to the server log. `BETTER_AUTH_URL` must be the public URL, since links in mails are built from it.

## Database changes

`pnpm db:push` syncs the schema. On an existing database, add the contact email column first if it is missing, since drizzle-kit tries to rebuild the `user` table and fails:

```sh
sqlite3 local.db "alter table user add column contact_email text;"   # or the same SQL on Turso
```

## Scripts

- `pnpm seed` — dev data on an empty database (trainer `coach`, students `mia`, `leo`, `ella`; password `password123`)
- `pnpm test` — unit tests (`node --test`)
- `pnpm db:push` / `pnpm db:studio` — Drizzle schema sync / browser
- For Turso: set `DATABASE_URL=libsql://…` and `DATABASE_AUTH_TOKEN`.
