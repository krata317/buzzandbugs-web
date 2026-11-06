# Buzz and Bugs — Web

The website for **Buzz and Bugs**, a developer community platform: discussions (Buzz), curated
technology news, trending open-source work and developer events.

This is a React + TypeScript single-page application that talks to the existing Fastify backend in
`../backend` over its REST API. It contains no server code and no deployment configuration.

---

## 1. What the site does

| Area | Implemented |
| --- | --- |
| Buzz | Feed with cursor pagination, post composer with a Tiptap editor, votes, reposts, nested replies, reporting, edit/delete for owners, local drafts |
| News | Editorial index of five sections plus per-section pages with "show more" |
| Trending | Repositories, models, datasets, papers, podcasts and videos, each with its own card layout |
| Events | Hackathons, coding contests and CTFs, split into ongoing and upcoming |
| Accounts | Email-OTP registration, sign in, password reset, sessions, account deletion and cancellation |
| Profiles | Public profiles, follow/unfollow, block/unblock, editable profile and avatar |
| Notifications | List, unread filter, mark read, mark all read, delete, unread badge |
| Settings | Theme, accent colour, section order, profile visibility, notification channels, sessions, account |
| Admin | Separate shell at `/admin` for overview, user lookup, moderation decisions, source health, jobs, audit log |
| Public | Landing page with live previews, public post and profile pages, appeal pages |

