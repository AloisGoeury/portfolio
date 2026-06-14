# Portfolio

Monorepo npm pour un portfolio-blog personnel. Angular fournit l'interface
publique et le CMS projets. NestJS expose l'API, dialogue avec PostgreSQL via
`pg`, puis sert le build Angular en production.

Le projet n'utilise ni Prisma ni TypeORM : toutes les requêtes SQL sont écrites
explicitement et les valeurs métier sont passées avec des paramètres `$1`,
`$2`, etc.

## Prérequis

- Node.js 22 ou plus récent
- npm 10 ou plus récent
- PostgreSQL avec l'extension `pgcrypto`

## Installation

```bash
npm install
cp .env.example .env
```

Adaptez ensuite les variables dans `.env`.

## Base PostgreSQL locale

Avec une installation PostgreSQL locale :

```bash
createdb portfolio
```

La valeur correspondante est :

```dotenv
DATABASE_URL="postgresql://localhost:5432/portfolio"
```

Si votre serveur PostgreSQL exige un utilisateur et un mot de passe, utilisez
la forme complète montrée dans `.env.example`.

## Base Railway pour le développement local

Le frontend et l'API peuvent tourner sur votre machine tout en utilisant une
base PostgreSQL hébergée sur Railway. Cette base doit être distincte de la base
de production.

### 1. Créer l'environnement Railway

Dans le projet Railway :

1. Ouvrez le sélecteur d'environnement puis choisissez **New Environment**.
2. Créez un environnement persistant nommé `development`.
3. Choisissez de préférence **Empty Environment**, puis ajoutez uniquement un
   service **Database → PostgreSQL**. Cela évite de déployer une seconde copie
   inutile de l'application.
4. Ouvrez le service PostgreSQL et vérifiez que son TCP Proxy public est actif.

Railway fournit deux URL différentes :

- `DATABASE_URL` utilise généralement le réseau privé Railway et convient aux
  services déployés sur Railway ;
- `DATABASE_PUBLIC_URL` passe par le proxy TCP public et doit être utilisée par
  l'API lancée sur votre machine.

Ne connectez jamais le développement local à la base de production.

### 2. Configurer le projet local

Copiez `.env.example` vers `.env`, puis utilisez les variables du service
PostgreSQL de l'environnement `development` :

```dotenv
DATABASE_URL="valeur de DATABASE_PUBLIC_URL dans Railway"
DATABASE_SSL="true"
JWT_SECRET="un-secret-local"
ADMIN_EMAIL="admin-dev@example.com"
ADMIN_PASSWORD="un-mot-de-passe-de-dev"
NODE_ENV="development"
```

Le fichier `.env` est ignoré par Git et ne doit jamais être commité.

### 3. Initialiser et utiliser la base

Une seule fois lors de la création de la base :

```bash
npm run db:migrate
npm run db:seed
```

Puis lancez normalement le projet :

```bash
npm run dev
```

Les migrations peuvent être relancées après l'ajout d'un fichier SQL : celles
déjà appliquées sont ignorées. La latence sera un peu supérieure à celle d'une
base locale, car chaque requête traverse Internet.

### Variante avec le CLI Railway

Le CLI est utile pour sélectionner rapidement le bon projet et le bon
environnement :

```bash
railway login
railway link
railway environment development
```

Pour le développement quotidien, conserver `DATABASE_PUBLIC_URL` dans le
fichier `.env` local reste le fonctionnement le plus explicite. La commande
`railway run` peut injecter les variables d'un service, mais il faut alors
veiller à ne pas récupérer celles de `production`.

## Migrations et seed

Exécuter les migrations SQL :

```bash
npm run db:migrate
```

Le runner lit les fichiers de
`apps/backend/db/migrations` par ordre alphabétique. Chaque migration est
exécutée dans une transaction et enregistrée dans `schema_migrations`.

Créer le contenu initial des pages Accueil et À propos, ainsi que le compte
administrateur défini par `ADMIN_EMAIL` et `ADMIN_PASSWORD` :

```bash
npm run db:seed
```

Le seed ne remplace jamais une page déjà présente et ne modifie pas le compte
si cet email existe déjà. La migration `002_seed_example_project.sql` ajoute
également un projet publié uniquement si la table `projects` est vide.

## Développement

```bash
npm run dev
```

- Angular : `http://localhost:4200`
- API NestJS : `http://localhost:3000/api`
- Santé : `http://localhost:3000/api/health`

