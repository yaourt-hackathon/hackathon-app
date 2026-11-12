import { Card } from '@heroui/react';
import { Link } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { Pastille } from '@/components/Pastille';
import { libelleConfiance } from '@/features/tournee/libelles';
import { resumerProduits, type AppelClient } from '@/features/tournee/tournee';

// Stories 4 et 5 : les clients touchés, classés, avec la raison du classement
// et les produits en cause. Jamais de prospect (docs/produit.md).
export function ListeAppels({
  evenementId,
  appels,
  focus,
}: {
  evenementId: string;
  appels: AppelClient[];
  /** Après « Valider » : le focus va au titre, qui défile à l'écran. */
  focus: boolean;
}) {
  const titre = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focus) titre.current?.focus();
  }, [focus]);

  return (
    <section aria-labelledby="clients" className="mt-10">
      <h2
        id="clients"
        ref={titre}
        tabIndex={-1}
        className="text-2xl font-semibold tracking-tight outline-none"
      >
        Clients à appeler
      </h2>
      <p className="mt-1 text-sm text-muted">
        Du plus touché au moins touché : produits en exposition probable
        d'abord, puis possible.
      </p>
      {appels.length === 0 ? (
        <p className="mt-4">Aucun client à appeler pour cet événement.</p>
      ) : (
        // role="list" : Safari retire la sémantique d'une liste sans puces
        <ol role="list" className="mt-4 flex flex-col gap-3">
          {appels.map((a) => (
            <li key={a.compte_id}>
              <CarteAppel evenementId={evenementId} appel={a} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function CarteAppel({
  evenementId,
  appel,
}: {
  evenementId: string;
  appel: AppelClient;
}) {
  return (
    // Le lien du nom couvre toute la carte (after:inset-0) : un seul arrêt de
    // tabulation, et un clic n'importe où ouvre la raison d'appeler
    <Card className="relative flex-row items-start gap-4 hover:bg-surface-hover has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-focus">
      <span
        className="w-8 shrink-0 text-2xl font-semibold text-muted tabular-nums"
        data-rang={appel.rang}
      >
        {appel.rang}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Card.Header className="flex-row flex-wrap items-center justify-between gap-2">
          <div>
            <Card.Title className="text-lg">
              <Link
                to="/evenements/$evenementId/appels/$compteId"
                params={{ evenementId, compteId: appel.compte_id }}
                className="outline-none after:absolute after:inset-0 after:rounded-[inherit]"
              >
                {appel.nom_compte}
              </Link>
            </Card.Title>
            <Card.Description>
              Suivi par {appel.commercial ?? 'un commercial inconnu'}
            </Card.Description>
          </div>
          <Pastille {...libelleConfiance[appel.confiance]} />
        </Card.Header>
        <Card.Content className="gap-1 text-sm">
          <p>{appel.raison_classement}</p>
          <Produits appel={appel} />
        </Card.Content>
      </div>
    </Card>
  );
}

function Produits({ appel }: { appel: AppelClient }) {
  if (appel.produits === null) {
    return <p className="text-muted">Produits indisponibles.</p>;
  }
  const { produits, autres } = resumerProduits(appel.produits);
  return (
    <ul className="text-muted">
      {produits.map((p) => (
        <li key={p.nom}>
          {p.nom}
          {p.ingredients.length > 0 && ` (${p.ingredients.join(', ')})`}
        </li>
      ))}
      {autres > 0 && (
        <li>
          et {autres} autre{autres > 1 ? 's' : ''} produit
          {autres > 1 ? 's' : ''}
        </li>
      )}
    </ul>
  );
}
