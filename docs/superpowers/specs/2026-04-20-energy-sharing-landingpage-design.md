# Energy Sharing Landingpage Chattengau — Design Spec

**Datum:** 2026-04-20
**Grundlage:** `implementation.md` im Projekt-Root (ausführliche Produktspec auf Deutsch)
**Dieses Dokument:** Technische Umsetzungsentscheidungen und Reihenfolge, die aus dem Brainstorming hervorgegangen sind. Ergänzt `implementation.md`, ersetzt sie nicht.

## Ziel

Statische Next.js 14 Landing Page für das Energy-Sharing-Pilotprojekt im Chattengau (Niedenstein, Edermünde, Gudensberg). Zweck: Interesse wecken, Konzept erklären, Warteliste aufbauen. Deploy auf eigenem Server des Nutzers.

## Scope-Abgrenzung

**Im Scope:**
- Single-Page-Landingpage mit 9 Sections gemäß `implementation.md`
- `/impressum` und `/datenschutz` als eigene Pages
- API Route `/api/waitlist` mit Resend-Mailversand und In-Memory-Rate-Limit
- OG-Image als statisches PNG

**Nicht im Scope:**
- Datenbank, User-Accounts, Analytics, Cookies, Tracking
- CMS — alle Inhalte hardcoded
- i18n — nur Deutsch
- Produktions-Hosting-Konfiguration (Server-Setup des Nutzers bleibt außen vor)

## Klärungen aus dem Brainstorming

1. **Platzhalter:** Kontakt-E-Mail und `RESEND_API_KEY` bleiben explizit als `[PLATZHALTER]` im Code sichtbar. README dokumentiert, wo ersetzt werden muss.
2. **Ortsteile-Dropdown:** Die Liste in der Spec (`Hausen, Osterberg, Quest, Wadenbrunn, Webercell`) ist fehlerhaft und wird entfernt. Stattdessen alle echten Chattengau-Ortsteile gruppiert als Optgroups + „Anderer Ort im EAM-Gebiet":
   - **Niedenstein:** Kernstadt, Metze, Wichdorf, Kirchberg, Ermetheis
   - **Edermünde:** Besse, Grifte, Haldorf, Holzhausen
   - **Gudensberg:** Kernstadt, Deute, Dissen, Dorla, Gleichen, Maden, Obervorschütz
   - Anderer Ort im EAM-Gebiet (Nordhessen)
3. **Rate-Limiting:** In-Memory Map (`ip → {count, resetAt}`). Akzeptiert, dass der Counter nach Server-Restart resettet. Nutzer deployt auf eigenem Server (single Node), daher zuverlässig genug.
4. **Energy-Flow-Animation:** Variante „simpel" — 2 Häuser + Netz als einfache SVG-Shapes, Sonne als Kreis, animierte Kreise entlang SVG-Pfaden als Partikel. Kein illustrativer Ausbau.

## Tech-Stack-Entscheidungen

- **Framework:** Next.js 14 App Router, TypeScript, Tailwind CSS
- **Animationen:** Framer Motion (`useInView` für Scroll-Einblendungen, `motion` für Hover/SVG)
- **Formulare:** React Hook Form + Zod; Zod-Schema in `lib/waitlist-schema.ts` wird clientseitig und in der API Route verwendet
- **E-Mail:** Resend SDK, einfacher Text-Body mit allen Formularfeldern
- **Ordnung:** `--src-dir=false` (Scaffold ohne `src/`), Alias `@/*`
- **Keine Tests** im Scope — Landing Page mit geringem Logik-Anteil, Validierung durch Zod abgedeckt

## Komponentenarchitektur

Dateistruktur gemäß `implementation.md` §Dateistruktur. Einige Ergänzungen:

- `lib/waitlist-schema.ts` — geteiltes Zod-Schema (Produzent + Verbraucher diskriminierte Union)
- `lib/rate-limit.ts` — In-Memory-Rate-Limiter, exportiert `check(ip): { ok: boolean, retryAfter?: number }`
- `lib/ortsteile.ts` — Konstanten für Dropdown-Gruppen