Le serveur Angular redirige `/api` vers NestJS grâce à `proxy.conf.json`.

## Tests et lint

Lancer le lint TypeScript, Angular et le contrôle Prettier :

```bash
npm run lint
```

Corriger automatiquement ce qui peut l'être :

```bash
npm run lint:fix
```

Lancer les tests unitaires Angular et NestJS :

```bash
npm run test
```

Generer les rapports de couverture dans `coverage/` :

```bash
npm run test:coverage
```

Les tests d'intégration API utilisent une vraie base PostgreSQL. Utilisez une
base dédiée, car la suite vide ses tables avant les scénarios :

```bash
createdb portfolio_test
DATABASE_URL="postgresql://localhost:5432/portfolio_test" \
DATABASE_SSL="false" \
JWT_SECRET="test-secret" \
NODE_ENV="test" \
npm run db:migrate

DATABASE_URL="postgresql://localhost:5432/portfolio_test" \
DATABASE_SSL="false" \
JWT_SECRET="test-secret" \
NODE_ENV="test" \
npm run test:e2e
```

La commande `npm run test:ci` enchaîne lint, tests unitaires, tests
d'intégration et build. Elle suppose que `DATABASE_URL` pointe vers une base de
test déjà migrée.

Le workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) s'exécute
sur chaque pull request et chaque push sur `main`. Il contient quatre jobs :

- lint et formatage ;
- tests unitaires frontend et backend ;
- migrations, seed et tests d'intégration avec PostgreSQL 16 ;
- build de production du monorepo.

## Build et lancement local

```bash
npm run build
npm run start
```

Le build racine :

1. compile Angular ;
2. copie `apps/frontend/dist/frontend/browser` dans `apps/backend/public` ;
3. compile NestJS.

NestJS sert ensuite l'API sous `/api` et renvoie `index.html` pour toutes les
autres routes. Les rafraîchissements sur `/projets/:slug` et sur les pages
`/admin` fonctionnent donc sans configuration supplémentaire.

## Routes API

Routes publiques :

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/projects`
- `GET /api/projects/:slug`
- `GET /api/notes`
- `GET /api/pages/home`
- `GET /api/pages/about`
- `POST /api/integrations/github/project-updates`

Routes protégées par un JWT administrateur :

- `GET /api/admin/projects`
- `GET /api/admin/projects/:id`
- `POST /api/admin/projects`
- `PATCH /api/admin/projects/:id`
- `DELETE /api/admin/projects/:id`
- `GET /api/admin/notes`
- `POST /api/admin/notes`
- `PATCH /api/admin/notes/:id`
- `DELETE /api/admin/notes/:id`
- `GET /api/admin/project-updates`
- `PATCH /api/admin/project-updates/:id`
- `POST /api/admin/project-updates/:id/publish`
- `POST /api/admin/project-updates/:id/ignore`
- `GET /api/admin/pages/home`
- `GET /api/admin/pages/home/history`
- `PATCH /api/admin/pages/home`
- `GET /api/admin/pages/about`
- `GET /api/admin/pages/about/history`
- `PATCH /api/admin/pages/about`

## Synchronisation GitHub

Un projet du CMS peut être lié à un dépôt GitHub. À chaque push, une GitHub
Action peut mettre à jour la date du dernier commit et préparer une note dans
une file de modération, sans publication automatique.

Le guide complet et le workflow réutilisable sont dans
[`docs/github-project-updates.md`](docs/github-project-updates.md). L'API
entrante est protégée par la variable Railway `GITHUB_UPDATES_SECRET`.

Les deux routes publiques projets filtrent systématiquement
`published = true` dans le SQL.

## Architecture

```text
.
├── apps
│   ├── backend
│   │   ├── db/migrations       # migrations SQL versionnées
│   │   └── src
│   │       ├── auth            # login et garde JWT
│   │       ├── database        # Pool pg, migrations et seed
│   │       ├── health          # endpoint de santé
│   │       ├── pages           # contenu courant et historique des pages
│   │       └── projects        # contrôleurs, DTO, service et SQL
│   └── frontend
│       └── src/app
│           ├── admin           # CMS minimal des projets
│           ├── core            # API, modèles, JWT et garde Angular
│           └── pages           # pages publiques
├── scripts/copy-frontend.mjs
├── .github/workflows/ci.yml
├── package.json
└── railway.json
```

La liste et le détail des projets ainsi que les pages Accueil et À propos
utilisent PostgreSQL.
