# Produit : ce que l'app doit faire

État de la réflexion Product au 10/11 (tableaux « Mise à plat avant maquettes », « Structure du produit », impact map v2, problématique v1.1). Première version, à valider par Product, Tech et Data. Le sujet du défi : [`sujet.md`](sujet.md).

## En une phrase

**Un événement entre, une tournée d'appels sort.** Le monde bouge (une règle change, une matière première manque, un concurrent lance un produit) ; l'outil dit au commercial qui appeler, pourquoi maintenant, et avec quelle phrase.

- Problématique : comment savoir qui contacter, quand, et avec quels arguments sur les produits du client, pour proposer une réponse avant même l'appel d'offres ?
- Pour qui : le KAM (Key Account Manager), qui suit les clients actuels et répond à leurs appels d'offres.
- Hors périmètre depuis le 10/11 : la prospection (business developer, entreprises qui ressemblent aux clients). L'API renvoie aussi des `prospects` : l'app ne montre que les `clients`.
- Effet wahou visé : en démo, le jury propose une actualité et la tournée se recompose devant lui.

## Règles qui s'imposent au code

- Pas un CRM : ni liste à tenir, ni fiche à remplir, ni suivi d'échanges.
- Un fait, puis une question. Jamais de promesse de solution.
- L'outil prépare, le commercial mène l'échange.
- Des entreprises, pas des personnes (RGPD). Un commercial est un code (`KAM-01`), jamais un nom.
- « Exposition probable », jamais « non-conformité » : une étiquette publique ne donne pas les concentrations.
- Aucun appel enregistré ni retranscrit.
- Ce qui est simulé se dit à l'écran : comptes et ventes fictifs (`crm_fictif`), événement d'essai (`statut_validation` = `"test"`).

## Le parcours

Deux entrées : un événement (étapes 1 à 4) ou un brief d'appel d'offres (étape 5). L'étape 6 suit chaque appel.

| Étape                  | Ce que voit le commercial                                                                                                                                                                   | À construire                                                                 | Données                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1. Un événement entre  | Une liste « Détectés cette semaine » (date, source) et un champ de saisie libre. L'IA reformule (« Compris : produits contenant de la lavande naturelle »), le commercial valide ou creuse. | Traduire l'événement en critères sur les produits ; discussion pour creuser. | Sources surveillées : textes officiels, matières premières, lancements. Démo : liste préparée. |
| 2. Qui est touché      | Les clients touchés, avec le produit concerné et l'ingrédient en cause.                                                                                                                     | Relier ingrédient → produit → marque → entreprise.                           | Produits de démo aux ingrédients fiables ; clients simulés.                                    |
| 3. La raison d'appeler | Le fait sur son produit, la question à poser, la source et l'échéance.                                                                                                                      | La phrase d'ouverture : un fait vérifiable puis une question.                | Faits sourcés ; formulations prudentes.                                                        |
| 4. La tournée          | Les appels du jour dans l'ordre (1, 2, 3…) et une ligne qui explique l'ordre.                                                                                                               | Classer selon des critères simples et visibles.                              | Critères de classement.                                                                        |
| 5. Un brief entre      | Une zone où coller le brief ; des arguments, chacun rattaché à un produit du client.                                                                                                        | Lire le brief, le comparer aux produits du client.                           | Un ou deux briefs, trouvés ou simulés.                                                         |
| 6. Après l'appel       | Une ligne saisie par le commercial : l'accroche a-t-elle marché, qu'a répondu le client.                                                                                                    | Garder les retours pour mieux proposer la fois suivante.                     | Retours simulés.                                                                               |

## Ce qui existe

- Dans l'app : `/` (marques par urgence) et `/marques/$id` (produits, niveau, substances, source) sont une première version des étapes 2 et 3, sur un seul événement : les allergènes UE 2023/1545.
- Dans l'API data v0.4.0, lancée par `compose.yaml`. La spec copiée dans `openapi/data-api.json` est plus ancienne (v0.3.1) : pour ces routes, `npm run api:pull`, puis commiter la spec.
  - `GET /evenements` (`ListeEvenements`) : la liste de l'étape 1, déjà calculée et validée (`source_nom`, `date_echeance`, `statut_validation`, `nb_comptes_a_appeler`).
  - `GET /evenements/{evenement_id}/appels` (`ListeAppels`) : étapes 3 et 4 pour **un** événement (`rang`, `raison_classement`, `fait`, `question`, `confiance`). Ordre actuel : `score` = 5 × produits « probable » (10 au plus) + 2 × « possible » (10 au plus) + 30 × part de « probable ».
  - `GET /comptes/{compte_id}` (`Compte`) : produits touchés du compte (`elements_directs` : ingrédients visés lus sur l'étiquette ; `elements_indices` : ingrédients proches).
- Rien encore pour la saisie libre, la reformulation par l'IA, le brief et l'après-appel : l'API est en lecture seule et ses événements sont calculés à l'avance. La tournée qui « se recompose devant le jury » n'a donc pas d'API derrière elle aujourd'hui.

## Questions ouvertes

- Événements de la démo : lesquels, combien (deux ou trois) ?
- Tournée du jour sur plusieurs événements : fusionner les listes par événement, et dans quel ordre ? Proposition Product : échéance, puis nombre de produits touchés.
- Saisie libre devant le jury : fiable en « quelques secondes » ? Quel plan de secours ?
- Après l'appel : où garder la ligne saisie sans devenir un CRM ? Un stockage demande un ADR.
- Brief : aucun exemple d'appel d'offres pour l'instant.
- Périmètre du 4/12 : quelles étapes dans la démo, le brief en dernier ?

## Cadre

- Dates de l'école : coaching le 13/11 et le 2/12, oral et dépôt le 4/12 à 17 h. Calendrier du challenge Givaudan : [`sujet.md`](sujet.md).
- Outils exclus : Base44, Lovable.
- Maquettes : dans Figma, lues par le MCP `figma` (déclaré dans `.mcp.json`, une connexion Figma par personne). Pour un écran précis, coller le lien du frame (clic droit → Copy link to selection).
