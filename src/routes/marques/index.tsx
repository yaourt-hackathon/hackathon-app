import { linkVariants } from '@heroui/styles';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ListeMarques } from '@/features/exposition/components/ListeMarques';
import { marquesQuery } from '@/features/exposition/queries';

export const Route = createFileRoute('/marques/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(marquesQuery()),
  head: () => ({ meta: [{ title: 'Marques · Note de tête' }] }),
  component: Marques,
});

function Marques() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link to="/" className={linkVariants().base({ className: 'text-sm' })}>
        ← Événements détectés
      </Link>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight">
        Exposition des marques
      </h1>
      <p className="mt-4 mb-10 text-lg text-muted">
        Exposition des marques cosmétiques aux nouveaux allergènes du règlement
        UE 2023/1545.
      </p>
      <ListeMarques />
    </main>
  );
}
