import { Card } from '@heroui/react';
import { buttonVariants } from '@heroui/styles';
import { Link } from '@tanstack/react-router';
import { Pastille } from '@/components/Pastille';
import {
  libelleCritere,
  libelleOrigineReformulation,
} from '@/features/tournee/libelles';
import type { Reformulation } from '@/features/tournee/reformulation/preparees';

// Story 3 : le commercial lit ce que l'outil a compris et le valide avant de
// voir ses clients. L'outil prépare, le commercial valide (docs/produit.md).
export function CarteReformulation({
  evenementId,
  reformulation,
  valide,
}: {
  evenementId: string;
  reformulation: Reformulation | null;
  valide: boolean;
}) {
  return (
    // section : un nom accessible ne se pose pas sur le div de Card
    <section aria-labelledby="reformulation">
      <Card variant="secondary">
        <Card.Header className="gap-2">
          <div className="flex items-center gap-2 text-sm text-muted">
            {reformulation && <Pastille texte="IA" couleur="accent" />}
            <span>Ce que l'outil a compris de l'événement</span>
          </div>
          {/* h2, pas le h3 de Card.Title : la page n'a qu'un h1 au-dessus */}
          <h2 id="reformulation" className="text-xl font-medium">
            {reformulation?.texte ??
              "Aucune reformulation n'est prête pour cet événement."}
          </h2>
        </Card.Header>
        {reformulation && (
          <Card.Content>
            <p className="text-sm text-muted">
              Un produit est retenu si son étiquette liste :
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              {reformulation.criteres.map((c) => (
                <li key={c.texte} className="flex items-start gap-2 text-sm">
                  <Pastille {...libelleCritere[c.type]} />
                  <span>{c.texte}</span>
                </li>
              ))}
            </ul>
          </Card.Content>
        )}
        <Card.Footer className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-muted">
            {reformulation &&
              libelleOrigineReformulation[reformulation.origine]}
          </span>
          {/* Sans reformulation, rien à valider : seulement voir les clients */}
          {valide ? (
            reformulation && <Pastille texte="Validé" couleur="success" />
          ) : (
            // Un lien, pas un état local : recharger garde la validation, Retour
            // l'annule. Pas de retour en haut : la liste apparaît en dessous.
            <Link
              to="/evenements/$evenementId"
              params={{ evenementId }}
              search={{ valide: true }}
              resetScroll={false}
              className={buttonVariants({ variant: 'primary' })}
            >
              {reformulation ? 'Valider' : 'Voir les clients'}
            </Link>
          )}
        </Card.Footer>
      </Card>
    </section>
  );
}
