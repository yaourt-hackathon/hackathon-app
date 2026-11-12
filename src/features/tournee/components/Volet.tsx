import { IconChevronLeft } from '@heroui/react';
import { buttonVariants } from '@heroui/styles';
import { Link } from '@tanstack/react-router';
import type { ReactNode, Ref } from 'react';

/**
 * Le volet de 640 px de la maquette : ce que le commercial verrait ouvert à
 * côté de Pegasus. Plein écran sur téléphone.
 */
export function Volet({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-[640px] flex-col gap-5 bg-surface px-5 pt-7 pb-9 sm:my-10 sm:rounded-[20px] sm:px-8">
      {children}
    </main>
  );
}

/** Le titre du volet, sur deux lignes : l'objet, puis ce qu'on en sait. */
export function TitreVolet({
  titre,
  sousTitre,
  titreRef,
}: {
  titre: string;
  sousTitre: string;
  /** Pour y mettre le focus (tabIndex -1) après une action. */
  titreRef?: Ref<HTMLHeadingElement>;
}) {
  return (
    <header className="text-[28px] leading-[34px] font-medium">
      <h1 ref={titreRef} tabIndex={-1} className="outline-none">
        {titre}
      </h1>
      <p className="mt-1 text-muted">{sousTitre}</p>
    </header>
  );
}

/** Retour à l'accueil (sujets du jour), lien du router habillé en bouton. */
export function RetourAccueil() {
  return (
    <div>
      <Link
        to="/"
        className={buttonVariants({
          variant: 'tertiary',
          size: 'sm',
          className: 'gap-1',
        })}
      >
        <IconChevronLeft aria-hidden="true" className="size-4" />
        Accueil
      </Link>
    </div>
  );
}

/** Une section titrée du volet : « Ce qui change », « Chez vos clients »… */
export function Section({
  titre,
  children,
}: {
  titre: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-1.5 border-t border-border py-3.5 first:border-t-0">
      <h2 className="text-[15px] leading-6 font-medium">{titre}</h2>
      <div className="flex flex-col gap-2.5 text-[15px] leading-6">
        {children}
      </div>
    </section>
  );
}
