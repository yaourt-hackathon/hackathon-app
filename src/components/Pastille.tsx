import { Chip } from '@heroui/react';
import type { ChipVariants } from '@heroui/styles';

/** Un libellé et la couleur du thème qui va avec (ADR 0006). */
export interface Libelle {
  texte: string;
  couleur: ChipVariants['color'];
}

export function Pastille({ texte, couleur }: Libelle) {
  return (
    <Chip
      color={couleur}
      size="sm"
      variant="soft"
      className="whitespace-nowrap"
    >
      {texte}
    </Chip>
  );
}
