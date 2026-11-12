import { Link as LienExterne } from '@heroui/react';
import { Pastille } from '@/components/Pastille';
import { formaterDate, formaterEcheance } from '@/features/tournee/format';
import { libelleStatut, libelleType } from '@/features/tournee/libelles';
import type { Evenement } from '@/lib/data-api/generated';

export function EnTeteEvenement({ evenement }: { evenement: Evenement }) {
  return (
    <header>
      <div className="flex flex-wrap gap-2">
        <Pastille texte={libelleType(evenement.type)} couleur="default" />
        <Pastille {...libelleStatut[evenement.statut_validation]} />
      </div>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        {evenement.titre}
      </h1>
      <p className="mt-3 text-lg text-muted">{evenement.resume}</p>
      <p className="mt-3 text-sm text-muted">
        Source :{' '}
        {evenement.source_url ? (
          <LienExterne
            href={evenement.source_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {evenement.source_nom}
            <LienExterne.Icon aria-hidden="true" />
          </LienExterne>
        ) : (
          evenement.source_nom
        )}
        , publié le{' '}
        <time dateTime={evenement.date_publication}>
          {formaterDate(evenement.date_publication)}
        </time>
        . {formaterEcheance(evenement.date_echeance)}.
      </p>
    </header>
  );
}
