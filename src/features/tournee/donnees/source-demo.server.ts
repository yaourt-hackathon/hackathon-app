import type {
  Appel,
  Compte,
  ListeAppels,
  ListeEvenements,
  ProduitTouche,
} from '@/lib/data-api/generated';
import { scenario } from '@/features/tournee/donnees/scenario.server';
import type { SourceDonnees } from '@/features/tournee/donnees/source';

// Assemble, depuis le scénario, les réponses que donnerait l'API data. Aucune
// règle métier ici : seulement des recherches par id et des jointures de forme.

type AppelScenario = (typeof scenario.appels)[number];

const parCodePoint = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

// Comme l'API : `cpt-001` désigne `CPT-001`
const memeId = (a: string, b: string) => a.toUpperCase() === b.toUpperCase();

function trouver<T>(liste: readonly T[], predicat: (x: T) => boolean): T {
  const element = liste.find(predicat);
  if (element === undefined) {
    throw new Error('Scénario de démo incohérent : référence introuvable');
  }
  return element;
}

const evenementDe = (id: string) =>
  trouver(scenario.evenements, (e) => e.evenement_id === id);
const compteDe = (id: string) =>
  trouver(scenario.comptes, (c) => c.compte_id === id);
const appelsDe = (evenementId: string) =>
  scenario.appels.filter((a) => a.evenement_id === evenementId);

const avecNbComptes = (evenement: (typeof scenario.evenements)[number]) => ({
  ...evenement,
  nb_comptes_a_appeler: appelsDe(evenement.evenement_id).length,
});

function versAppel(appel: AppelScenario): Appel {
  const compte = compteDe(appel.compte_id);
  return {
    rang: appel.rang,
    compte_id: appel.compte_id,
    nom_compte: compte.nom_compte,
    statut: compte.statut,
    score: appel.score,
    raison_classement: appel.raison_classement,
    fait: appel.fait,
    question: appel.question,
    origine_textes: appel.origine_textes,
    nb_produits_analyses: compte.nb_produits_analyses,
    nb_probable: appel.nb_probable,
    nb_possible: appel.nb_possible,
    part_probable: appel.part_probable,
    confiance: appel.confiance,
  };
}

function versProduits(appel: AppelScenario): ProduitTouche[] {
  return appel.produits.map((p) => ({
    ...trouver(scenario.produits, (q) => q.code_barre === p.code_barre),
    ...p,
  }));
}

function evenements(): ListeEvenements {
  return {
    date_maj: scenario.date_maj,
    evenements: scenario.evenements.map(avecNbComptes),
  };
}

function appels(evenementId: string): ListeAppels | null {
  const evenement = scenario.evenements.find((e) =>
    memeId(e.evenement_id, evenementId),
  );
  if (evenement === undefined) return null;
  // Comme l'API : chaque groupe par rang
  const liste = appelsDe(evenement.evenement_id)
    .map(versAppel)
    .sort((a, b) => a.rang - b.rang);
  return {
    date_maj: scenario.date_maj,
    crm_fictif: true,
    evenement: avecNbComptes(evenement),
    clients: liste.filter((a) => a.statut === 'client'),
    prospects: liste.filter((a) => a.statut === 'prospect'),
  };
}

function compte(compteId: string): Compte | null {
  const fiche = scenario.comptes.find((c) => memeId(c.compte_id, compteId));
  if (fiche === undefined) return null;
  return {
    date_maj: scenario.date_maj,
    crm_fictif: true,
    ...fiche,
    // Comme l'API (sorted de Python) : par id d'événement, point de code
    evenements: scenario.appels
      .filter((a) => a.compte_id === fiche.compte_id)
      .sort((a, b) => parCodePoint(a.evenement_id, b.evenement_id))
      .map((a) => ({
        evenement_id: a.evenement_id,
        titre: evenementDe(a.evenement_id).titre,
        rang: a.rang,
        score: a.score,
        fait: a.fait,
        question: a.question,
        produits: versProduits(a),
      })),
  };
}

// Copies : un appelant ne peut pas modifier le scénario, partagé par toutes
// les requêtes du serveur
export const sourceDemo: SourceDonnees = {
  mode: 'demo',
  evenements: () => Promise.resolve(structuredClone(evenements())),
  appels: (evenementId) =>
    Promise.resolve(structuredClone(appels(evenementId))),
  compte: (compteId) => Promise.resolve(structuredClone(compte(compteId))),
};
