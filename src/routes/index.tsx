import { createFileRoute } from '@tanstack/react-router';
import { SujetsDuJour } from '@/features/tournee/components/SujetsDuJour';
import { evenementsQuery } from '@/features/tournee/queries';

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(evenementsQuery()),
  component: SujetsDuJour,
});
