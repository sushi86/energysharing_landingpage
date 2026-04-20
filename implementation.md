Baue eine Next.js Landing Page für ein Energy Sharing Pilotprojekt 
in Niedenstein (Nordhessen, Deutschland).

## Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS
- Framer Motion für Animationen
- TypeScript
- Keine Datenbank nötig — Warteliste per Formular an eine API Route 
  die die Daten per Resend (resend.com) als E-Mail weiterleitet

## Zielgruppe
Einwohner des Chattengau — bestehend aus drei Städten 
und ihren Ortsteilen im Schwalm-Eder-Kreis (Nordhessen):

Niedenstein (Kernstadt) mit Ortsteilen:
  Metze, Wichdorf, Kirchberg, Ermetheis

Edermünde mit Ortsteilen:
  Besse, Grifte, Haldorf, Holzhausen

Gudensberg mit Ortsteilen:
  Deute, Dissen, Dorla, Gleichen, Maden, Obervorschütz

Alle drei Städte liegen im EAM-Netzgebiet.
Niedenstein ist der Startpunkt des Pilotprojekts,
Edermünde und Gudensberg werden frühzeitig eingebunden 
da das interkommunale Windparkprojekt Langenberge 
alle drei Städte verbindet.

Auch für andere Orte im EAM-Netzgebiet (Nordhessen) 
offen — Chattengau ist der Fokus.

Altersdurchschnitt: 45-70 Jahre.
Sprache: einfach, keine Fachbegriffe, warm und regional.

## Tonalität
- Warm, nahbar, bodenständig — keine Startup-Sprache
- Klar kommunizieren: das ist ein PILOTPROJEKT, es gibt 
  noch nichts zu kaufen oder buchen
- Ziel der Seite: Interesse wecken, Warteliste aufbauen, 
  Konzept erklären

## Seitenstruktur (Sections in dieser Reihenfolge)

### 1. Hero Section
- Headline: simpel und emotional — zwei Perspektiven 
  gleichzeitig ansprechen, z.B.:
  "Sonnenstrom aus der Nachbarschaft."
  oder: "Dein Strom. Dein Ort. Deine Nachbarn."
  oder: "Solarstrom teilen — alle profitieren."
  — du darfst kreativ sein, aber BEIDE Gruppen 
  müssen sich sofort angesprochen fühlen

- Subheadline (zwei Zeilen, klar getrennt):
  "Wer eine Solaranlage hat: verdiene mehr als 
   mit normaler Einspeisung."
  "Wer keine Solaranlage hat: kaufe günstigeren 
   Strom direkt aus der Nachbarschaft."

- Oder alternativ als zwei kurze Bullet Points 
  mit Icons direkt unter der Headline:
  ☀️ Mit PV-Anlage → mehr Erlös als bisher
  ⚡ Ohne PV-Anlage → günstiger Strom vom Nachbarn

- Wichtig: es muss auf den ERSTEN BLICK klar sein
  dass BEIDE Gruppen willkommen sind —
  nicht nur PV-Besitzer. Viele werden denken 
  "das ist nichts für mich weil ich keine 
  Solaranlage habe" — diesen Gedanken 
  aktiv entkräften.

- Zwei gleichwertige CTAs nebeneinander 
  (keiner darf dominanter wirken als der andere):
  Primär (grün):   "Ich habe eine Solaranlage →"
  Sekundär (auch grün, anderer Ton): 
                   "Ich möchte günstigeren Strom →"
  Beide scrollen zum Wartelisten-Formular 
  und öffnen direkt den richtigen Tab.

- Kleiner Hinweistext unter den CTAs:
  "Keine Kündigung deines Stromvertrags nötig — 
   Energy Sharing kommt einfach dazu."

- Hintergrundbild: idyllisches Nordhessen/Chattengau-Dorfbild
  mit Solaranlagen auf Dächern sichtbar wenn möglich
  (Unsplash: "german village aerial solar" oder 
  "Hessen Dorf" oder "small town germany rooftop")
  Leichter dunkler Overlay damit Text lesbar bleibt

- Animierter Badge oben links oder oben mittig:
  pulsierender grüner Punkt + "Pilotprojekt Chattengau · 2026"

