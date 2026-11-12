import { queryOptions } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import {
  lireTournee,
  listerEvenements,
} from '@/features/tournee/tournee.server';

// Server functions : la source de données (ADR 0008) ne quitte pas le serveur
const getEvenements = createServerFn({ method: 'GET' }).handler(() =>
  listerEvenements(),
);

const getTournee = createServerFn({ method: 'GET' })
  .validator(z.object({ evenementId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const tournee = await lireTournee(data.evenementId);
    if (tournee === null) throw notFound();
    return tournee;
  });

export const evenementsQuery = () =>
  queryOptions({
    queryKey: ['evenements'],
    queryFn: () => getEvenements(),
  });

export const tourneeQuery = (evenementId: string) =>
  queryOptions({
    queryKey: ['evenement', evenementId],
    queryFn: () => getTournee({ data: { evenementId } }),
  });
