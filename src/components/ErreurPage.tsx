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
      <p className="mt-2 text-stone-600">
        L'API data ne répond pas. Réessayez dans un instant.
      </p>
      {/* Le détail technique n'est montré qu'en dev ; le serveur le journalise */}
      {import.meta.env.DEV && error instanceof Error && (
        <pre className="mt-4 overflow-x-auto text-xs whitespace-pre-wrap text-stone-500">
          {error.message}
        </pre>
      )}
      <button
        type="button"
        onClick={() => void router.invalidate()}
        className="mt-6 rounded-md bg-stone-900 px-4 py-2 text-sm text-white"
      >
        Réessayer
      </button>
    </main>
  );
}
