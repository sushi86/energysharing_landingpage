# Energy Sharing Landingpage Chattengau

Next.js 14 Landing Page für das Energy-Sharing-Pilotprojekt in Niedenstein / Chattengau (Nordhessen).

## Setup

```bash
pnpm install
cp .env.local.example .env.local
# Edit .env.local and replace all [PLATZHALTER] values
pnpm dev
```

## Platzhalter vor Deploy ersetzen

Vor dem Deploy müssen folgende Stellen angepasst werden:

- `.env.local` — `RESEND_API_KEY`, `WAITLIST_TO_EMAIL`, `WAITLIST_FROM_EMAIL`
- `app/impressum/page.tsx` — Kontakt-E-Mail
- `app/datenschutz/page.tsx` — Kontakt-E-Mail
- `components/sections/Footer.tsx` — Kontakt-E-Mail

Suche im Repo nach `[PLATZHALTER]`, um alle Stellen zu finden:

```bash
grep -rn "\[PLATZHALTER\]" app components
```

## Deploy

Für eigenen Node-Server:

```bash
pnpm build
pnpm start
```

Der In-Memory-Rate-Limiter setzt den Zähler nach jedem Server-Neustart zurück — das ist für diesen Use-Case akzeptabel.
