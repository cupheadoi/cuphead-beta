# CupHead v0.5 — Official education + problemset

This build extends the previous CupHead interface with a SQLite-backed content system, six-piece education progression, a compact Codeforces-style row-based problemset, complete problem editing, problem-submission moderation, problem education layers, normal accounts, contribution moderation, and role-aware control panels.

## Run locally

```bash
npm install
npm run dev
```

- Public site: `http://localhost:5173`
- Admin panel: `http://localhost:5173/admin`
- Production: `npm run build && npm start`

Node 22+ is recommended because the server uses the built-in `node:sqlite` module. The SQL schema is in `server/data/schema.sql`; the SQLite file is created at `server/data/cuphead.sqlite` on first run. The previous `database.json` is migrated automatically when no users exist in the SQLite file.

## Test accounts

- Headmaster: `admin` / `cuphead123`
- Admin: `headadmin` / `headadmin123`
- Sample normal user: `sampleuser` / `sample123`

Change these credentials before deployment.

## Public experience

- **Official Educations**: programming, algorithms, and theory roadmap with ♟ Pawn / ♞ Knight / ♝ Bishop / ♜ Rook / ♛ Queen / ♚ King progression.
- **Problemset**: compact Codeforces-style rows with search, source, Codeforces tags, source-dependent metadata filters, and solved-state filters. Problems are not assigned education pieces or a generic difficulty level.
- **Problem page**: source metadata, external link, bilingual statement switcher, collapsible راهنمایی ۱/۲/۳ panels, solutions, takeaways, sample test cases, author labels, solved checkbox, and a login-gated contribution modal.
- **Profile**: saved solved problems, uploaded or selected profile image, submitted contributions, and collaboration request flow. Registration requires email, first name, last name, and grade (7th–12th or graduate). Requests require Telegram ID, which is visible to the Headmaster for contact.
- **Scoreboard**: contributor-only XP table with separate columns for statements, hints, solutions, takeaways, and submitted problems. XP is snapshotted at acceptance, so later rate changes never rewrite previous totals.

## Roles

- **Headmaster / owner**: full control, including accounts, role upgrades/downgrades, roadmap, official library, moderation, XP rates, audit logs, and files. Only the Headmaster can delete content.
- **Admin / admin**: the panels enabled by the Headmaster, including official library, lessons, roadmap, and contribution moderation; their own add-ons publish immediately.
- **Reviewer**: sees lessons marked for review and can submit review tickets to the management team.
- **Problem review**: normal-user problem submissions have a separate queue. Admins choose the public URL identifier before accepting and publishing.
- **Normal / user**: learn, track progress, submit problem/content suggestions, and request collaboration.

## Database shape

The schema is deliberately normalized and expandable: users, lessons, roadmap modules, lesson practice items, problem sources, problems, bilingual statements, education records, collections, contributions, progress, contributor requests, reviewer tickets, reactions, audit logs, and files are all separate tables. Accepted contributions are copied into the official statement/education tables, keeping the moderation queue auditable.

## Branding

`public/icon.png` is used as the favicon and admin mark. `public/logotype.png` is used as the home link in the public header.
