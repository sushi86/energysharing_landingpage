import Link from "next/link";

export const metadata = {
  title: "Impressum — Energy Sharing Chattengau",
};

export default function ImpressumPage() {
  return (
    <main className="bg-bg px-6 py-16 md:py-24">
      <article className="mx-auto max-w-2xl space-y-8">
        <header>
          <p className="text-sm text-muted">
            <Link href="/" className="underline hover:text-primary">
              ← Zurück zur Startseite
            </Link>
          </p>
          <h1 className="mt-4 font-serif">Impressum</h1>
          <p className="mt-2 text-sm text-muted">Angaben gemäß § 5 TMG</p>
        </header>

        <section className="space-y-2">
          <h2 className="font-serif">Anbieter</h2>
          <p>
            Sascha Märkl Softwareentwicklung
            <br />
            Auf der Klippe 15
            <br />
            34305 Niedenstein
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif">Kontakt</h2>
          <p>
            E-Mail:{" "}
            <a href="mailto:kontakt@beispiel.de" className="underline hover:text-primary">
              kontakt@beispiel.de
            </a>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif">Verantwortlich für den Inhalt</h2>
          <p>Sascha Märkl, Anschrift wie oben.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif">Hinweis zum Projekt</h2>
          <p>
            Diese Website dient einem nicht-kommerziellen Pilotprojekt zur Erforschung von
            Energy Sharing gemäß § 42c EnWG. Es werden über diese Seite keine Dienstleistungen
            verkauft oder Verträge geschlossen.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif">Haftung für Inhalte</h2>
          <p>
            Die Inhalte dieser Seiten wurden mit größtmöglicher Sorgfalt erstellt. Für die
            Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr
            übernommen werden. Als Diensteanbieter bin ich gemäß § 7 Abs. 1 TMG für eigene
            Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif">Haftung für Links</h2>
          <p>
            Diese Website enthält keine externen Links zu kommerziellen Angeboten. Für die
            Inhalte eventuell verlinkter externer Seiten sind ausschließlich deren Betreiber
            verantwortlich.
          </p>
        </section>
      </article>
    </main>
  );
}