Features the backend does not expose are deliberately absent rather than faked — see
[section 10](#10-known-limitations).

---

## 2. Requirements

- **Node.js 20 or newer** (developed on Node 22) and npm 10+.
- The **backend running** on `http://localhost:4000`, with PostgreSQL up.
- No API keys are needed by the website itself.

The backend needs its own `.env`, database and `npm run dev` — see `../backend/README.md`.

---

## 3. Install

```bash
cd web
npm install
```

---

## 4. Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:4000/api/v1` | Base URL of the backend API, including the version prefix |

`VITE_` variables are compiled into the bundle at build time, so restart the dev server after
changing them.

### The port matters

The dev server is pinned to **port 3000** in `vite.config.ts` (`strictPort: true`). The backend
allowlists browser origins for CORS *and* rejects unsafe requests whose `Origin` header is not in
`WEB_ORIGINS`. The backend default is `http://localhost:3000`.

If you change the port, add the new origin to the backend `.env` and restart the API:

```dotenv
WEB_ORIGINS=http://localhost:3000,http://localhost:5173
```

Symptom of a mismatch: reads work but every `POST`/`PATCH`/`DELETE` fails with `403 Origin is not
allowed`, and the browser console reports a CORS error.

---

## 5. Run locally

Terminal 1 — backend API:

```bash
cd backend
npm run dev
```

Terminal 2 — backend worker (fills News/Trending/Events caches):

```bash
cd backend
npm run dev:worker
```

Terminal 3 — website:

```bash
cd web
npm run dev
```

Open <http://localhost:3000>.

---

## 6. Build, type check, lint and tests

```bash
npm run build      # tsc --noEmit && vite build  → dist/
npm run preview    # serve dist/ on http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run lint       # eslint .
npm test           # vitest run (unit tests for pure logic)
```

`npm test` covers the rich-text sanitiser, form validation and formatting helpers. It does not
require a browser or the backend.

---

## 7. How it is put together

```text
src/
├── main.tsx                 entry point, Router + StrictMode
├── App.tsx                  route table, providers, lazy page loading
├── styles/index.css         design tokens, base styles, component classes, editor styles
├── lib/
│   ├── api/                 client.ts (fetch, CSRF, errors) + one module per resource + types.ts
│   ├── richText.ts          Tiptap JSON → API document validation/normalisation
│   ├── format.ts            dates, counts, durations, text cleanup
│   ├── sections.ts          section labels, metadata helpers
│   ├── storage.ts           theme preference + composer drafts (localStorage)
│   └── validation.ts        form rules mirroring backend constraints
├── providers/               QueryProvider, AuthProvider, ThemeProvider, ToastProvider
├── features/                query keys + TanStack Query hooks per resource
├── hooks/                   document title, media query, click-outside, debounce, connection
├── components/
│   ├── ui/                  Button, form controls, overlays, feedback, nav, Avatar
│   ├── layout/              AppShell, Sidebar, TopBar, RightRail, PublicLayout, banners
│   ├── posts/               composer, editor, cards, votes, replies, dialogs
│   ├── external/            news, trending and event cards, section nav
│   ├── users/               follow button, user row
│   └── auth/                auth shell, OTP input, RequireAuth
└── pages/                   one folder per area, admin included
```

### Design tokens

All colours are CSS custom properties on `:root` and `.dark` in `src/styles/index.css`, exposed to
Tailwind as `canvas`, `surface`, `raised`, `line`, `ink`, `muted`, `subtle`, `accent`, `up`,
`down`, `danger`. Accent colours are switched with `data-accent` on `<html>`; the seven values match
the backend's `accentColor` enum exactly.

The theme is applied before React mounts by a small inline script in `index.html`, so there is no
flash of the wrong theme on reload.

### Authentication

Cookie-based, exactly as the backend defines it:

- `bnb_session` is HTTP-only; every request uses `credentials: 'include'`.
- `bnb_csrf` is readable and echoed in an `x-csrf-token` header on unsafe methods by
  `src/lib/api/client.ts`. No token is stored in `localStorage`.
- Admin requests use the separate `bnb_admin_session` / `bnb_admin_csrf` pair.
- A `401` on any user request clears the cached session through a window event; admin `401`s are
  scoped separately.

### Failure behaviour

- A connection banner appears when the API is unreachable, the browser is offline, or `/health`
  reports a degraded database.
- Loading, empty, error and permission states are distinct components, not one generic spinner.
- Writes are never retried automatically. Failed votes roll back optimistically; failed posts keep
  their draft in `localStorage`.
- Read queries retry twice with backoff only for network and 5xx errors.

---

## 8. Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Banner: "The API is unreachable" | Backend not running. `cd backend && npm run dev`. Check `curl http://localhost:4000/api/v1/health`. |
| `403 Origin is not allowed` on writes | The site is not served from an origin in the backend's `WEB_ORIGINS`. Use port 3000 or update the backend `.env`. |
| `403 Missing or invalid CSRF token` | The `bnb_csrf` cookie is missing or stale. Sign out and in again; confirm cookies are not blocked for `localhost`. |
| Signed in, but every request is `401` | Session expired or revoked (90-day limit, password change, or "sign out everywhere"). Sign in again. |
| News / Trending / Events are empty | The worker has not refreshed the caches. Start `npm run dev:worker` or force a refresh in `/admin/sources`. |
| YouTube section never appears | `YOUTUBE_API_KEY` is not set on the backend; the source fails and the empty section is hidden. |
| Saving an edit returns `503` | Post edits require `OPENAI_API_KEY` on the backend. This is backend behaviour, surfaced verbatim. |
| Nothing happens when registering | With `EMAIL_TRANSPORT=json` the backend does not deliver email. The OTP cannot be read from the API by design. Configure SMTP or use an existing account. |
| `EADDRINUSE :3000` | Another process holds the port. Stop it; the dev server will not fall back to another port on purpose. |
| Fonts look different | Google Fonts is unreachable; the system fallbacks in `tailwind.config.ts` are used. |

---

## 9. External resources

- **Fonts** — Inter, Instrument Serif and JetBrains Mono, loaded from Google Fonts (SIL Open Font
  License). The CSS falls back to system fonts if the request fails.
- **Icons** — [Lucide](https://lucide.dev) (ISC licence) via `lucide-react`.
- **Editor** — [Tiptap](https://tiptap.dev) 2.x (MIT) with only the extensions the backend accepts.
- **Data fetching** — [TanStack Query](https://tanstack.com/query) (MIT).
- **Styling** — [Tailwind CSS](https://tailwindcss.com) (MIT).
- **Component research** — [Uiverse](https://uiverse.io) and [shadcn/ui](https://ui.shadcn.com)
  were reviewed for interaction patterns (segmented controls, switches, menus, focus rings). The
  components here are original implementations built on the token system rather than vendored
  snippets, so no third-party component code is copied into the repository.

---

## 10. Known limitations

These follow from the backend, not from missing frontend work:

- **No "Following" feed filter.** `GET /feed` is one chronological feed with a boost for followed
  authors and exposes no filter parameter, so no such tab is shown.
- **No search.** There is no endpoint for searching posts or users, so no search UI exists.
- **No mention picker.** Mentions are resolved by user id and there is no user-search endpoint, so
  mentions are rendered when present but cannot be inserted from the composer.
- **Editing needs a backend key.** Without `OPENAI_API_KEY`, `PATCH /posts/:id` returns `503`; the
  UI shows the backend message.
- **No share/bookmark endpoints.** Sharing copies the canonical post URL or opens the Web Share API.
- **Reposts require a title.** The dialog collects one, because the API requires `title` with
  `repostOfId`.
- **Email delivery depends on SMTP.** With the default `EMAIL_TRANSPORT=json`, registration and
  password reset cannot be completed through the UI.
- **Feed counts include removed posts.** The profile `posts` counter comes from `_count.posts` on
  the backend, which counts soft-deleted rows too.

### Local test account

The verification run created one account directly in the local development database, because the
backend is configured with `EMAIL_TRANSPORT=json` and cannot deliver OTP codes:

```text
username: webtest
password: TestPassw0rd!
```

It exists only in your local `bnb` database. To remove it (this also removes its posts, votes and
sessions):

```bash
cd backend
node --input-type=module -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); await p.user.deleteMany({ where: { usernameLower: 'webtest' } }); await p.\$disconnect();"
```

---

## 11. Scope

This repository contains the website only. It deliberately includes no Dockerfiles, reverse-proxy
configuration, CI pipelines or hosting setup, and nothing here has been deployed.
