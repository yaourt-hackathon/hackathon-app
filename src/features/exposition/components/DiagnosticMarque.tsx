import { useSuspenseQuery } from '@tanstack/react-query';
import { Pastille } from '@/features/exposition/components/Pastille';
import { BandeauFactice } from '@/features/exposition/components/BandeauFactice';
import { libelleNiveau, libelleUrgence } from '@/features/exposition/libelles';
import { expositionQuery } from '@/features/exposition/queries';

export function DiagnosticMarque({ marque }: { marque: string }) {
  const { data } = useSuspenseQuery(expositionQuery(marque));
  const { source } = data;

  return (
    <section>
      <BandeauFactice factice={data.factice} />
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight capitalize">
          {data.marque}
        </h1>
        <Pastille {...libelleUrgence[data.urgence]} />
      </header>
      <p className="mt-2 text-stone-600">
        {data.nb_probable} produits en exposition probable, {data.nb_possible}{' '}
        possible, {data.nb_indetermine} indéterminé, {data.nb_non_detecte} non
        détecté, sur {data.nb_produits}.
      </p>

      <table className="mt-8 w-full border-collapse text-left text-sm">
        <thead className="border-b border-stone-300 text-stone-500">
          <tr>
            <th className="py-2 pr-4 font-medium">Produit</th>
            <th className="py-2 pr-4 font-medium">Niveau</th>
            <th className="py-2 pr-4 font-medium">
              Substances (nouvelle liste)
            </th>
            <th className="py-2 font-medium">Motif</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {data.produits.map((p) => (
            <tr key={p.code_barre} className="align-top">
              <td className="py-3 pr-4">{p.nom}</td>
              <td className="py-3 pr-4">
                <Pastille {...libelleNiveau[p.niveau]} />
              </td>
              <td className="py-3 pr-4">{p.substances.join(', ') || '—'}</td>
              <td className="py-3 text-stone-600">{p.motif}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-6 text-xs text-stone-500">
        Règlement {source.reglement}, échéance des produits en rayon le{' '}
        {source.echeance_produits_en_rayon}. Catalogue : {source.catalogue}.
        Données du {data.date_maj}.
      </p>
    </section>
  );
}