### 2. "Was ist Energy Sharing?" — Erklärsection
- Sehr bildlich, sehr einfach — als würde man es einem 
  70-jährigen erklären
- Animiertes Schaubild (Framer Motion SVG-Animation):
  Haus mit Solarpanel → Sonne scheint → Strom fließt 
  als animierte Partikel → zu Nachbarshaus → zum Netz
- Drei einfache Schritte mit großen Icons:
  1. Deine Anlage produziert mehr als du brauchst
  2. Dein Überschuss fließt zu Nachbarn im Ort
  3. Beide profitieren — du verdienst mehr, 
     Nachbar zahlt weniger
- Wichtiger Hinweis-Box: "Dein bisheriger Stromvertrag 
  bleibt — du musst nichts kündigen oder wechseln"

### 3. Vorteile — zwei Spalten (Produzent / Verbraucher)
- Linke Karte (gelb/orange Akzent): "Du hast eine Solaranlage"
  - Mehr Erlös als EEG-Einspeisung (aktuell nur ~7,8 Cent/kWh)
  - Dein Strom bleibt im Ort statt anonym ins Netz
  - Kein Aufwand — Plattform übernimmt die Abrechnung
  - Flexibel: du bestimmst den Preis selbst
- Rechte Karte (grün Akzent): "Du möchtest günstigeren Strom"
  - Günstiger als normaler Netzstrom
  - Strom aus der Nachbarschaft — regional und erneuerbar
  - Dein Stromvertrag bleibt bestehen
  - Auch ohne eigene Solaranlage dabei sein
- Auf Mobile: übereinander gestapelt

### 4. Blick nach Österreich
- Section Titel: "In Österreich klappt es längst"
- Einleitungstext: Österreich hat dasselbe Konzept 2021 
  eingeführt. Heute ist es dort gelebter Alltag. 
  Deutschland folgt ab Juni 2026.
- Drei Kennzahlen-Karten mit Animations-Counter (count-up 
  wenn Section ins Viewport scrollt):
  "5.500+ Energiegemeinschaften"
  "100.000+ beteiligte Haushalte"  
  "Seit 2021 in Betrieb"
- Kurzes Zitat/Infobox: "Was in Österreich funktioniert, 
  funktioniert auch bei uns — wir wollen Niedenstein 
  zu einem der ersten Orte in Nordhessen machen."
- Unsplash Bild: österreichisches/bayerisches Dorf mit 
  Solaranlagen auf Dächern

### 5. Wie funktioniert das? (vereinfacht)
- Überschrift: "Klingt kompliziert — ist es nicht"
- Drei Schritte als horizontale Karten (Desktop) / 
  vertikal gestapelt (Mobile):
  Schritt 1 — Icon Zähler:
    "Ein moderner Stromzähler wird eingebaut. 
     Er misst automatisch alle 15 Minuten."
  Schritt 2 — Icon Wolke/Daten:
    "Die Daten zeigen wann deine Anlage produziert 
     und wann dein Nachbar Strom braucht."
  Schritt 3 — Icon Euro:
    "Unsere Plattform rechnet automatisch ab. 
     Du bekommst monatlich eine Übersicht."
- Wichtiger Hinweis: "Den Stromzähler baut der 
  Messstellenbetreiber ein — du musst nichts tun 
  außer zustimmen. Für viele Haushalte mit 
  Solaranlage ist das sogar bereits Pflicht."

### 6. Das Pilotprojekt — Timeline
- Überschrift: "Unser Fahrplan"
- Ehrliche Kommunikation was jetzt schon möglich ist 
  und was noch kommt
- Timeline Komponente:
  horizontal auf Desktop (min-width: 768px)
  vertikal auf Mobile
  
  Punkt 1 — JETZT (hervorgehoben, aktiv):
    "Pilotprojekt Niedenstein"
    "Wir sammeln Interessenten, klären die technischen 
     Voraussetzungen und bauen die Gemeinschaft auf."
    
  Punkt 2 — Juni 2026:
    "Gesetz tritt in Kraft"
    "§42c EnWG ermöglicht Energy Sharing offiziell 
     in Deutschland."
    
  Punkt 3 — 2027:
    "Automatisierte Abrechnung"
    "Die technischen Prozesse zwischen Netzbetreiber 
     und Plattform laufen automatisiert."
    
  Punkt 4 — 2028:
    "Erweiterung"
    "Energy Sharing wird auch zwischen benachbarten 
     Netzgebieten möglich."

