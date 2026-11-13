import {
  Button,
  Checkbox,
  CheckboxGroup,
  Chip,
  Description,
} from '@heroui/react';
import { buttonVariants } from '@heroui/styles';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ingredientsEnCause, raisonCourte } from '@/features/tournee/appel';
import {
  Actions,
  Contenu,
  EnTete,
  Retour,
  Volet,
} from '@/features/tournee/components/Volet';
import { PiedDonnees } from '@/features/tournee/components/PiedDonnees';
import { compter } from '@/features/tournee/format';
import { tourneeQuery } from '@/features/tournee/queries';
import { appelsChoisis, parametreClients } from '@/features/tournee/selection';

// Écran « Choisir les clients » de la maquette v6 : le commercial garde ceux
// qu'il appelle, puis la liste d'appels se génère sur ce choix
export function ChoixClients({
  evenementId,
  clients,
}: {
  evenementId: string;
  /** Le choix précédent (« Modifier la sélection »), absent : tous. */
  clients: string | undefined;
}) {
  const { data: tournee } = useSuspenseQuery(tourneeQuery(evenementId));
  const { appels } = tournee;
  const [choisis, setChoisis] = useState(() =>
    appelsChoisis(appels, clients).map((a) => a.compte_id),
  );
  const nb = choisis.length;
  const pluriel = nb > 1 ? 's' : '';

  return (
    <Volet>
      <EnTete
        retour={
          <Retour to="/evenements/$evenementId" params={{ evenementId }}>
            Sujet
          </Retour>
        }
        titre={`${compter(appels.length, 'client')} concerné${
          appels.length > 1 ? 's' : ''
        }`}
        sousTitre="Choisissez ceux que vous appelez"
      />
      <Contenu>
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-border py-2">
            <Checkbox
              isSelected={nb === appels.length}
              isIndeterminate={nb > 0 && nb < appels.length}
              onChange={(tous) =>
                setChoisis(tous ? appels.map((a) => a.compte_id) : [])
              }
            >
              <Checkbox.Content className="text-sm font-medium">
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                Tout sélectionner
              </Checkbox.Content>
            </Checkbox>
            <p aria-live="polite" className="text-[13px] text-muted">
              {`${nb} sélectionné${pluriel} sur ${appels.length}`}
            </p>
          </div>
          <CheckboxGroup
            aria-label="Clients à appeler"
            value={choisis}
            onChange={setChoisis}
            className="flex flex-col gap-0 divide-y divide-border"
          >
            {appels.map((appel) => (
              <div
                key={appel.compte_id}
                className="flex items-center gap-3 py-2.5"
              >
                <Checkbox
                  value={appel.compte_id}
                  className="mt-0 min-w-0 flex-1"
                >
                  <Checkbox.Content className="text-sm font-medium">
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    {appel.nom_compte}
                  </Checkbox.Content>
                  <Description className="ps-7 text-sm text-muted">
                    {raisonCourte(appel, appels)}
                  </Description>
                </Checkbox>
                {appel.produits && appel.produits.length > 0 && (
                  <Chip color="accent" variant="soft" size="sm">
                    {ingredientsEnCause(appel.produits)}
                  </Chip>
                )}
              </div>
            ))}
          </CheckboxGroup>
        </div>
        <PiedDonnees
          mode={tournee.mode}
          dateMaj={tournee.date_maj}
          crmFictif={tournee.crm_fictif}
        />
      </Contenu>
      <Actions>
        <p className="text-[13px] text-muted">
          {nb === 0
            ? 'Choisissez au moins un client'
            : `${compter(nb, 'appel')} ${nb > 1 ? 'seront préparés' : 'sera préparé'}`}
        </p>
        {nb > 0 ? (
          <Link
            to="/evenements/$evenementId/appels"
            params={{ evenementId }}
            search={{ clients: parametreClients(appels, choisis) }}
            className={buttonVariants({ variant: 'primary' })}
          >
            Générer la liste d'appels
          </Link>
        ) : (
          <Button variant="primary" isDisabled>
            Générer la liste d'appels
          </Button>
        )}
      </Actions>
    </Volet>
  );
}
