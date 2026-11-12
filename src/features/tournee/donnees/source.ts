import type {
  Compte,
  ListeAppels,
  ListeEvenements,
} from '@/lib/data-api/generated';

/** `demo` : scénario embarqué dans l'app. `api` : API data (ADR 0008). */
export type ModeDonnees = 'demo' | 'api';

/**
 * Ce que l'app lit, aux formes de l'API data. Chaque adaptateur ne fait que
 * fournir ces réponses : filtres, jointures et tris vivent hors d'ici, une fois
 * pour les deux modes. `null` : ressource inconnue (404).
 */
export interface SourceDonnees {
  mode: ModeDonnees;
  evenements(): Promise<ListeEvenements>;
  appels(evenementId: string): Promise<ListeAppels | null>;
  compte(compteId: string): Promise<Compte | null>;
  /**
   * Listes d'ingrédients des étiquettes (INCI), par code-barres, pour celles
   * que la source connaît. L'API data ne les expose pas encore (data#4).
   */
  etiquettes(codes: readonly string[]): Promise<Record<string, string>>;
}
