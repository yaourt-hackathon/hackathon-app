import { createFileRoute, Outlet } from '@tanstack/react-router';
import { FournisseurAppelsPasses } from '@/features/tournee/components/AppelsPasses';

// Les écrans d'un sujet partagent les appels marqués comme passés ; changer
// de sujet repart de zéro
export const Route = createFileRoute('/evenements/$evenementId')({
  component: Sujet,
});

function Sujet() {
  const { evenementId } = Route.useParams();
  return (
    <FournisseurAppelsPasses key={evenementId}>
      <Outlet />
    </FournisseurAppelsPasses>
  );
}
