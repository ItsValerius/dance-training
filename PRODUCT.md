# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Students (primary):** kids and teens in one dance club. They practise at home between lessons and use the app mostly on their phones. Their job is to find the videos their trainer assigned, watch them, and rehearse.
- **Trainers:** club trainers, all with the same permissions. They curate exercises from YouTube videos, sort them into categories, and assign them to individual students or to groups. They also manage the student and group lists.

## Product Purpose

The app gives each student one private place for the practice videos their trainer picked for them, so the links stop getting lost in chat groups. Success means:

- students come to class having practised the assigned material at home;
- a trainer can paste a YouTube link and assign it in under a minute;
- the app replaces video links scattered across WhatsApp groups;
- trainers can see which students checked an exercise off as done.

## Positioning

Assigned, not published: each student sees only what their trainer chose for them, either directly or through a group. The app is a closed space for one club, not a public video library or a general course platform.

## Operating Context

- One club. All trainers share the same students, groups, categories and exercises.
- Trainer accounts are created only with `pnpm create-trainer`. Student accounts are created only through an email invite (decided 2026-11-21): a trainer enters an email on `/trainer/schueler`, and the recipient picks name, username and password via a one-time link valid for 7 days. There is no public sign-up.
- Students sign in with their username or their contact email (decided 2026-11-21); an email shared by several accounts (siblings) asks for the username instead. A placeholder email `<username>@students.invalid` is stored only because better-auth requires one.
- A separate, non-unique contact email (`contact_email`) belongs to the student if they are old enough, otherwise to a parent; siblings can share it. It is used only for invites and "Passwort vergessen" reset links (valid 1 hour). Trainers can also set a new password by hand.
- Mail goes out over SMTP (nodemailer, `SMTP_URL` and `MAIL_FROM`). Without `SMTP_URL`, mails are only written to the server log.
- Exercises are YouTube videos, embedded through `youtube-nocookie.com`, each with a title, an optional description and exactly one category.
- The interface is in German (`lang="de"`). Routes use German slugs: `/anmelden`, `/trainer/uebungen`, `/trainer/gruppen`, `/trainer/kategorien`, `/trainer/schueler`.

## Capabilities and Constraints

- Built (student): home page grouped by category, open work first; each exercise is checked off with "Als erledigt markieren" and undone with "Rückgängig"; finished exercises fold into rows that can be reopened; videos load only on tap and keep playing when ticked; an "Alles geschafft!" state when everything is done.
- Built (trainer): CRUD for exercises, categories and groups; per-exercise progress (who checked it off); student management by email invite, contact email, manual password reset; assignment to a student or to a group (exactly one target per assignment row); a category that is still in use cannot be deleted.
- Built (accounts): invite-only sign-up, login with username or contact email, "Passwort vergessen" reset by mail, welcome mail with the username.
- Stack (existing): Next.js 16 App Router with Cache Components, better-auth (username and admin plugins), Drizzle with SQLite/libsql (Turso-ready), shadcn/ui on Base UI (restyled to the project design system, see DESIGN.md), Tailwind 4 via `@tailwindcss/postcss`, next-themes (light, dark and system), nodemailer over SMTP.
- Terms used in the app: Übung (exercise), Kategorie (category), Gruppe (group), Schüler (student), Trainer.
- Check-off (decided 2026-11-21): students mark an assigned exercise as done; it stays done until they uncheck it. Trainers see, per exercise, which reached students checked it off. Only the done flag and its timestamp are stored, not viewing time.

## Brand Commitments

- The product name is "Tanztraining" for now. It stays generic, with no club name, logo or dance style built in.
- Students are addressed with the informal "du".
- Standing style preference (confirmed 2026-11-21): conventional and clean, the familiar learning-app category standard executed at full craft, not an invented themed world. The craft bar is Duolingo: friendly, clear progress, made for young users.

## Evidence on Hand

- No real club content, logos, testimonials or usage data are in the repo. `scripts/seed-dev.mts` contains only development seed data. Do not invent a club identity, a student count or success stories.

## Product Principles

1. **The student's phone comes first.** The core moment is a kid at home with a phone, opening the next video. Optimise for that before anything else.
2. **Only what's assigned.** Students never see the whole catalogue, and nothing on the student side should feel like browsing a public platform.
3. **Trainer speed over trainer features.** Adding and assigning an exercise has to stay faster than sending a WhatsApp link, or trainers will go back to WhatsApp.
4. **Minors' data stays minimal.** Use usernames for login and privacy-enhanced embeds. The only personal contact data is one email per student (theirs or a parent's), used only for invites and password resets. Any future viewing tracking needs a deliberate decision about what is stored and who can see it.

## Accessibility & Inclusion

- The primary audience is children and teenagers. Use plain, short German copy that young readers understand, with no jargon.
- The phone is the main device: touch targets must be large enough, and videos must be easy to play full-screen.
