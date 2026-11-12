import { Alert, Button } from '@heroui/react';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { useRouter, type ErrorComponentProps } from '@tanstack/react-router';
import { useEffect } from 'react';

export function ErreurPage({ error }: ErrorComponentProps) {
  const router = useRouter();
  const queryErrorResetBoundary = useQueryErrorResetBoundary();

  // Sans ça, la requête en erreur resterait en cache et « Réessayer » échouerait
  useEffect(() => {
    queryErrorResetBoundary.reset();
  }, [queryErrorResetBoundary]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Données indisponibles</h1>
      <Alert status="danger" className="mt-4">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description>
            L'API data ne répond pas. Réessayez dans un instant.
          </Alert.Description>
          {/* Le détail technique n'est montré qu'en dev ; le serveur le journalise */}
          {import.meta.env.DEV && error instanceof Error && (
            <pre className="mt-2 max-w-full overflow-x-auto text-xs whitespace-pre-wrap text-muted">
              {error.message}
            </pre>
          )}
          <Button
            className="mt-3"
            size="sm"
            variant="primary"
            onPress={() => void router.invalidate()}
          >
            Réessayer
          </Button>
        </Alert.Content>
      </Alert>
    </main>
  );
}
