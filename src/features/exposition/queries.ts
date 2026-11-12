import { queryOptions } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import {
  lireExposition,
  listerMarques,
} from '@/features/exposition/exposition.server';

// Server functions : exécutées sur le serveur, appelées en RPC depuis le navigateur
const getMarques = createServerFn({ method: 'GET' }).handler(() =>
  listerMarques(),
);

const getExposition = createServerFn({ method: 'GET' })
  .validator(z.object({ marque: z.string().min(1) }))
  .handler(async ({ data }) => {
    const exposition = await lireExposition(data.marque);
    if (exposition === null) throw notFound();
    return exposition;
  });

// Une clé de cache et un appel par ressource, partagés par loaders et composants
export const marquesQuery = () =>
  queryOptions({ queryKey: ['marques'], queryFn: () => getMarques() });

export const expositionQuery = (marque: string) =>
  queryOptions({
    queryKey: ['exposition', marque],
    queryFn: () => getExposition({ data: { marque } }),
  });
