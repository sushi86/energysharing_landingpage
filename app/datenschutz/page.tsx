import Link from "next/link";

export const metadata = {
  title: "Datenschutz — Energy Sharing Chattengau",
};

export default function DatenschutzPage() {
  return (
    <main className="bg-bg px-6 py-16 md:py-24">
      <article className="mx-auto max-w-2xl space-y-8">
        <header>
          <p className="text-sm text-muted">
            <Link href="/" className="underline hover:text-primary">
              ← Zurück zur Startseite
            </Link>
          </p>
          <h1 className="mt-4 font-serif">Datenschutzerklärung</h1>
          <p className="mt-2 text-sm text-muted">
            Transparent und in einfachen Worten — so wie wir es auch beim Projekt halten.
          </p>
        </header>

        <section className="space-y-2">
          <h2 className="font-serif">Verantwortlicher</h2>
          <p>
            Sascha Märkl Softwareentwicklung
            <br />
            Auf der Klippe 15
            <br />
            34305 Niedenstein
            <br />
            E-Mail:{" "}
            <a href="mailto:kontakt@beispiel.de" className="underline hover:text-primary">
              kontakt@beispiel.de
            </a>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif">Welche Daten werden erhoben?</h2>
          <p>
            Wir erheben nur die Daten, die du aktiv ins Wartelisten-Formular einträgst:
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Vor- und Nachname</li>
            <li>E-Mail-Adresse</li>
            <li>Ortsteil im Chattengau bzw. im EAM-Netzgebiet</li>
            <li>
              Als Produzent: Anlagengröße (kWp) und Angabe, ob ein Smart Meter vorhanden ist
            </li>
            <li>
              Als Verbraucher: Angaben zu E-Auto, Wärmepumpe und ungefährer Jahresverbrauch
            </li>
            <li>Optionale Anmerkungen, die du selbst einträgst</li>
          </ul>
          <p>
            Beim Aufruf der Seite fallen serverseitige Zugriffsprotokolle unseres Hosting-Anbieters
            an (z. B. IP-Adresse, Zeitstempel, aufgerufene Seite). Diese werden ausschließlich zur
            Sicherstellung des Betriebs und zur Abwehr von Missbrauch verarbeitet.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif">Zweck der Verarbeitung</h2>
          <p>
            Aufbau einer Warteliste für das Energy-Sharing-Pilotprojekt im Chattengau. Wir
            kontaktieren dich per E-Mail, wenn es konkrete Schritte gibt — nicht häufiger.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif">Rechtsgrundlage</h2>
          <p>
            Art. 6 Abs. 1 lit. a DSGVO — deine Einwilligung, die du mit dem Absenden des
            Formulars und der Bestätigung per E-Mail (Double-Opt-In) erteilst.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif">Double-Opt-In</h2>
          <p>
            Nach dem Absenden des Formulars erhältst du eine Bestätigungs-E-Mail mit einem
            einmaligen Link. Erst wenn du diesen Link klickst, wird deine Eintragung wirksam und
            wir erhalten eine Benachrichtigung. Klickst du den Link nicht innerhalb von 24
            Stunden, werden deine Angaben automatisch und vollständig gelöscht.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif">Speicherdauer</h2>
          <p>
            Deine Daten werden gespeichert, bis du die Löschung beantragst oder bis das
            Pilotprojekt endet — je nachdem, was früher eintritt. Nicht bestätigte Eintragungen
            werden nach 24 Stunden automatisch verworfen.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif">Weitergabe an Dritte</h2>
          <p>
            Wir geben deine Daten grundsätzlich nicht an Dritte weiter. Ausnahme: Für den Versand
            der Bestätigungs-E-Mail und der internen Benachrichtigung nutzen wir den Dienst{" "}
            <a
              href="https://resend.com"
              className="underline hover:text-primary"
              target="_blank"
              rel="noreferrer"
            >
              Resend
            </a>{" "}
            (Resend, Inc., USA). Bei diesem Auftragsverarbeiter laufen deine Name-, E-Mail- und
            Formulardaten kurzzeitig durch, damit die E-Mails zugestellt werden können. Der
            Versand erfolgt auf Grundlage der EU-Standardvertragsklauseln.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif">Cookies und Tracking</h2>
          <p>
            Diese Website setzt keine Cookies und verwendet weder Analyse- noch Tracking-Tools
            noch Social-Media-Plugins.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif">Deine Rechte</h2>
          <p>
            Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
            Verarbeitung sowie Datenübertragbarkeit hinsichtlich deiner gespeicherten Daten. Du
            kannst deine Einwilligung jederzeit widerrufen — der Widerruf wirkt für die Zukunft.
          </p>
          <p>
            Für all diese Anliegen genügt eine formlose E-Mail an{" "}
            <a href="mailto:kontakt@beispiel.de" className="underline hover:text-primary">
              kontakt@beispiel.de
            </a>
            . Zusätzlich hast du das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu
            beschweren — in Hessen: Der Hessische Beauftragte für Datenschutz und
            Informationsfreiheit.
          </p>
        </section>
      </article>
    </main>
  );
}
