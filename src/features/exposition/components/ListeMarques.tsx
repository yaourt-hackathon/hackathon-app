import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Pastille } from '@/features/exposition/components/Pastille';
import { BandeauFactice } from '@/features/exposition/components/BandeauFactice';
import { libelleUrgence } from '@/features/exposition/libelles';
import { marquesQuery } from '@/features/exposition/queries';

export function ListeMarques() {
  const { data } = useSuspenseQuery(marquesQuery());

  return (
    <section>
      <BandeauFactice factice={data.factice} />
      <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
        {data.marques.map((m) => (
          <li key={m.id}>
            <Link
              to="/marques/$id"
              params={{ id: m.id }}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-stone-50"
            >
              <span className="font-medium capitalize">{m.marque}</span>
              <span className="flex items-center gap-4 text-sm text-stone-600">
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
      <p className="mt-3 text-xs text-stone-500">Données du {data.date_maj}</p>
    </section>
  );
}
