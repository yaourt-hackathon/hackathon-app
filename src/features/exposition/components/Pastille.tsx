import { Chip } from '@heroui/react';
import type { Libelle } from '@/features/exposition/libelles';

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
