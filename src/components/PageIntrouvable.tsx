import { Link } from '@tanstack/react-router';

export function PageIntrouvable() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Introuvable</h1>
      <p className="mt-2 text-stone-600">
        Cette page ou cette marque n'existe pas.
      </p>
      <Link to="/" className="mt-6 inline-block text-sm underline">
        Retour aux marques
      </Link>
    </main>
  );
}
