export function SuccessCard() {
  return (
    <div className="rounded-2xl bg-primary-pale p-8 text-center ring-1 ring-primary/30">
      <div className="mb-4 text-4xl" aria-hidden>
        ✉️
      </div>
      <h3 className="font-serif text-primary-dark">Fast geschafft — bitte E-Mails checken.</h3>
      <p className="mt-3 text-base text-primary-dark/80">
        Wir haben dir eine Bestätigungsmail geschickt. Klick darin auf den Link, um deine
        Eintragung abzuschließen. Der Link ist 24 Stunden gültig.
      </p>
      <p className="mt-3 text-sm text-muted">
        Nichts angekommen? Schau auch im Spam-Ordner nach.
      </p>
    </div>
  );
}
