import { Alert, Table } from '@heroui/react';
import { Pastille } from '@/components/Pastille';
import { libelleNiveau } from '@/features/tournee/libelles';
import type { ProduitTouche } from '@/lib/data-api/generated';

export function ProduitsTouches({
  nomCompte,
  produits,
}: {
  nomCompte: string;
  produits: ProduitTouche[] | null;
}) {
  return (
    <section aria-labelledby="produits">
      <h2 id="produits" className="text-xl font-semibold">
        Produits touchés
      </h2>
      <p className="mt-1 text-sm text-muted">
        D'après l'étiquette publique des produits : les concentrations ne sont
        pas connues.
      </p>
      {produits === null ? (
        <Alert status="warning" className="mt-4">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Produits indisponibles</Alert.Title>
            <Alert.Description>
              La fiche de ce compte manque à la source de données.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      ) : (
        <Table className="mt-4">
          <Table.ScrollContainer>
            <Table.Content
              aria-label={`Produits de ${nomCompte} touchés par l'événement`}
              className="min-w-[640px]"
            >
              <Table.Header>
                <Table.Column isRowHeader>Produit</Table.Column>
                <Table.Column>Niveau</Table.Column>
                <Table.Column>Ingrédients visés</Table.Column>
                <Table.Column>Ingrédients proches</Table.Column>
              </Table.Header>
              <Table.Body items={produits}>
                {(p) => (
                  <Table.Row id={p.code_barre}>
                    <Table.Cell>{p.nom}</Table.Cell>
                    <Table.Cell>
                      <Pastille {...libelleNiveau[p.niveau]} />
                    </Table.Cell>
                    <Table.Cell>
                      {p.elements_directs.join(', ') || '—'}
                    </Table.Cell>
                    <Table.Cell className="text-muted">
                      {p.elements_indices.join(', ') || '—'}
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      )}
    </section>
  );
}