**UI-Bausteine unter `components/ui/`:**
- `EnergyFlowAnimation.tsx` — SVG mit `<animateMotion>` oder Framer-Motion-Pfadanimation
- `CounterAnimation.tsx` — Count-up-Zahl, startet wenn `useInView` triggert
- `Accordion.tsx` — headless, ein Item offen gleichzeitig
- `TabSwitcher.tsx` — kontrollierte Tabs, Deep-Link via `?role=producer|consumer` Hash-Parameter

**Section-Komponenten** unter `components/sections/` — je eine pro Section. Sie bleiben „dumm": keine eigene Datenquelle, nur Markup + Animationen.

## Datenfluss Warteliste

1. User wählt Tab, füllt Form aus, submittet
2. Client validiert via Zod; bei Fehler inline anzeigen
3. `POST /api/waitlist` mit JSON Body
4. API Route: Rate-Limit-Check (IP aus `x-forwarded-for` oder `request.ip`), Zod-Validierung (serverseitig erneut), Resend-Send an `[PLATZHALTER]`-Empfänger
5. Response: `{ success: true }` oder `{ success: false, error }`
6. Client ersetzt Formular durch Bestätigung (kein Redirect, Scroll-Position bleibt)

**E-Mail-Format:**
- Betreff: `Neue Wartelisten-Eintragung: [Produzent|Verbraucher] aus [Ortsteil]`
- Body: einfacher Text, alle Felder als `Label: Wert`-Zeilen

## Inhaltliche Leitplanken (aus `implementation.md` übernommen)

- Pilotprojekt-Charakter überall klar kommunizieren
- Keine Preis-/Termin-Versprechen außerhalb der genannten Rahmen (Juni 2026, 2027, 2028)
- Fachjargon vermeiden (kein „Bilanzierungsgebiet", kein „MaKo", kein „EDIFACT")
- Zielgruppe 45–70 Jahre → Body-Text mindestens 16px, bevorzugt 18px; großzügige Touch-Targets

## Implementierungsreihenfolge (Phasen)

**Phase 1 — Fundament (Review-Checkpoint)**
1. Next.js Projekt scaffolden + Dependencies
2. Design-Tokens (CSS Custom Properties, Tailwind-Konfig, Fonts, `next.config.ts` Unsplash-Whitelist)
3. `layout.tsx` mit Metadata/OpenGraph + statisches OG-PNG
4. `HeroSection`
→ Review mit Nutzer, Freigabe vor Phase 2

**Phase 2 — Content-Sections**
5. ExplainerSection + `EnergyFlowAnimation`
6. BenefitsSection
7. AustriaSection + `CounterAnimation`
8. HowItWorksSection
9. TimelineSection

**Phase 3 — Interaktive Teile**
10. `TabSwitcher` + `Accordion`
11. WaitlistSection mit beiden Formularen, Zod-Validierung, Tab-Deep-Link
12. API Route `/api/waitlist` mit Rate-Limit und Resend
13. FAQSection + Footer

**Phase 4 — Rechtliches + Polish**
14. `/impressum` + `/datenschutz`
15. Scroll-Animationen über alle Sections verteilen
16. Mobile- und A11y-Durchgang, Lighthouse-Check

## Offene Risiken

- **OG-Image:** Spec verlangt statisches 1200×630 PNG — das muss während der Implementierung mit einem einfachen Tool (z. B. `@vercel/og` oder handgezeichnet via Skript) erzeugt werden. Plan wird Variante wählen.
- **Unsplash-Bilder:** direkte URLs in `next/image` erfordern korrekte Hotlink-Nutzung. Während der Umsetzung konkrete URLs auswählen, die die Spec-Stimmung treffen.
- **Smart-Meter-Pflicht-Formulierung im FAQ:** Grenzwert „über 7 kWp seit 2025" stammt aus der Spec — faktisch korrekt gemäß MsbG, wird 1:1 übernommen.
