import { linkVariants } from '@heroui/styles';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { SujetsDuJour } from '@/features/tournee/components/SujetsDuJour';
import { Volet } from '@/features/tournee/components/Volet';
import { evenementsQuery } from '@/features/tournee/queries';

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(evenementsQuery()),
  component: Accueil,
});

function Accueil() {
  const { data } = useSuspenseQuery(evenementsQuery());
  return (
    <>
      <Volet>
        <SujetsDuJour />
      </Volet>
      {/* /marques lit toujours l'API, à jour, et le scénario de démo est figé
          sur une version plus ancienne : en démo, leurs chiffres se
          contrediraient, donc pas de lien (la page reste à son URL) */}
      {data.mode === 'api' && (
        <p className="mx-auto mb-10 max-w-[640px] px-5 text-sm sm:px-8">
          <Link
            to="/marques"
            className={linkVariants().base({ className: 'underline' })}
          >
            Exposition des marques aux allergènes (UE 2023/1545)
          </Link>
        </p>
      )}
    </>
  );
}
