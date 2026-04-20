# Energy Sharing Landingpage Chattengau

Next.js Landing Page für das Energy-Sharing-Pilotprojekt in Niedenstein / Chattengau (Nordhessen).

## Setup

```bash
pnpm install
cp .env.local.example .env.local
# .env.local öffnen und alle [PLATZHALTER] ersetzen
pnpm dev
```

## Environment-Variablen

| Variable               | Zweck                                                                      |
| ---------------------- | -------------------------------------------------------------------------- |
| `RESEND_API_KEY`       | API-Key für [Resend](https://resend.com) (Mailversand)                     |
| `WAITLIST_FROM_EMAIL`  | Absender-Adresse (muss in Resend als Domain verifiziert sein)              |
| `WAITLIST_TO_EMAIL`    | Empfänger für die Wartelisten-Benachrichtigungen                           |
| `NEXT_PUBLIC_SITE_URL` | Optional — absolute Basis-URL für Bestätigungslinks (z. B. beim Deployen) |

## Wartelisten-Flow (Double-Opt-In)

1. User füllt Formular aus → `POST /api/waitlist`
2. Server validiert (Zod), rate-limit (3/Std/IP), legt Token in In-Memory-Store (24 h TTL) ab
3. User bekommt Bestätigungsmail mit Link `/warteliste/bestaetigen?token=…`
4. Klickt User den Link → Server schickt Benachrichtigung an `WAITLIST_TO_EMAIL`
5. Nicht bestätigte Eintragungen verfallen nach 24 h automatisch

Konsequenz: Bei Server-Neustart gehen noch nicht bestätigte Tokens verloren. Für ein Pilotstadium auf einem Single-Node-Setup akzeptabel.

## Platzhalter vor Deploy ersetzen

```bash
grep -rn "kontakt@beispiel.de\|\[PLATZHALTER\]" app components .env.local.example
```

Zu ersetzen:

- `.env.local` — alle `[PLATZHALTER]`
- `app/impressum/page.tsx` — Kontakt-E-Mail
- `app/datenschutz/page.tsx` — Kontakt-E-Mail (2×)
- `components/sections/Footer.tsx` — Kontakt-E-Mail

## Assets

- **OG-Image**: wird von `app/opengraph-image.tsx` zur Build-Zeit als PNG generiert (1200×630). Anpassen = dort editieren.
- **Favicon**: `app/icon.svg` (Solar-Haus-Logo). Browser rendern das SVG direkt.
- **Hero-Bild**: `public/hero.jpg` (Chattengau-Landschaft).
- **Österreich-Bild**: `public/austria.png`.

## Deploy

```bash
pnpm build
pnpm start
```

Für die Benachrichtigungs-Mails muss die Absender-Domain in Resend verifiziert sein. Der In-Memory-Rate-Limiter und der In-Memory-Token-Store setzen sich bei jedem Server-Neustart zurück — für dieses Pilot-Setup gewollt.

## Tech Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 (`@theme` Tokens in `app/globals.css`)
- Framer Motion (Section-Reveals, Counter, Accordion, Energy-Flow-SVG)
- react-hook-form + Zod (`@hookform/resolvers`) für Formulare
- Resend SDK für Transactional Mail
