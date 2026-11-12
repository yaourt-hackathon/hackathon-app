import { describe, expect, it } from 'vitest';
import {
  libelleMode,
  libelleOrigine,
  libelleStatut,
  libelleType,
} from '@/features/tournee/libelles';

describe('libelleType', () => {
  it.each([
    ['reglementation', 'Réglementation'],
    ['matiere_premiere', 'Matière première'],
    ['concurrence', 'Concurrence'],
    ['nouveau_type', 'Nouveau type'],
  ])('%s → %s', (type, texte) => {
    expect(libelleType(type)).toBe(texte);
  });
});

describe('libelleStatut', () => {
  it("dit qu'un événement d'essai est fictif", () => {
    expect(libelleStatut.test.texte).toBe('Événement fictif');
    expect(libelleStatut.valide.texte).toBe('Fait réel');
  });
});

describe('libelleMode', () => {
  it("distingue la démo de l'API", () => {
    expect(libelleMode.demo.texte).toBe('Données de démo');
    expect(libelleMode.api.texte).toBe('API data');
  });
});

describe('libelleOrigine', () => {
  it("dit qui a écrit le texte, l'IA seulement si une personne l'a relu", () => {
    expect(libelleOrigine.preparee).toBe("Texte préparé par l'équipe");
    expect(libelleOrigine.llm_valide).toContain('relu par une personne');
  });
});
