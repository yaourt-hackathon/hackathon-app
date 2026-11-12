import { Pastille } from '@/components/Pastille';
import type { ModeDonnees } from '@/features/tournee/donnees/source';
import { formaterDate } from '@/features/tournee/format';
import { libelleMode } from '@/features/tournee/libelles';

// Rappel, au bas du contenu, de ce qui est simulé (docs/produit.md, ADR 0008)
export function PiedDonnees({
  mode,
  dateMaj,
  crmFictif,
}: {
  mode: ModeDonnees;
  dateMaj: string;
  crmFictif: boolean;
}) {
  return (
    <footer className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-muted">
      <Pastille {...libelleMode[mode]} />
      <span>
        Données du {formaterDate(dateMaj)}
        {crmFictif && ', CRM fictif'}. Démo : rien n'est écrit dans Pegasus.
      </span>
    </footer>
  );
}
