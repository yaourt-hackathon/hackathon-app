import { buttonVariants } from '@heroui/styles';
import { Link } from '@tanstack/react-router';

export function PageIntrouvable() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Introuvable</h1>
      <p className="mt-2 text-muted">
        Cette page ou cette marque n'existe pas.
      </p>
      {/* Lien du router habillé en bouton HeroUI : préchargement et typage conservés */}
      <Link
        to="/"
        className={buttonVariants({ variant: 'secondary', className: 'mt-6' })}
      >
        Retour aux marques
      </Link>
    </main>
  );
}
