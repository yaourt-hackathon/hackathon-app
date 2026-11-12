import { queryOptions } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import {
  lireReformulation,
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

const getReformulation = createServerFn({ method: 'GET' })
  .validator(z.object({ evenementId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const reformulation = await lireReformulation(data.evenementId);
    if (reformulation === undefined) throw notFound();
    return reformulation;
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

export const reformulationQuery = (evenementId: string) =>
  queryOptions({
    queryKey: ['evenement', evenementId, 'reformulation'],
    queryFn: () => getReformulation({ data: { evenementId } }),
  });
