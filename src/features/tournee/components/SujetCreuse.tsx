import { Chip, ExternalLinkIcon } from '@heroui/react';
import { buttonVariants } from '@heroui/styles';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Pastille } from '@/components/Pastille';
import { PiedDonnees } from '@/features/tournee/components/PiedDonnees';
import {
  Actions,
  Contenu,
  EnTete,
  Onglet,
  Onglets,
  Retour,
  Section,
  Sections,
  Volet,
} from '@/features/tournee/components/Volet';
import { compter } from '@/features/tournee/format';
import {
  libelleOrigineReformulation,
  libelleStatut,
} from '@/features/tournee/libelles';
import { reformulationQuery, tourneeQuery } from '@/features/tournee/queries';
import { chiffresTournee } from '@/features/tournee/tournee';

// Story 3, écran « Sujet » de la maquette v6 : l'outil dit ce qu'il a compris
// et trouvé ; le commercial relit, puis choisit les clients à appeler.
export function SujetCreuse({ evenementId }: { evenementId: string }) {
  const { data: tournee } = useSuspenseQuery(tourneeQuery(evenementId));
  const { data: reformulation } = useSuspenseQuery(
    reformulationQuery(evenementId),
  );
  const { evenement } = tournee;
  const chiffres = chiffresTournee(tournee.appels);

  return (
    <Volet>
      <EnTete
        retour={<Retour to="/">Accueil</Retour>}
        aDroite={<Pastille {...libelleStatut[evenement.statut_validation]} />}
        titre={evenement.titre}
        sousTitre={`${compter(chiffres.nb_produits_touches, 'produit')} ${
          chiffres.nb_produits_touches > 1 ? 'touchés' : 'touché'
        } chez ${chiffres.nb_clients} de vos clients`}
      />
      <Contenu>
        <Onglets
          label="Le sujet"
          onglets={[
            { id: 'essentiel', titre: "L'essentiel" },
            { id: 'lu', titre: "Ce que l'IA a lu" },
            { id: 'verifier', titre: 'À vérifier' },
          ]}
        >
          <Onglet id="essentiel">
            <Sections>
              <Section titre="Ce qui change">
                <p>{reformulation?.ceQuiChange ?? evenement.resume}</p>
              </Section>
              <Section titre="Chez vos clients">
                <p>
                  {!chiffres.plus_touche
                    ? 'Aucun produit de vos clients ne liste ces ingrédients.'
                    : chiffres.nb_clients === 1
                      ? `${compter(chiffres.nb_produits_touches, 'produit')} chez ${chiffres.plus_touche.nom}.`
                      : `${compter(chiffres.nb_produits_touches, 'produit')} chez ${
                          chiffres.nb_clients
                        } clients, dont ${chiffres.plus_touche.nb_produits} chez ${chiffres.plus_touche.nom}.`}
                </p>
              </Section>
              {reformulation && (
                <Section titre="Pourquoi appeler maintenant">
                  <p>{reformulation.pourquoiMaintenant}</p>
                </Section>
              )}
            </Sections>
          </Onglet>
          <Onglet id="lu">
            <Sections>
              <Section titre="Ce que l'IA a lu">
                <p>
                  {evenement.source_nom},{' '}
                  {compter(chiffres.nb_produits_analyses, 'étiquette')} de
                  produits et la liste de vos clients actuels.
                </p>
                {evenement.source_url && (
                  <div>
                    <a
                      href={evenement.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({
                        variant: 'secondary',
                        size: 'sm',
                        className: 'gap-1',
                      })}
                    >
                      Ouvrir la source
                      <ExternalLinkIcon aria-hidden="true" className="size-4" />
                    </a>
                  </div>
                )}
              </Section>
              {reformulation && (
                <Section titre="Ce que l'IA a cherché">
                  <p>
                    {reformulation.texte}. Elle a comparé ces ingrédients aux
                    étiquettes des produits de vos clients actuels.
                  </p>
                  <ul
                    aria-label="Ingrédients cherchés"
                    className="flex flex-wrap gap-1.5"
                  >
                    {reformulation.ingredients.map((i) => (
                      <li key={i}>
                        <Chip color="warning" variant="soft" size="sm">
                          {i}
                        </Chip>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </Sections>
          </Onglet>
          <Onglet id="verifier">
            <Sections>
              <Section titre="Ce qui reste à vérifier">
                <p>
                  {reformulation?.aVerifier ??
                    "Aucune analyse n'est prête pour ce sujet : les clients restent à vérifier."}
                </p>
              </Section>
            </Sections>
          </Onglet>
        </Onglets>
        {/* L'outil prépare, le commercial valide chaque sortie (docs/produit.md) */}
        {reformulation && (
          <p className="text-xs text-muted">
            {libelleOrigineReformulation[reformulation.origine]}
          </p>
        )}
        <PiedDonnees
          mode={tournee.mode}
          dateMaj={tournee.date_maj}
          crmFictif={tournee.crm_fictif}
        />
      </Contenu>
      {/* « Corriger » (discuter du sujet avec l'IA) viendra plus tard : Could */}
      <Actions>
        <Link to="/" className={buttonVariants({ variant: 'ghost' })}>
          Retour aux événements
        </Link>
        {chiffres.nb_clients > 0 && (
          <Link
            to="/evenements/$evenementId/clients"
            params={{ evenementId }}
            className={buttonVariants({ variant: 'primary' })}
          >
            Choisir les clients
          </Link>
        )}
      </Actions>
    </Volet>
  );
}
