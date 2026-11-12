import { linkVariants } from '@heroui/styles';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ListeEvenements } from '@/features/tournee/components/ListeEvenements';
import { evenementsQuery } from '@/features/tournee/queries';

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(evenementsQuery()),
  component: Accueil,
});

function Accueil() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-medium text-muted">Note de tête</p>
      <h1 className="mt-1 text-4xl font-semibold tracking-tight">
        Événements détectés
      </h1>
      <p className="mt-4 mb-10 text-lg text-muted">
        Un événement entre, une tournée d'appels sort. Choisissez un événement
        pour préparer vos appels.
      </p>
      <ListeEvenements />
      <p className="mt-12 text-sm">
        <Link
          to="/marques"
          className={linkVariants().base({ className: 'underline' })}
        >
          Exposition des marques aux allergènes (UE 2023/1545)
        </Link>
      </p>
    </main>
  );
}
