// Story 3 : l'outil explique l'événement et ce qu'il a cherché chez les
// clients ; le commercial relit, puis choisit les clients (écran « Sujet »
// de la maquette v6). En attendant l'API ou un LLM, ces textes sont préparés
// par l'équipe, un par événement (scénario et API). Les nombres (produits,
// clients) ne sont pas écrits ici : l'écran les calcule sur les données.

/** Un argument à avoir sous la main pendant l'appel, avec son repère. */
export interface Argument {
  texte: string;
  /** D'où vient le fait : « Règlement (UE) 2023/1545 », « Veille fictive… ». */
  repere: string;
}

export interface Reformulation {
  /** « Compris : … » : la reformulation que le commercial valide. */
  texte: string;
  /** Ingrédients cherchés sur les étiquettes, en noms INCI. */
  ingredients: string[];
  /**
   * Repèrent ces ingrédients dans une liste INCI : chaque motif est une suite
   * de fragments en minuscules, tous présents (« citrus oil »).
   */
  motifs: string[];
  /** Une phrase pour la carte de l'accueil. */
  accroche: string;
  ceQuiChange: string;
  pourquoiMaintenant: string;
  aVerifier: string;
  /** Arguments sur l'événement, communs à tous les clients. */
  arguments: Argument[];
  /** Questions pour relancer l'échange. */
  pourRelancer: string[];
  /** Qui a écrit le texte : l'équipe aujourd'hui, l'API ou un LLM demain. */
  origine: 'preparee' | 'api' | 'llm';
}

const VEILLE_FICTIVE = 'Veille fictive (équipe Yaourt)';

export const preparees: Record<string, Omit<Reformulation, 'origine'>> = {
  'EVT-001': {
    texte:
      'Compris : produits qui listent un des allergènes de parfum ajoutés par le règlement (UE) 2023/1545',
    // Les huiles essentielles que l'API data repère pour EVT-001 (ses faits
    // citent aussi bergamote, cèdre et géranium)
    ingredients: [
      'Lavandula Angustifolia Oil',
      'Citrus Limon Peel Oil',
      'Citrus Aurantium Dulcis Peel Oil',
      'Citrus Aurantium Bergamia Peel Oil',
      'Rosa Damascena Flower Oil',
      'Mentha Piperita Oil',
      'Cananga Odorata Flower Oil',
      'Pelargonium Graveolens Oil',
      'Cedrus Atlantica Bark Oil',
    ],
    motifs: [
      'lavand oil',
      'citrus oil',
      'rosa damascena oil',
      'mentha oil',
      'cananga oil',
      'pelargonium oil',
      'cedrus oil',
    ],
    accroche:
      "L'étiquette des cosmétiques devra déclarer davantage d'allergènes de parfum.",
    ceQuiChange:
      "Le règlement (UE) 2023/1545 allonge la liste des allergènes de parfum à déclarer sur l'étiquette, au-delà d'un seuil. Les produits déjà en vente ont jusqu'au 31 juillet 2028 pour l'appliquer.",
    pourquoiMaintenant:
      "Chaque client devra choisir entre compléter l'étiquette et revoir le parfum. Celui qui lui pose la question le premier entre dans la discussion avant le brief.",
    aVerifier:
      "Une étiquette ne donne pas les concentrations, d'où le « probablement » : l'allergène ne se déclare qu'au-delà d'un seuil. La liste exacte reste à vérifier dans le texte du règlement.",
    arguments: [
      {
        texte:
          "La liste des allergènes de parfum à déclarer sur l'étiquette s'allonge.",
        repere: 'Règlement (UE) 2023/1545',
      },
      {
        texte:
          "Les produits déjà en vente ont jusqu'au 31 juillet 2028 pour l'appliquer.",
        repere: 'Règlement (UE) 2023/1545',
      },
    ],
    pourRelancer: [
      "Qui décide chez vous de l'étiquetage ?",
      'Quels produits voulez-vous traiter en premier ?',
    ],
  },
  'EVT-002': {
    texte: 'Compris : produits qui listent de la bergamote',
    ingredients: ['Citrus Aurantium Bergamia Peel Oil'],
    motifs: ['bergamia oil', 'bergamot oil'],
    accroche:
      "Événement d'essai de l'équipe data : une tension sur l'huile essentielle de bergamote.",
    ceQuiChange:
      "Événement d'essai de l'équipe data : une tension sur l'huile essentielle de bergamote. Il ne décrit aucun fait réel.",
    pourquoiMaintenant:
      "C'est un événement d'essai : il vérifie que la chaîne accepte un deuxième événement.",
    aVerifier: "Tout : c'est un événement d'essai.",
    arguments: [],
    pourRelancer: ['Avez-vous des produits aux agrumes en préparation ?'],
  },
  'DEMO-01': {
    texte: 'Compris : produits contenant de la lavande naturelle',
    ingredients: [
      'Lavandula Angustifolia Oil',
      'Lavandula Hybrida Oil',
      'Lavandula Angustifolia Flower Water',
      'Lavandula Angustifolia Extract',
    ],
    // Huile, eau florale et extrait : tout ce qui vient de la lavande
    motifs: ['lavand', 'lavender'],
    accroche:
      "Une récolte de lavande en baisse ferait monter le prix de l'huile essentielle et allonger les délais.",
    ceQuiChange:
      "Une récolte de lavande en baisse en Provence ferait monter le prix de l'huile essentielle et allonger les délais de livraison. L'événement est inventé pour la démonstration.",
    pourquoiMaintenant:
      "Les clients qui vendent des produits à la lavande vont voir bouger leurs coûts ou leurs délais. En parler avant leur prochaine commande, c'est connaître leurs besoins avant l'appel d'offres.",
    aVerifier:
      "L'événement est inventé pour la démo. Une étiquette ne dit ni quelle quantité de lavande le produit contient, ni d'où elle vient.",
    arguments: [
      {
        texte: 'La récolte de lavande serait en baisse cette année.',
        repere: VEILLE_FICTIVE,
      },
    ],
    pourRelancer: [
      "Qui gère vos achats d'huiles essentielles ?",
      'Avez-vous une marge de stock sur vos produits à la lavande ?',
    ],
  },
  'DEMO-02': {
    texte: 'Compris : produits à la rose, face à la nouvelle gamme',
    ingredients: [
      'Rosa Damascena Flower Water',
      'Rosa Damascena Flower Oil',
      'Rosa Damascena Flower Extract',
      'Geraniol',
      'Citronellol',
    ],
    motifs: ['rosa damascena', 'geraniol', 'citronellol'],
    accroche:
      'Une marque concurrente lancerait en grande surface une gamme de soins visage à la rose de Damas.',
    ceQuiChange:
      "Une marque concurrente lancerait une gamme de soins visage à la rose de Damas, en grande surface. L'événement est inventé pour la démonstration.",
    pourquoiMaintenant:
      'Vos clients qui vendent des soins à la rose vont devoir se démarquer. Le premier à en parler avec eux entend leurs projets avant le brief.',
    aVerifier:
      "L'événement est inventé pour la démo. Le géraniol et le citronellol sentent la rose mais se trouvent aussi ailleurs : ces produits ne sont que « possibles ».",
    arguments: [
      {
        texte:
          'Une marque concurrente lancerait une gamme de soins à la rose de Damas en grande surface.',
        repere: VEILLE_FICTIVE,
      },
    ],
    pourRelancer: [
      'La rose fait-elle partie de vos prochains lancements ?',
      "Qu'est-ce qui distingue vos soins à la rose de ceux de la grande surface ?",
    ],
  },
};