### 7. Warteliste / Registrierung
- Überschrift: "Sei dabei — als Einer der Ersten"
- Untertext: "Trag dich ein — du gehst damit keine 
  Verpflichtung ein. Wir melden uns wenn es losgeht."
- Zwei Tabs nebeneinander: 
  Tab 1: "☀️ Ich habe eine Solaranlage" (Produzent)
  Tab 2: "⚡ Ich möchte günstigeren Strom" (Verbraucher)
  
  Formular Tab 1 (Produzent):
    - Vorname + Nachname (zwei Felder)
    - E-Mail-Adresse
    - Ortsteil (Select-Dropdown):
      Niedenstein (Kernstadt), Metze, Ermetheis, 
      Hausen, Kirchberg, Osterberg, Quest, 
      Wadenbrunn, Webercell, 
      Anderer Ort im EAM-Gebiet (Nordhessen)
    - Anlagengröße: Slider 1-30+ kWp mit Anzeige
      Labels: "1 kWp" bis "30+ kWp"
    - Bereits Smart Meter vorhanden?
      Radio: Ja / Nein / Weiß nicht
    - Textarea (optional): "Anmerkungen oder Fragen"
  
  Formular Tab 2 (Verbraucher):
    - Vorname + Nachname
    - E-Mail-Adresse  
    - Ortsteil (gleicher Dropdown)
    - E-Auto vorhanden? Checkbox
    - Wärmepumpe vorhanden? Checkbox
    - Jahresverbrauch ca.: Slider 1.000-8.000 kWh
      mit Anzeige und Hilfstext 
      "Durchschnittlicher 4-Personen-Haushalt: ~4.000 kWh"
    - Textarea (optional): "Anmerkungen oder Fragen"
  
  Beide Formulare:
    - Pflicht-Checkbox: 
      "Ich habe die Datenschutzerklärung gelesen 
       und stimme der Verarbeitung meiner Daten zu."
    - Submit Button: "Auf Warteliste eintragen →"
    - Nach erfolgreichem Submit: 
      Seite scrollt nicht weg, Formular ersetzt 
      durch freundliche Bestätigung:
      "✓ Danke! Wir haben dich eingetragen. 
       Du erhältst keine Spam-Mails — wir melden 
       uns nur wenn es wirklich etwas zu berichten gibt."

### 8. FAQ
- Überschrift: "Häufige Fragen"
- Accordion-Komponente, jeweils aufklappbar:

  F: "Muss ich meinen Stromanbieter wechseln?"
  A: "Nein. Du behältst deinen bestehenden Stromvertrag 
     vollständig. Energy Sharing kommt obendrauf — 
     du hast einen zusätzlichen Vertrag nur für den 
     geteilten Strom."

  F: "Brauche ich einen Smart Meter?"
  A: "Ja, ein moderner Stromzähler ist Voraussetzung. 
     Für Haushalte mit Solaranlage über 7 kWp ist der 
     Einbau seit 2025 gesetzlich vorgeschrieben — 
     viele sind also schon dabei. Den Einbau übernimmt 
     der Messstellenbetreiber, du musst dich nur bereit 
     erklären."

  F: "Was kostet die Teilnahme?"
  A: "Das Pilotprojekt ist kostenlos. Welche Gebühren 
     später anfallen könnten, ist noch nicht festgelegt — 
     wir werden das transparent kommunizieren bevor 
     irgendjemand etwas bezahlt."

  F: "Wann geht es wirklich los?"
  A: "Das Gesetz tritt am 1. Juni 2026 in Kraft. 
     Die technischen Prozesse werden voraussichtlich 
     2027 vollständig automatisiert laufen. 
     Wir starten mit einem Pilotbetrieb so früh 
     wie möglich."

  F: "Ich wohne nicht in Niedenstein — bin ich trotzdem dabei?"
  A: "Im EAM-Netzgebiet — also weiten Teilen von 
     Nordhessen — ist Energy Sharing ab Juni 2026 möglich. 
     Niedenstein ist unser Startpunkt. Trag dich ein, 
     wir informieren dich über die Möglichkeiten 
     in deinem Ort."

  F: "Was passiert mit meinen Daten?"
  A: "Deine Daten werden ausschließlich für dieses 
     Projekt verwendet, nicht weitergegeben und 
     auf deutschen Servern gespeichert. 
     Du kannst jederzeit per E-Mail die Löschung 
     beantragen. Details in der Datenschutzerklärung."

