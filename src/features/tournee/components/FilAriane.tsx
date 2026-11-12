import { linkVariants } from '@heroui/styles';
import { Link } from '@tanstack/react-router';

// Liens du router, pas Breadcrumbs de HeroUI : ses liens rechargeraient la page
export function FilAriane({
  evenementId,
  titreEvenement,
  nomCompte,
}: {
  evenementId: string;
  titreEvenement: string;
  nomCompte: string;
}) {
  const lien = linkVariants().base();
  return (
    <nav aria-label="Fil d'Ariane">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
        <li>
          <Link to="/" className={lien}>
            Événements
          </Link>
        </li>
        <li aria-hidden="true">›</li>
        <li>
          <Link
            to="/evenements/$evenementId"
            params={{ evenementId }}
            search={{ valide: true }}
            className={lien}
          >
            {titreEvenement}
          </Link>
        </li>
        <li aria-hidden="true">›</li>
        <li aria-current="page">{nomCompte}</li>
      </ol>
    </nav>
  );
}
