# Preisrechner-Sektion — Design

**Datum:** 2026-04-20
**Scope:** Interaktiver Rechner auf der Landingpage, der den Preisvorteil von Energy Sharing für Verbraucher und Produzenten im Vergleich zum Status quo (EEG-Einspeisevergütung, 30 ¢ Marktpreis) transparent macht.

## Ziel

Besucher:innen der Landingpage sollen in wenigen Sekunden spielerisch sehen, wie viel günstiger bzw. lukrativer Energy Sharing gegenüber dem heutigen System ist. Der Rechner sitzt direkt vor dem Waitlist-CTA und dient als letzter emotionaler Trigger.

## Platzierung

In `app/page.tsx` zwischen `<TimelineSection />` (Fahrplan) und `<WaitlistSection />` (Sei dabei) als neue Sektion `<CalculatorSection />`.

## Komponentenstruktur

Ein neuer Client-Component unter `components/sections/CalculatorSection.tsx`.
- Reiner Client-Side State (kein Backend, keine API).
- Nutzt `"use client"` und `useState`.
- Style folgt den bestehenden Sections (Tailwind-Klassen, gleiche Container-Breiten, gleiche Farbpalette).

## Konstanten (top-level im Modul)

```ts
const EEG_RATE = 6.8;              // ¢/kWh, EEG-Einspeisevergütung
const NETZENTGELT_BASE = 9.0;      // ¢/kWh, reduzierbarer Anteil
const WEITERE_NEBENKOSTEN = 10.69; // ¢/kWh, Steuern/Abgaben/MwSt (nicht reduzierbar)
const MARKTPREIS = 30.0;           // ¢/kWh, heutiger Endkundenpreis
const DEFAULT_VERBRAUCH = 2500;    // kWh/Jahr
const DEFAULT_EINSPEISUNG = 1000;  // kWh/Jahr

const EINSPEISUNG_MIN = 5;
const EINSPEISUNG_MAX = 20;
const EINSPEISUNG_DEFAULT = 10;    // ¢/kWh Slider-Startwert

const REDUKTIONS_STUFEN = [
  {
    value: 0,
    label: "Keine Reduktion",
    description: "Aktuell in Deutschland Standard (Entscheidung der BNetzA steht aus). In Österreich gilt dies bei bundesweitem Sharing.",
  },
  {
    value: 28,
    label: "28 % Reduktion",
    description: "Selbes Umspannwerk, verschiedene Trafostationen. Beispiel: Sharing-Partner in Niedenstein und Kirchberg. Aktueller Stand in Österreich.",
  },
  {
    value: 64,
    label: "64 % Reduktion",
    description: "Selbe Trafostation — direkte Nachbarschaft bzw. selbe Straße.",
  },
];
```

## State

```ts
const [einspeiseverguetung, setEinspeiseverguetung] = useState(EINSPEISUNG_DEFAULT);
const [reduktion, setReduktion] = useState(0); // %
```

## Berechnungen (reine Funktionen im selben Modul)

```ts
function verbraucherpreis(einspeise: number, reduktionPct: number): number {
  return einspeise + NETZENTGELT_BASE * (1 - reduktionPct / 100) + WEITERE_NEBENKOSTEN;
}

function mehrertragProzent(einspeise: number): number {
  return ((einspeise - EEG_RATE) / EEG_RATE) * 100;
}

function ersparnisProzent(preis: number): number {
  return ((MARKTPREIS - preis) / MARKTPREIS) * 100;
}

function jahresersparnisVerbraucher(preis: number, kWh: number): number {
  return ((MARKTPREIS - preis) * kWh) / 100; // € pro Jahr
}

function jahresmehrertragProduzent(einspeise: number, kWh: number): number {
  return ((einspeise - EEG_RATE) * kWh) / 100; // € pro Jahr
}
```

## Layout

Desktop (2 Spalten + Ergebnisband darunter), Mobile (stacked):

```
┌─────────────────────────────────────────────────────────┐
│       "Was bringt dir Energy Sharing?"  (h2)            │
│       Optionaler Lead-Text                              │
├───────────────────────────┬─────────────────────────────┤
│ Produzent                 │ Verbraucher                 │
│                           │                             │
│ Einspeisevergütung        │ Reduktion der Netzentgelte  │
│ [Slider 5–20 ¢]           │ ◯ Keine Reduktion           │
│ Tick/Marker bei 6,8 ¢ EEG │ ◯ 28 % Reduktion            │
│                           │ ● 64 % Reduktion            │
│ Aktuell: 10,0 ¢/kWh       │                             │
│ +47 % ggü. EEG            │ Kurzerklärung zur Auswahl   │
├───────────────────────────┴─────────────────────────────┤
│ Verbraucher zahlt:                                      │
│   23,93 ¢/kWh  (gegenüber 30 ¢ → 20 % günstiger)        │
│                                                         │
│ Bei 2.500 kWh Verbrauch: 151 € / Jahr gespart           │
│ Bei 1.000 kWh Einspeisung: +32 € / Jahr gegenüber EEG   │
│                                                         │
│ *Vereinfachte Darstellung. Ohne Gewähr. Basiswerte:     │
│  Netzentgelt 9 ¢/kWh, weitere Nebenkosten 10,69 ¢/kWh   │
│  (Steuern, Abgaben, MwSt). Marktpreis 30 ¢/kWh.         │
└─────────────────────────────────────────────────────────┘
```

