import { createFileRoute, Link } from '@tanstack/react-router';
import { DiagnosticMarque } from '@/features/exposition/components/DiagnosticMarque';
import { expositionQuery } from '@/features/exposition/queries';

export const Route = createFileRoute('/marques/$id')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(expositionQuery(params.id)),
  head: ({ params }) => ({ meta: [{ title: `${params.id} · Note de tête` }] }),
  component: Marque,
});

function Marque() {
  const { id } = Route.useParams();
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <Link to="/" className="text-sm text-stone-500 hover:underline">
        ← Toutes les marques
      </Link>
      <div className="mt-6">
        <DiagnosticMarque marque={id} />
      </div>
    </main>
  );
}
