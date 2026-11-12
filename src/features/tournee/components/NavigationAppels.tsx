import { buttonVariants } from '@heroui/styles';
import { Link } from '@tanstack/react-router';
import type { AppelDansTournee } from '@/features/tournee/appel';

export function NavigationAppels({
  evenementId,
  dansTournee,
}: {
  evenementId: string;
  dansTournee: AppelDansTournee;
}) {
  const { precedent, suivant, position, total } = dansTournee;
  // Un nom long passe à la ligne au lieu d'élargir la page sur un téléphone
  const bouton = buttonVariants({
    variant: 'secondary',
    className: 'h-auto py-2 whitespace-normal',
  });
  return (
    <nav
      aria-label="Autres clients de la tournée"
      className="flex flex-wrap items-center justify-between gap-3"
    >
      {precedent ? (
        <Link
          to="/evenements/$evenementId/appels/$compteId"
          params={{ evenementId, compteId: precedent.compte_id }}
          className={bouton}
        >
          ← Client précédent : {precedent.nom_compte}
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-muted">
        Client {position} sur {total}
      </span>
      {suivant ? (
        <Link
          to="/evenements/$evenementId/appels/$compteId"
          params={{ evenementId, compteId: suivant.compte_id }}
          className={bouton}
        >
          Client suivant : {suivant.nom_compte} →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
