import { Table } from '@heroui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { BandeauFactice } from '@/features/exposition/components/BandeauFactice';
import { Pastille } from '@/components/Pastille';
import { libelleNiveau, libelleUrgence } from '@/features/exposition/libelles';
import { expositionQuery } from '@/features/exposition/queries';

export function DiagnosticMarque({ marque }: { marque: string }) {
  const { data } = useSuspenseQuery(expositionQuery(marque));
  const { source } = data;

  return (
    <section>
      <BandeauFactice factice={data.factice} />
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight capitalize">
          {data.marque}
        </h1>
        <Pastille {...libelleUrgence[data.urgence]} />
      </header>
      <p className="mt-2 text-muted">
        {data.nb_probable} produits en exposition probable, {data.nb_possible}{' '}
        possible, {data.nb_indetermine} indéterminé, {data.nb_non_detecte} non
        détecté, sur {data.nb_produits}.
      </p>

      <Table className="mt-8">
        <Table.ScrollContainer>
          <Table.Content
            aria-label={`Produits de ${data.marque}`}
            className="min-w-[720px]"
          >
            <Table.Header>
              <Table.Column isRowHeader>Produit</Table.Column>
              <Table.Column>Niveau</Table.Column>
              <Table.Column>Substances (nouvelle liste)</Table.Column>
              <Table.Column>Motif</Table.Column>
            </Table.Header>
            <Table.Body items={data.produits}>
              {(p) => (
                <Table.Row id={p.code_barre}>
                  <Table.Cell>{p.nom}</Table.Cell>
                  <Table.Cell>
                    <Pastille {...libelleNiveau[p.niveau]} />
                  </Table.Cell>
                  <Table.Cell>{p.substances.join(', ') || '—'}</Table.Cell>
                  <Table.Cell className="text-muted">{p.motif}</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      <p className="mt-6 text-xs text-muted">
        Règlement {source.reglement}, échéance des produits en rayon le{' '}
        {source.echeance_produits_en_rayon}. Catalogue : {source.catalogue}.
        Données du {data.date_maj}.
      </p>
    </section>
  );
}
