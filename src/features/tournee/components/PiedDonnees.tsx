import { Pastille } from '@/components/Pastille';
import type { ModeDonnees } from '@/features/tournee/donnees/source';
import { formaterDate } from '@/features/tournee/format';
import { libelleMode } from '@/features/tournee/libelles';

// Rappel, en bas de page, d'où viennent les données (ADR 0008)
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
    <footer className="mt-12 flex flex-wrap items-center gap-3 text-xs text-muted">
      <Pastille {...libelleMode[mode]} />
      <span>
        Données du {formaterDate(dateMaj)}
        {crmFictif && ', CRM fictif'}.
      </span>
    </footer>
  );
}
