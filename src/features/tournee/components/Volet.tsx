import { IconChevronLeft, Tabs } from '@heroui/react';
import { buttonVariants } from '@heroui/styles';
import { createLink } from '@tanstack/react-router';
import type {
  AnchorHTMLAttributes,
  ComponentProps,
  ReactNode,
  Ref,
} from 'react';

/**
 * Le volet de 640 px de la maquette v6 : ce que le commercial verrait ouvert à
 * côté de Pegasus. Il fait la hauteur de l'écran, donc la page ne défile
 * jamais : l'en-tête et les actions restent en place, seul le contenu défile.
 */
export function Volet({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex h-dvh w-full max-w-[640px] flex-col bg-surface">
      {children}
    </main>
  );
}

/**
 * L'en-tête du volet : le retour et ce qui se lit à sa droite, puis le titre
 * sur deux lignes, l'objet et ce qu'on en sait.
 */
export function EnTete({
  titre,
  sousTitre,
  titreRef,
  retour,
  aDroite,
  children,
}: {
  titre: string;
  sousTitre: string;
  /** Pour y mettre le focus (tabIndex -1) après une action. */
  titreRef?: Ref<HTMLHeadingElement>;
  retour?: ReactNode;
  aDroite?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="flex shrink-0 flex-col gap-3.5 px-6 pt-5 pb-4">
      {(retour ?? aDroite) && (
        <div className="flex min-h-8 items-center justify-between gap-3">
          {retour ?? <span />}
          {aDroite}
        </div>
      )}
      <div className="text-[22px] leading-7 font-medium">
        <h1 ref={titreRef} tabIndex={-1} className="outline-none">
          {titre}
        </h1>
        <p className="mt-0.5 text-muted">{sousTitre}</p>
      </div>
      {children}
    </header>
  );
}

/** Ce qui défile, entre l'en-tête et les actions. */
export function Contenu({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-6 pb-4">
      {children}
    </div>
  );
}

/** Les actions de l'écran, fixes en bas du volet. */
export function Actions({ children }: { children: ReactNode }) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border px-6 py-3.5">
      {children}
    </div>
  );
}

/** Le retour en haut à gauche : un lien du router habillé en bouton. */
export const Retour = createLink(function Retour({
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  ref?: Ref<HTMLAnchorElement>;
}) {
  return (
    <a
      {...props}
      className={buttonVariants({
        variant: 'secondary',
        size: 'sm',
        className: 'gap-1',
      })}
    >
      <IconChevronLeft aria-hidden="true" className="size-4" />
      {children}
    </a>
  );
});

/** Une section titrée d'un onglet : « Ce qui change », « Chez vos clients »… */
export function Section({
  titre,
  children,
}: {
  titre: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-1.5 py-4 text-sm leading-[21px] first:pt-0 last:pb-0">
      <h2 className="font-medium">{titre}</h2>
      {children}
    </section>
  );
}

/** Des sections séparées par un filet. */
export function Sections({ children }: { children: ReactNode }) {
  return <div className="flex flex-col divide-y divide-border">{children}</div>;
}

/** Les onglets de la maquette : à gauche, à la largeur de leur texte. */
export function Onglets({
  label,
  onglets,
  children,
}: {
  label: string;
  onglets: { id: string; titre: string }[];
  /** Un `Onglet` par onglet, même `id`. */
  children: ReactNode;
}) {
  return (
    <Tabs className="gap-4">
      <Tabs.ListContainer className="w-fit max-w-full">
        <Tabs.List aria-label={label}>
          {onglets.map((o) => (
            <Tabs.Tab key={o.id} id={o.id} className="px-3 whitespace-nowrap">
              {o.titre}
              <Tabs.Indicator />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
      {children}
    </Tabs>
  );
}

/** Le contenu d'un onglet, aligné sur le reste du volet. */
export function Onglet(props: ComponentProps<typeof Tabs.Panel>) {
  return <Tabs.Panel className="p-0" {...props} />;
}
