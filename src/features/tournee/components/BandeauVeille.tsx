import { Alert } from '@heroui/react';
import { Pastille } from '@/components/Pastille';
import type { ModeDonnees } from '@/features/tournee/donnees/source';
import { formaterDate } from '@/features/tournee/format';
import { libelleMode } from '@/features/tournee/libelles';

// Ce qui est simulé se dit à l'écran (docs/produit.md), et la source aussi
export function BandeauVeille({
  mode,
  dateMaj,
  crmFictif,
}: {
  mode: ModeDonnees;
  dateMaj: string;
  crmFictif: boolean;
}) {
  return (
    <Alert status="accent" className="mb-8">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>Veille préparée à la main pour la démo</Alert.Title>
        <Alert.Description>
          Veille du {formaterDate(dateMaj)}.
          {crmFictif && " Comptes, statuts et ventes viennent d'un CRM fictif."}
        </Alert.Description>
      </Alert.Content>
      <Pastille {...libelleMode[mode]} />
    </Alert>
  );
}
