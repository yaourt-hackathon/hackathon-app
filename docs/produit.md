# Produit : ce que l'app doit faire

État au 12/11 du [board FigJam de l'équipe](https://www.figma.com/board/jJe5PS97sJPCsxwhgx2zTL/Givaudan-Hackathon) : [Story map](https://www.figma.com/board/jJe5PS97sJPCsxwhgx2zTL/Givaudan-Hackathon?node-id=149-213), [MoSCoW](https://www.figma.com/board/jJe5PS97sJPCsxwhgx2zTL/Givaudan-Hackathon?node-id=153-301), [Réponses de Givaudan](https://www.figma.com/board/jJe5PS97sJPCsxwhgx2zTL/Givaudan-Hackathon?node-id=151-291), [Mise à plat avant maquettes](https://www.figma.com/board/jJe5PS97sJPCsxwhgx2zTL/Givaudan-Hackathon?node-id=105-142). En cas d'écart, le board fait foi. Le sujet du défi : [`sujet.md`](sujet.md).

## En une phrase

**Un événement entre, une tournée d'appels sort.** Le monde bouge (une règle change, une matière première manque, un concurrent lance un produit) ; l'outil dit au commercial qui appeler, pourquoi maintenant, et avec quelle phrase.

- Problématique : comment savoir qui contacter, quand, et avec quels arguments sur les produits du client, pour proposer une réponse avant même l'appel d'offres ?
- Pour qui : le KAM (Key Account Manager), qui suit les clients actuels. L'équipe y voit son persona confirmé par les réponses de Givaudan du 12/11, qui décrivent le rôle des KAM et ne parlent pas de business developers.
- Hors périmètre : la prospection (business developer). L'API renvoie aussi des `prospects` : l'app ne montre que les `clients`.
- Effet wahou visé : en démo, le jury propose une actualité et la tournée se recompose devant lui.

## Règles qui s'imposent au code

- Pas un CRM : ni liste à tenir, ni fiche à remplir, ni suivi d'échanges.
- Pas un outil de plus. Givaudan, réponses du 12/11 : « La principale opportunité réside dans l'intégration de l'IA aux processus commerciaux existants, plutôt que dans la multiplication d'outils indépendants. » Et, plus loin : « Le véritable enjeu n'est donc pas d'ajouter de nouveaux outils, mais de simplifier les processus existants, d'éviter les saisies répétitives et de faciliter la circulation des informations entre les différentes plateformes. » L'équipe en conclut : dire comment la liste d'appels s'insère dans Pegasus, leur outil commercial, même si le prototype est autonome.
- Un fait, puis une question. Jamais de promesse de solution.
- L'outil prépare, le commercial mène l'échange et valide chaque sortie de l'IA.
- Des entreprises, pas des personnes (RGPD). Un commercial est un code (`KAM-01`), jamais un nom.
- « Exposition probable », jamais « non-conformité » : une étiquette publique ne donne pas les concentrations.
- Aucun appel enregistré ni retranscrit.
- Ce qui est simulé se dit à l'écran : veille préparée à la main, comptes et ventes fictifs (`crm_fictif`), événement d'essai (`statut_validation` = `"test"`).

## Le MVP (story map et MoSCoW du 12/11)

Le parcours du KAM, dans l'ordre. Les six stories **Must** forment la démo ; l'étoile marque le moment décisif.

| Le commercial…                                                                                  | Rôle de l'IA (relu par le commercial)                                         | API data v0.4.0                                                       |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1. voit les événements détectés, avec la date et la source                                      | Veille : surveille les sources. Prototype : événements préparés, dit au jury. | `GET /evenements` (`source_nom`, `date_echeance`)                     |
| 2. choisit un événement                                                                         | —                                                                             | —                                                                     |
| 3. lit la reformulation et la valide (« Compris : produits contenant de la lavande naturelle ») | Traduit l'événement en critères sur les produits, avant la recherche.         | Rien                                                                  |
| 4. voit les clients touchés, avec le produit et l'ingrédient en cause                           | Cherche les produits qui répondent aux critères.                              | `GET /comptes/{compte_id}` (`elements_directs`, `elements_indices`)   |
| 5. voit ses appels classés, avec la raison du classement                                        | —                                                                             | `GET /evenements/{evenement_id}/appels` (`rang`, `raison_classement`) |
| 6. ★ lit la raison d'appeler : le fait sur le produit, la source, la question                   | Rédige le fait et la question, sans promesse.                                 | même route (`fait`, `question`, `confiance`)                          |

- **Should** : saisir soi-même un événement ; modifier le fait ou la question ; copier la raison d'appeler ; ouvrir la source du fait.
- **Could** : creuser l'événement en discutant avec l'outil.
- **Won't, cette semaine** : coller un brief d'appel d'offres ; brancher la veille sur de vraies sources ; noter le résultat de l'appel et en tirer de meilleures accroches ; retrouver la liste ou le résultat dans Pegasus ; la prospection.

## Ce qui existe

- Dans l'app, les six Must, sous la forme du volet de la [maquette v6](https://www.figma.com/design/Wn4wWNsf8bvSYNAlKy5qXk/Maquette?node-id=86-1193). Le volet fait 640 px, comme s'il était ouvert à côté de Pegasus. Il fait la hauteur de l'écran et la page ne défile jamais : seul son contenu défile.
  - `/` « Sujets du jour » : le sujet principal (échéance la plus proche), puis les autres (stories 1 et 2).
  - `/evenements/$evenementId` « Sujet », en onglets (story 3) :
    - L'essentiel : ce qui change, chez vos clients, pourquoi appeler maintenant ;
    - Ce que l'IA a lu : la source, et ce qu'elle a cherché ;
    - À vérifier.
  - `/evenements/$evenementId/clients` « Choisir les clients » : le commercial coche ceux qu'il appelle (story 4).
  - `/evenements/$evenementId/appels` « Liste d'appels » : les clients choisis, classés (story 5). Le choix est dans l'URL (`?clients=`).
  - `/evenements/$evenementId/appels/$compteId` « Fiche d'appel » : la phrase d'appel, puis trois onglets (story 6) :
    - les arguments sourcés, avec la liste d'ingrédients de l'étiquette en démo ;
    - les relances ;
    - pourquoi ce client.
- Should faits : copier la phrase d'appel, ouvrir la source, modifier le fait ou la question (pour cet appel, rien n'est enregistré).
- En plus, simulés et dits à l'écran : « Marquer comme appelé » et son compteur, perdus au rechargement.
- Reste à faire :
  - saisir soi-même un événement ;
  - « Corriger » (discuter du sujet avec l'IA), masqué pour l'instant ;
  - « Relancer » la veille, absent puisque la veille est préparée à la main.
- Données : un scénario de démo embarqué (`DATA_SOURCE=demo`, par défaut) ou l'API data (`DATA_SOURCE=api`), au choix ([ADR 0008](adr/0008-source-de-donnees-commutable.md)). Le scénario reprend `EVT-001` de l'API telle qu'au commit data `05991a7` et ajoute deux événements fictifs, `DEMO-01` (lavande) et `DEMO-02` (rose).
- Hors du parcours : `/marques` (marques par urgence) et `/marques/$id` (produits, niveau, substances, source), sur les allergènes UE 2023/1545. Ces pages lisent toujours l'API, à jour : l'accueil n'y renvoie qu'en mode `api`, pour ne pas contredire le scénario figé.
- Dans l'API data v0.4.0, lancée par `compose.yaml` : les routes du tableau ci-dessus, copiées dans `openapi/data-api.json`.
- Ordre actuel des appels, calculé par l'API pour **un** événement : `score` = 5 × produits « probable » (10 au plus) + 2 × « possible » (10 au plus) + 30 × part de « probable ».
- Manquant : une reformulation produite par l'IA (l'app montre un texte préparé par l'équipe) et toute recherche à partir de critères saisis. L'API est en lecture seule et ses événements sont calculés à l'avance, donc la tournée qui se recompose devant le jury n'a pas d'API derrière elle aujourd'hui.

## Questions ouvertes

- Événements de la démo : lesquels, combien (deux ou trois) ?
- Tournée du jour sur plusieurs événements : comment fusionner les listes ? Proposition Product : échéance, puis nombre de produits touchés. L'équipe propose aussi le potentiel commercial du client, d'après une réponse de Givaudan (les moyens engagés en dépendent).
- Reformulation en direct devant le jury : fiable en « quelques secondes » ? Quel plan de secours ?
- Périmètre du 4/12 : les six Must, et quels Should ?

## Cadre

- Dates de l'école : coaching le 13/11 et le 2/12, oral et dépôt le 4/12 à 17 h. Calendrier du challenge Givaudan : [`sujet.md`](sujet.md).
- Outils exclus : Base44, Lovable.
- Indicateurs suivis par Givaudan, utiles au pitch : inflow, win rate, PNWR (réponses du 12/11).
- Figma : lu par le MCP `figma` (déclaré dans `.mcp.json`, une connexion Figma par personne). Avec un siège View ou Collab, il ne permet que 20 lectures par mois : lire une section par son lien (clic droit → Copy link to selection), jamais tout le board.
