import { useSuspenseQuery } from '@tanstack/react-query';
import { BandeauVeille } from '@/features/tournee/components/BandeauVeille';
import { CarteEvenement } from '@/features/tournee/components/CarteEvenement';
import { evenementsQuery } from '@/features/tournee/queries';

export function ListeEvenements() {
  const { data } = useSuspenseQuery(evenementsQuery());

  return (
    <section>
      <BandeauVeille
        mode={data.mode}
        dateMaj={data.date_maj}
        crmFictif={data.crm_fictif}
      />
      {/* role="list" : Safari retire la sémantique d'une liste sans puces */}
      <ul
        role="list"
        aria-label="Événements détectés"
        className="flex flex-col gap-4"
      >
        {data.evenements.map((e) => (
          <li key={e.evenement_id}>
            <CarteEvenement evenement={e} />
          </li>
        ))}
      </ul>
    </section>
  );
}
