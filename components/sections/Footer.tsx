import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-primary-dark px-6 py-12 text-primary-pale">
      <div className="mx-auto grid max-w-content gap-8 md:grid-cols-3 md:items-start">
        <div>
          <p className="font-serif text-xl text-white">Energy Sharing Chattengau</p>
          <p className="mt-2 text-sm text-primary-pale/80">
            Pilotprojekt Niedenstein · Nordhessen
          </p>
        </div>

        <nav className="flex flex-col gap-2 text-sm md:items-center" aria-label="Rechtliches">
          <Link href="/impressum" className="hover:text-white">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:text-white">
            Datenschutz
          </Link>
        </nav>

        <div className="text-sm md:text-right">
          <p>Kontakt</p>
          <a href="mailto:kontakt@beispiel.de" className="hover:text-white">
            kontakt@beispiel.de
          </a>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-content border-t border-primary-pale/20 pt-6 text-xs text-primary-pale/70">
        <p>
          Kein kommerzielles Angebot. Dieses Projekt ist unabhängig und nicht mit EAM oder anderen
          Energieunternehmen verbunden.
        </p>
        <p className="mt-2">© 2026 Sascha Märkl Softwareentwicklung</p>
      </div>
    </footer>
  );
}