### 9. Footer
- Linke Seite: 
  Projektname / Logo (einfaches Text-Logo reicht)
  Kurze Tagline: "Energy Sharing Pilotprojekt Niedenstein"
- Mitte: Links
  Impressum / Datenschutz
- Rechte Seite:
  Kontakt E-Mail (Platzhalter: kontakt@beispiel.de)
- Unterste Zeile:
  "Kein kommerzielles Angebot. 
   Dieses Projekt ist unabhängig und 
   nicht mit EAM oder anderen Energieunternehmen verbunden."
- Copyright: © 2026 Sascha Märkl Softwareentwicklung

## Design-Richtlinien

### Farben (CSS Custom Properties definieren)
--color-primary: #2d6a4f        (warmes Grün — Natur)
--color-primary-dark: #1a3a2a   (Headlines, dunkel)
--color-primary-light: #52b788  (Akzente, Icons)
--color-primary-pale: #d8f3dc   (Hintergründe, Badges)
--color-sun: #f59e0b            (Solar, Energie)
--color-sun-light: #fef3e2      (Produzenten-Karte BG)
--color-bg: #fafaf8             (Seitenhintergrund)
--color-text: #1a1a1a           (Fließtext)
--color-muted: #6b7280          (Sekundärtext)

### Typografie
Headlines (h1, h2): DM Serif Display (Google Fonts)
Body, Labels, Buttons: DM Sans (Google Fonts)
Mindestgröße Body: 16px (18px bevorzugt für Zielgruppe)
h1 Mobile: 2rem / Desktop: 3.5rem
h2 Mobile: 1.6rem / Desktop: 2.2rem

### Abstände
Großzügige Abstände zwischen Sections: 
  Mobile: 64px / Desktop: 120px
Padding Sections: 
  Mobile: 24px horizontal / Desktop: max-width 1200px zentriert

### Bilder
Alle Bilder über next/image mit:
- loading="lazy" 
- Aussagekräftige alt-Texte auf Deutsch
- Unsplash URLs direkt verwenden 
  (domain in next.config.js whitelisten: images.unsplash.com)
Bildauswahl: echte, warme Fotos — 
  KEINE generischen Stock-Foto-Klischees

### Animationen (Framer Motion)
- Section-Einblendungen: fadeInUp beim Scrollen 
  (IntersectionObserver via useInView)
- Staggered Children: Karten und Listen-Items 
  mit 0.1s Verzögerung nacheinander einblenden
- Partikel-Energiefluss in Section 2: 
  SVG-Pfad mit animierten Kreisen die von 
  Solarhaus zu Nachbarhaus fließen — 
  Loop-Animation, subtil nicht überwältigend
- Counter-Animation in Österreich-Section:
  Zahlen zählen von 0 auf Zielwert wenn 
  Section ins Viewport scrollt
- Hover-Effekte: leichte scale(1.02) und 
  box-shadow Transition auf Karten
- NICHT überladen: max 2 gleichzeitige Animationen 
  sichtbar, ruhiger Gesamteindruck

### Mobile First
- Alle Layouts mobile-first entwerfen
- Breakpoints: sm: 640px, md: 768px, lg: 1024px
- Touch-Targets mindestens 44px
- Navigation: kein Hamburger-Menü nötig — 
  Single Page, Anchor-Links reichen
- Formulare: große Input-Felder, 
  min-height 48px für Touch

## API Route (app/api/waitlist/route.ts)
- POST endpoint
- Validierung: E-Mail format, Pflichtfelder
- Weiterleitung per Resend API an: 
  [PLATZHALTER EMAIL — wird manuell eingetragen]
- E-Mail-Format: 
  Betreff: "Neue Wartelisten-Eintragung: [Rolle] aus [Ortsteil]"
  Body: alle Formularfelder übersichtlich aufgelistet
