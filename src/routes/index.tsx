import { linkVariants } from '@heroui/styles';
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
  return (
    <>
      <Volet>
        <SujetsDuJour />
      </Volet>
      <p className="mx-auto mb-10 max-w-[640px] px-5 text-sm sm:px-8">
        <Link
          to="/marques"
          className={linkVariants().base({ className: 'underline' })}
        >
          Exposition des marques aux allergènes (UE 2023/1545)
        </Link>
      </p>
    </>
  );
}
