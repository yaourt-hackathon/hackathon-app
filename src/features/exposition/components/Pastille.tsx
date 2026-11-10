interface PastilleProps {
  texte: string;
  classes: string;
}

export function Pastille({ texte, classes }: PastilleProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${classes}`}
    >
      {texte}
    </span>
  );
}
