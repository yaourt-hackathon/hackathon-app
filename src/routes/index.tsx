import { createFileRoute } from '@tanstack/react-router';
import { ListeMarques } from '@/features/exposition/components/ListeMarques';
import { marquesQuery } from '@/features/exposition/queries';

export const Route = createFileRoute('/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(marquesQuery()),
  component: Home,
});

function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Note de tête</h1>
      <p className="mt-4 mb-10 text-lg text-muted">
        Exposition des marques cosmétiques aux nouveaux allergènes du règlement
        UE 2023/1545.
      </p>
      <ListeMarques />
    </main>
  );
}