- Bei Erfolg: { success: true }
- Bei Fehler: { success: false, error: "..." }
- Rate Limiting: max 3 Requests pro IP pro Stunde 
  (einfache In-Memory Implementierung reicht)
- Resend API Key aus .env.local: RESEND_API_KEY

## Impressum (app/impressum/page.tsx)
Angaben gemäß § 5 TMG:

Sascha Märkl Softwareentwicklung
Auf der Klippe 15
34305 Niedenstein

E-Mail: [PLATZHALTER — wird manuell eingetragen]

Hinweis: Diese Website dient einem nicht-kommerziellen 
Pilotprojekt zur Erforschung von Energy Sharing 
gemäß §42c EnWG. Es werden keine Dienstleistungen 
verkauft oder Verträge geschlossen.

## Datenschutz (app/datenschutz/page.tsx)
Erstelle eine vollständige aber verständliche 
Datenschutzerklärung gemäß DSGVO mit:
- Verantwortlicher: Sascha Märkl Softwareentwicklung, 
  Auf der Klippe 15, 34305 Niedenstein
- Welche Daten erhoben werden (Formular-Felder)
- Zweck: Aufbau Warteliste für Pilotprojekt
- Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)
- Speicherdauer: bis Widerruf oder Projektende
- Keine Weitergabe an Dritte außer E-Mail-Versand via Resend
- Betroffenenrechte: Auskunft, Löschung, Widerruf
- Kontakt für Datenschutzanfragen: [PLATZHALTER EMAIL]
- Kein Einsatz von Cookies oder Tracking

## Dateistruktur
Erstelle ein vollständiges Next.js Projekt:

energy-sharing-niedenstein/
├── app/
│   ├── layout.tsx          (Fonts, Metadata, OpenGraph)
│   ├── page.tsx            (Hauptseite — importiert alle Sections)
│   ├── impressum/
│   │   └── page.tsx
│   ├── datenschutz/
│   │   └── page.tsx
│   └── api/
│       └── waitlist/
│           └── route.ts
├── components/
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── ExplainerSection.tsx
│   │   ├── BenefitsSection.tsx
│   │   ├── AustriaSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── TimelineSection.tsx
│   │   ├── WaitlistSection.tsx
│   │   ├── FAQSection.tsx
│   │   └── Footer.tsx
│   └── ui/
│       ├── EnergyFlowAnimation.tsx  (SVG Partikel-Animation)
│       ├── CounterAnimation.tsx     (Zahlen count-up)
│       ├── Accordion.tsx
│       └── TabSwitcher.tsx
├── public/
│   └── favicon.svg          (einfaches Solarhaus-Icon)
├── .env.local.example       (RESEND_API_KEY=xxx)
├── next.config.ts           (images.unsplash.com whitelisten)
├── tailwind.config.ts
└── README.md                (Setup-Anleitung)

## OpenGraph / Meta Tags (in layout.tsx)
title: "Energy Sharing Niedenstein — Sonnenstrom für die Nachbarschaft"
description: "Pilotprojekt: Solarstrom lokal teilen statt anonym einspeisen. 
  Für Niedenstein und Nordhessen. Jetzt auf Warteliste eintragen."
og:image: erstelle ein einfaches og-image als 
  statische PNG in public/ 
  (1200x630px, Projektname + Tagline auf grünem Hintergrund)

## Wichtige inhaltliche Leitlinien
- KEINE Versprechen über konkrete Preise oder Termine
- IMMER klar: das ist ein Pilotprojekt
- Fachbegriffe vermeiden: kein "Bilanzierungsgebiet", 
  kein "EDIFACT", kein "TAF", kein "MaKo"
- "Smart Meter" darf verwendet werden — das kennen viele
- "EAM" darf erwähnt werden als lokaler Netzbetreiber
- Österreich als positives Vorbild aber realistisch: 
  Deutschland braucht noch etwas Zeit
- Warm und gemeinschaftlich — keine kalte Tech-Ästhetik
- Bilder und Emojis helfen der Zielgruppe mehr als Text

## Start-Befehl
npx create-next-app@latest energy-sharing-niedenstein \
  --typescript --tailwind --app --src-dir=false \
  --import-alias="@/*"

Dann: npm install framer-motion resend

Fang mit layout.tsx und HeroSection.tsx an und 
zeig mir das Ergebnis bevor du weitermachst.