### Produzenten-Spalte

- Überschrift: "Produzent" (z.B. mit Icon)
- Sub-Label: "Einspeisevergütung" mit kleiner Erklärung
- Range-Slider 5–20 ¢, Schrittweite 0,1 ¢
- Visueller Tick/Marker auf der Slider-Schiene bei 6,8 ¢ mit Label "EEG"
- Unter dem Slider: aktueller Wert in ¢/kWh, groß
- Prozent-Badge: "+47 % gegenüber EEG" (positiv gefärbt wenn > EEG, neutral wenn =, negativ wenn <)

### Verbraucher-Spalte

- Überschrift: "Verbraucher"
- Sub-Label: "Reduktion der Netzentgelte"
- Drei Radio-Buttons / Toggle-Buttons, nur einer aktiv
- Unter der Auswahl: die `description` der gewählten Stufe

### Ergebnisband

- Große Zahl: Verbraucherpreis in ¢/kWh
- Vergleichszeile: "gegenüber 30 ¢ Marktpreis → X % günstiger" (oder "teurer" bei negativem Wert — Randfall bei niedriger Reduktion + hoher Einspeisevergütung)
- Zwei Zeilen Jahres-Hochrechnung (Verbrauch 2.500 kWh, Einspeisung 1.000 kWh, hart kodiert)
- Fußnote klein, grau

## Berechnungsbeispiele (zur Verifikation)

| Einspeise | Reduktion | Verbraucherpreis | Ersparnis % | Jahr 2.500 kWh |
|-----------|-----------|------------------|-------------|----------------|
| 10,0 ¢    | 0 %       | 29,69 ¢          | 1,0 %       | 7,75 €         |
| 10,0 ¢    | 28 %      | 27,17 ¢          | 9,4 %       | 70,75 €        |
| 10,0 ¢    | 64 %      | 23,93 ¢          | 20,2 %      | 151,75 €       |
| 6,8 ¢     | 64 %      | 20,73 ¢          | 30,9 %      | 231,75 €       |
| 15,0 ¢    | 64 %      | 28,93 ¢          | 3,6 %       | 26,75 €        |

## Formatierung / i18n

- Dezimaltrennzeichen: Komma (`Intl.NumberFormat("de-DE")`)
- Prozentwerte auf 1 Nachkommastelle
- ¢/kWh-Werte auf 2 Nachkommastellen
- Jahres-Euro auf volle Euro gerundet
- Tausendertrennzeichen: Punkt bei kWh-Werten

## Edge Cases

- **Verbraucherpreis > 30 ¢:** möglich bei Einspeisevergütung nahe 20 ¢ und 0 % Reduktion. Vergleichszeile zeigt dann "X % teurer" in gedämpfter Farbe, keine Jahresersparnis (negativ → "−X €/Jahr").
- **Einspeisevergütung < 6,8 ¢:** Badge zeigt "−X % gegenüber EEG" (negativ gefärbt).

## Accessibility

- Slider hat Label, aktuellen Wert als `aria-valuetext` mit Einheit
- Radio-Gruppe mit `fieldset`/`legend`
- Ergebnisband nutzt `aria-live="polite"`, damit Screenreader Änderungen vorlesen
- Keyboard-Bedienung: Tab durch Slider → Radio-Gruppe, Pfeiltasten für beide

## Responsive

- Desktop (≥ md): 2 Spalten nebeneinander, Ergebnisband in voller Breite darunter
- Mobile (< md): Produzent, Verbraucher, Ergebnis stacked (dreifach untereinander)

## Nicht im Scope

- Keine Backend-Persistierung der Eingaben
- Kein Tracking/Analytics auf den Rechner (kann später ergänzt werden)
- Keine Eingabe des Jahresverbrauchs/der Jahreseinspeisung durch den Nutzer — die Defaults (2.500/1.000 kWh) sind hart kodiert
- Keine MwSt-Aufschlüsselung oder Steuerdetails
- Keine Animation beim Werteübergang (kann später ergänzt werden)

## Testing

- Unit-Tests für die reinen Berechnungsfunktionen (Node-Testrunner oder vitest, je nach bestehendem Setup) — decken die Berechnungsbeispiele aus der Tabelle oben ab.
- Manueller Smoke-Test im Browser: alle drei Reduktionsstufen, Slider-Extremwerte, Mobile-Breakpoint.
