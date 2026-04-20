import { Accordion, type AccordionItem } from "@/components/ui/Accordion";
import { SectionReveal } from "@/components/ui/SectionReveal";

const ITEMS: AccordionItem[] = [
  {
    id: "stromanbieter",
    question: "Muss ich meinen Stromanbieter wechseln?",
    answer: (
      <div className="space-y-3">
        <p>
          Nein. Du behältst deinen bestehenden Stromvertrag vollständig. Energy Sharing kommt
          obendrauf — du hast einen zusätzlichen Vertrag nur für den geteilten Strom.
        </p>
        <p>
          Was passiert konkret auf deiner Rechnung: Jede Kilowattstunde, die du über Energy
          Sharing aus der Nachbarschaft bekommst, wird von deinem normalen Stromverbrauch
          abgezogen. Dein bisheriger Anbieter stellt dir also weniger in Rechnung — genau den
          Anteil, den du über Energy Sharing bezogen hast. Du zahlst diesen Anteil stattdessen
          (günstiger) direkt an den lokalen Erzeuger.
        </p>
      </div>
    ),
  },
  {
    id: "smart-meter",
    question: "Brauche ich einen Smart Meter?",
    answer: (
      <p>
        Ja, ein moderner Stromzähler ist Voraussetzung. Für Haushalte mit Solaranlage über 7 kWp
        ist der Einbau seit 2025 gesetzlich vorgeschrieben — viele sind also schon dabei. Den
        Einbau übernimmt der Messstellenbetreiber, du musst dich nur bereit erklären.
      </p>
    ),
  },
  {
    id: "kein-abnehmer",
    question: "Was passiert, wenn nicht genug Nachbarn meinen Strom abnehmen?",
    answer: (
      <p>
        Dann bist du nicht schlechter gestellt als heute: Was nicht über Energy Sharing
        abgenommen wird, fließt ganz normal ins Netz und du bekommst dafür weiterhin die
        übliche EEG-Einspeisevergütung. Energy Sharing ersetzt die EEG-Vergütung also nicht —
        es ist eine zusätzliche Möglichkeit, für den Anteil, der vor Ort verbraucht wird, einen
        besseren Preis zu erzielen.
      </p>
    ),
  },
  {
    id: "kosten",
    question: "Was kostet die Teilnahme?",
    answer: (
      <p>
        Das Pilotprojekt ist kostenlos. Welche Gebühren später anfallen könnten, ist noch nicht
        festgelegt — wir werden das transparent kommunizieren, bevor irgendjemand etwas bezahlt.
      </p>
    ),
  },
  {
    id: "los",
    question: "Wann geht es wirklich los?",
    answer: (
      <p>
        Das Gesetz tritt am 1. Juni 2026 in Kraft. Die technischen Prozesse werden voraussichtlich
        2027 vollständig automatisiert laufen. Wir starten mit einem Pilotbetrieb so früh wie
        möglich.
      </p>
    ),
  },
  {
    id: "ort",
    question: "Ich wohne nicht in Niedenstein — bin ich trotzdem dabei?",
    answer: (
      <p>
        Im EAM-Netzgebiet — also weiten Teilen von Nordhessen — ist Energy Sharing ab Juni 2026
        möglich. Niedenstein ist unser Startpunkt. Trag dich ein, wir informieren dich über die
        Möglichkeiten in deinem Ort.
      </p>
    ),
  },
  {
    id: "daten",
    question: "Was passiert mit meinen Daten?",
    answer: (
      <p>
        Deine Daten werden ausschließlich für dieses Projekt verwendet, nicht weitergegeben und
        auf deutschen Servern gespeichert. Du kannst jederzeit per E-Mail die Löschung
        beantragen. Details in der{" "}
        <a href="/datenschutz" className="underline hover:text-primary">
          Datenschutzerklärung
        </a>
        .
      </p>
    ),
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="bg-bg px-6 py-16 md:py-30">
      <div className="mx-auto max-w-3xl">
        <SectionReveal>
          <h2 className="text-center">Häufige Fragen</h2>
        </SectionReveal>
        <SectionReveal delay={0.1}>
          <div className="mt-10">
            <Accordion items={ITEMS} />
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
