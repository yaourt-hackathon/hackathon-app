import { describe, expect, it, vi } from 'vitest';
import { copier } from '@/features/tournee/presse-papiers';

describe('copier', () => {
  it('écrit le texte dans le presse-papiers', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    await expect(copier('Bonjour', { writeText })).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('Bonjour');
  });

  it('renvoie false sans presse-papiers (http hors localhost)', async () => {
    await expect(copier('Bonjour', undefined)).resolves.toBe(false);
  });

  it("renvoie false quand le navigateur refuse l'écriture", async () => {
    const writeText = vi.fn().mockRejectedValue(new DOMException('refusé'));
    await expect(copier('Bonjour', { writeText })).resolves.toBe(false);
  });
});
