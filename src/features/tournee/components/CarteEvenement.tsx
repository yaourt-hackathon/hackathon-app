import { Card } from '@heroui/react';
import { Link } from '@tanstack/react-router';
import { Pastille } from '@/components/Pastille';
import type { EvenementDetecte } from '@/features/tournee/evenements';
import {
  formaterDate,
  formaterEcheance,
  formaterNbClients,
} from '@/features/tournee/format';
import { libelleStatut, libelleType } from '@/features/tournee/libelles';

export function CarteEvenement({ evenement }: { evenement: EvenementDetecte }) {
  return (
    // Le lien du titre couvre toute la carte (after:inset-0) : un seul arrêt
    // de tabulation, et la carte entière est cliquable
    <Card className="relative hover:bg-surface-hover has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-focus">
      <Card.Header className="gap-2">
        <div className="flex flex-wrap gap-2">
          <Pastille texte={libelleType(evenement.type)} couleur="default" />
          <Pastille {...libelleStatut[evenement.statut_validation]} />
        </div>
        <Card.Title className="text-lg">
          <Link
            to="/evenements/$evenementId"
            params={{ evenementId: evenement.evenement_id }}
            className="outline-none after:absolute after:inset-0 after:rounded-[inherit]"
          >
            {evenement.titre}
          </Link>
        </Card.Title>
        <Card.Description>
          Source : {evenement.source_nom}, publié le{' '}
          <time dateTime={evenement.date_publication}>
            {formaterDate(evenement.date_publication)}
          </time>
        </Card.Description>
      </Card.Header>
      <Card.Footer className="flex flex-wrap justify-between gap-2 text-sm">
        <span className="text-muted" data-echeance={evenement.date_echeance}>
          {formaterEcheance(evenement.date_echeance)}
        </span>
        <span className="font-medium">
          {formaterNbClients(evenement.nb_clients)}
        </span>
      </Card.Footer>
    </Card>
  );
}
