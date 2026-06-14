# Instructions Codex - Portfolio

Ce fichier s'applique a l'ensemble du depot. Il doit etre lu avant toute
analyse ou modification. Son objectif est de permettre a un nouvel agent de
comprendre rapidement l'application, de trouver les bons fichiers et de
maintenir un niveau de qualite eleve.

## Contexte de l'application

Ce depot est un monorepo npm workspaces deploye comme un seul service Railway :

- `apps/frontend` : Angular standalone, SCSS, pages publiques et CMS projets ;
- `apps/backend` : NestJS, PostgreSQL et SQL ecrit a la main avec `pg` ;
- `scripts/copy-frontend.mjs` : copie le build Angular dans le dossier public
  du backend ;
- `railway.json` : build, migrations, seed, lancement et healthcheck Railway ;
- `.github/workflows/ci.yml` : lint, tests, PostgreSQL d'integration et build.

NestJS expose toutes les routes API sous `/api`, puis sert le build Angular
pour les autres routes. La seule partie dynamique publique est actuellement la
section projets.

## Lecture initiale obligatoire

Avant de commencer une tache :

1. lire ce fichier en entier ;
2. lire `README.md` et les `package.json` concernes ;
3. regarder les fichiers du module touche et leurs tests voisins ;
4. verifier l'etat Git sans annuler les changements existants ;
5. rechercher les usages avec `rg` avant de renommer ou deplacer du code.

Ne pas supposer que l'arborescence est restee identique a cette documentation :
la confirmer avec `rg --files` ou `find`.

## Carte du code

### Frontend

- `apps/frontend/src/app/app.routes.ts` : routes publiques et admin ;
- `apps/frontend/src/app/core` : modeles, HTTP, JWT, guard et interceptor ;
- `apps/frontend/src/app/pages` : pages publiques ;
- `apps/frontend/src/app/admin` : pages et composants du CMS ;
- `apps/frontend/src/styles.scss` : styles globaux et tokens visuels.

Chaque composant visuel doit vivre dans son propre dossier et separer au
minimum :

```text
nom-du-composant/
├── nom-du-composant.component.ts
├── nom-du-composant.component.html
├── nom-du-composant.component.scss   # si le style est local
└── nom-du-composant.component.spec.ts
```

Ne jamais remettre de template HTML inline dans un decorateur Angular. Garder
le TypeScript pour l'etat et les interactions, le HTML pour la structure et le
SCSS pour la presentation.

### Backend

- `apps/backend/src/database` : Pool PostgreSQL, migrations et seed ;
- `apps/backend/src/auth` : login bcrypt et protection JWT ;
- `apps/backend/src/projects` : controleurs, DTO, service et requetes SQL ;
- `apps/backend/src/health` : healthcheck Railway ;
- `apps/backend/db/migrations` : migrations SQL ordonnees ;
- `apps/backend/test` : tests d'integration HTTP avec PostgreSQL.

## Contraintes non negociables

- Ne jamais introduire Prisma, TypeORM ou un autre ORM.
- Ecrire toutes les requetes SQL explicitement.
- Parametrer toutes les donnees dynamiques avec `$1`, `$2`, etc.
- Garder toutes les routes backend sous `/api`.
- Conserver `process.env.PORT || 3000`.
- Conserver `DATABASE_URL` comme source de connexion PostgreSQL.
- Les routes publiques projets ne retournent que `published = true`.
- Les routes `/api/admin/**` restent protegees par JWT.
- NestJS doit continuer a servir le build Angular et son fallback SPA.
- Ne pas ajouter de Dockerfile sauf necessite technique demontree.

## Architecture et proprete

- Preferer des composants petits, focalises et reutilisables.
- Extraire un sous-composant lorsqu'une section a sa propre responsabilite,
  son propre etat, plusieurs interactions ou devient difficile a lire.
- Ne pas placer de logique metier dans les templates Angular.
- Placer les acces HTTP dans des services et les types partages dans `core`.
- Cote NestJS, garder les controleurs fins : validation et routage dans le
  controleur, logique metier dans le service, SQL dans `*.sql.ts`.
- Eviter les abstractions generiques sans besoin concret.
- Reutiliser les conventions et composants existants avant d'en creer de
  nouveaux.
- Garder les changements limites a la demande ; ne pas melanger un gros
  refactoring sans rapport avec une fonctionnalite.

## Politique de tests

Tout changement de comportement doit etre accompagne de tests. Un correctif de
bug commence idealement par un test qui reproduit le bug.

### Frontend

- Tester les services HTTP avec `HttpTestingController`.
- Tester guards, interceptors, formulaires et transformations de donnees.
- Tester les composants pour leur comportement visible et leurs interactions,
  pas pour leurs details d'implementation.
- Ajouter le fichier `*.component.spec.ts` dans le dossier du composant.

### Backend

- Tester les services et guards unitairement avec Jest.
- Verifier les requetes et leurs parametres lorsque du SQL change.
- Ajouter ou etendre les tests E2E pour les contrats HTTP, l'authentification,
  les droits et les regles de publication.
- Toute migration doit etre testee sur une vraie PostgreSQL.

### Couverture

Chercher la couverture utile maximale, en priorite sur :

- branches metier et cas d'erreur ;
- authentification et autorisations ;
- validation des DTO et formulaires ;
- publication et confidentialite des brouillons ;
- transformations de donnees ;
- migrations et integrite des relations SQL.

Ne pas ajouter de tests artificiels uniquement pour gonfler un pourcentage.
Ne jamais reduire volontairement la couverture existante. Lorsqu'un fichier
modifie n'est pas couvert, ajouter ses tests dans la meme tache.

Les seuils de CI sont des planchers anti-regression, pas des objectifs finaux.
Ils doivent etre augmentes progressivement lorsque la couverture reelle monte.

Commandes :

```bash
npm run test
npm run test:coverage
npm run test:e2e
```

Les tests E2E necessitent une base dediee, `NODE_ENV=test` et
`DATABASE_SSL=false` pour une PostgreSQL locale. Ils tronquent les tables ; ne
jamais les lancer contre une base de developpement ou de production.

## Verification obligatoire avant livraison

Pour toute modification de code ou de configuration, executer :

```bash
npm run lint
npm run test
npm run build
```

Executer en plus `npm run test:e2e` pour tout changement concernant :

- backend, API ou authentification ;
- SQL, migrations ou seed ;
- contrats frontend/backend ;
- configuration de deploiement.

Executer `npm run test:coverage` lorsqu'un comportement est ajoute ou modifie,
et examiner les zones non couvertes du module touche.

Si une commande ne peut pas etre lancee, expliquer precisement pourquoi dans
la reponse finale. Ne jamais annoncer qu'un changement est termine avec des
tests rouges.

## Base de donnees

- Ajouter une nouvelle migration numerotee au lieu de modifier une migration
  deja deployee.
- Rendre les migrations transactionnelles et idempotentes lorsque possible.
- Verifier l'ordre des fichiers dans `apps/backend/db/migrations`.
- Maintenir les suppressions en cascade et les contraintes d'unicite.
- Eviter toute concatenation de valeur utilisateur dans une requete SQL.

## Definition de termine

Une tache n'est terminee que si :

- le code est separe selon les responsabilites ;
- les templates Angular restent dans des fichiers HTML externes ;
- les nouveaux comportements disposent de tests utiles ;
- la couverture du code touche est satisfaisante et ne regresse pas ;
- lint, tests et build passent ;
- les tests E2E passent lorsque la base ou l'API est concernee ;
- la documentation est mise a jour si une commande ou une architecture change.
