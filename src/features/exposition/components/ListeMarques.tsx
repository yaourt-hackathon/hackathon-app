import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { BandeauFactice } from '@/features/exposition/components/BandeauFactice';
import { Pastille } from '@/features/exposition/components/Pastille';
import { libelleUrgence } from '@/features/exposition/libelles';
import { marquesQuery } from '@/features/exposition/queries';

export function ListeMarques() {
  const { data } = useSuspenseQuery(marquesQuery());

  return (
    <section>
      <BandeauFactice factice={data.factice} />
      <ul className="divide-y divide-separator overflow-hidden rounded-xl border border-border bg-surface">
        {data.marques.map((m) => (
          <li
            key={m.id}
            // Arrondit l'anneau de focus du premier et du dernier lien
            className="first:*:rounded-t-xl last:*:rounded-b-xl"
          >
            <Link
              to="/marques/$id"
              params={{ id: m.id }}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
            >
              <span className="font-medium capitalize">{m.marque}</span>
              <span className="flex items-center gap-4 text-sm text-muted">
                <span>
                  {m.nb_probable} / {m.nb_produits} produits en exposition
                  probable
                </span>
                <Pastille {...libelleUrgence[m.urgence]} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">Données du {data.date_maj}</p>
    </section>
  );
}
