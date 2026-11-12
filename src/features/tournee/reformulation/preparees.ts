// Story 3 : l'outil reformule l'événement en critères sur les produits, et le
// commercial valide avant la recherche. En attendant l'API ou un LLM, ces
// textes sont préparés par l'équipe, un par événement (scénario et API).

export interface Critere {
  /** direct : ingrédient visé ; indice : ingrédient proche, plus faible. */
  type: 'direct' | 'indice';
  texte: string;
}

export interface Reformulation {
  texte: string;
  criteres: Critere[];
  /** Qui a écrit le texte : l'équipe aujourd'hui, l'API ou un LLM demain. */
  origine: 'preparee' | 'api' | 'llm';
}

export const preparees: Record<string, Omit<Reformulation, 'origine'>> = {
  'EVT-001': {
    texte:
      'Compris : produits qui listent un des allergènes de parfum ajoutés par le règlement (UE) 2023/1545',
    criteres: [
      {
        type: 'direct',
        texte:
          "Une huile essentielle visée, lue sur l'étiquette : lavande, citron, orange, rose, menthe, ylang-ylang…",
      },
      {
        type: 'indice',
        texte:
          "Une molécule proche, lue sur l'étiquette : linalool, limonene, géraniol, citronellol…",
      },
    ],
  },
  'EVT-002': {
    texte: 'Compris : produits qui listent de la bergamote',
    criteres: [
      {
        type: 'direct',
        texte:
          "De l'huile essentielle de bergamote, lue sur l'étiquette (Citrus aurantium bergamia)",
      },
    ],
  },
  'DEMO-01': {
    texte: 'Compris : produits contenant de la lavande naturelle',
    criteres: [
      {
        type: 'direct',
        texte:
          "De l'huile essentielle de lavande ou de lavandin, lue sur l'étiquette (Lavandula… oil)",
      },
      {
        type: 'indice',
        texte: "De l'eau florale ou un extrait de lavande, lus sur l'étiquette",
      },
    ],
  },
  'DEMO-02': {
    texte: 'Compris : produits à la rose, face à la nouvelle gamme',
    criteres: [
      {
        type: 'direct',
        texte:
          "De l'eau florale, de l'huile ou un extrait de rose, lus sur l'étiquette (Rosa damascena…)",
      },
      {
        type: 'indice',
        texte:
          "Du géraniol ou du citronellol, deux molécules à l'odeur de rose",
      },
    ],
  },
};
