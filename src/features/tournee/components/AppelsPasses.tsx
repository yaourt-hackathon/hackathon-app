import { createContext, use, useState, type ReactNode } from 'react';
import { basculer } from '@/features/tournee/selection';

interface AppelsPasses {
  passes: ReadonlySet<string>;
  basculer: (compteId: string) => void;
}

const Contexte = createContext<AppelsPasses | null>(null);

/**
 * « Marquer comme appelé », partagé par la liste et les fiches d'un sujet.
 * Local : perdu au rechargement, rien n'est écrit dans Pegasus en démo.
 */
export function FournisseurAppelsPasses({ children }: { children: ReactNode }) {
  const [passes, setPasses] = useState<ReadonlySet<string>>(new Set());
  return (
    <Contexte
      value={{
        passes,
        basculer: (compteId) => setPasses((p) => basculer(p, compteId)),
      }}
    >
      {children}
    </Contexte>
  );
}

export function useAppelsPasses(): AppelsPasses {
  const contexte = use(Contexte);
  if (!contexte) throw new Error('FournisseurAppelsPasses manque autour');
  return contexte;
}
