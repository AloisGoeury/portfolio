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

## Migrations et seed

Exécuter les migrations SQL :

```bash
npm run db:migrate
```

Le runner lit les fichiers de
`apps/backend/db/migrations` par ordre alphabétique. Chaque migration est
exécutée dans une transaction et enregistrée dans `schema_migrations`.

Créer le compte administrateur défini par `ADMIN_EMAIL` et `ADMIN_PASSWORD` :

```bash
npm run db:seed
```

Le seed ne modifie rien si cet email existe déjà. La migration
`002_seed_example_project.sql` ajoute également un projet publié uniquement si
la table `projects` est vide.

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

Les tests d'intégration API utilisent une vraie base PostgreSQL. Utilisez une
base dédiée, car la suite vide ses tables avant les scénarios :

```bash
createdb portfolio_test
DATABASE_URL="postgresql://localhost:5432/portfolio_test" \
JWT_SECRET="test-secret" \
NODE_ENV="test" \
npm run db:migrate

DATABASE_URL="postgresql://localhost:5432/portfolio_test" \
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

Routes protégées par un JWT administrateur :

- `GET /api/admin/projects`
- `GET /api/admin/projects/:id`
- `POST /api/admin/projects`
- `PATCH /api/admin/projects/:id`
- `DELETE /api/admin/projects/:id`

Les deux routes publiques projets filtrent systématiquement
`published = true` dans le SQL.

## Déploiement Railway

### 1. Publier le dépôt sur GitHub

Le dépôt doit contenir le `package-lock.json`, le dossier `.github` et
`railway.json`. Poussez ensuite la branche `main` sur GitHub et attendez que la
GitHub Action soit verte.

### 2. Créer le projet Railway

1. Dans Railway, choisissez **New Project** puis **Deploy from GitHub repo**.
2. Autorisez Railway à accéder au dépôt si nécessaire.
3. Sélectionnez ce dépôt.
4. Conservez la racine du dépôt comme **Root Directory**. Ne choisissez pas
   `apps/backend`, car le build a besoin des deux workspaces.

Railway détecte `railway.json`. Ce fichier demande à Railpack :

- `npm run build` pendant le build ;
- `npm run db:migrate && npm run db:seed` avant chaque déploiement ;
- `npm run start` pour démarrer NestJS ;
- `/api/health` comme healthcheck.

Aucun Dockerfile n'est nécessaire.

### 3. Ajouter PostgreSQL

Dans le canvas du même projet, cliquez sur **+ New**, puis
**Database → PostgreSQL**. Railway crée un second service, généralement nommé
`Postgres`, qui expose notamment une variable `DATABASE_URL`.

### 4. Configurer les variables de l'application

Ouvrez le service applicatif, puis l'onglet **Variables**. Ajoutez :

```dotenv
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=une-longue-valeur-aleatoire
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=un-mot-de-passe-solide
NODE_ENV=production
```

Le nom `Postgres` dans la référence doit correspondre exactement au nom du
service de base. L'interface Railway propose aussi cette référence dans son
menu d'autocomplétion.

Générez par exemple le secret JWT localement :

```bash
openssl rand -base64 48
```

N'ajoutez pas `PORT` : Railway le fournit automatiquement et NestJS l'utilise
déjà. Vous pouvez sceller `JWT_SECRET` et `ADMIN_PASSWORD` depuis le menu de
chaque variable.

### 5. Déployer et vérifier

Appliquez les changements Railway ou lancez **Deploy Latest Commit**. Pendant
le premier déploiement :

1. Angular et NestJS sont compilés ;
2. les migrations créent les tables et le projet d'exemple ;
3. le seed crée le compte administrateur ;
4. Railway démarre l'application et attend un HTTP 200 sur `/api/health`.

Dans les logs, vérifiez les lignes `Applied 001_init.sql`,
`Applied 002_seed_example_project.sql` et `Admin ... created`. Lors des
déploiements suivants, les migrations seront marquées `Skipping`.

### 6. Créer le domaine public

Dans **Settings → Networking**, choisissez **Generate Domain**. Testez ensuite :

- `https://votre-domaine.up.railway.app/api/health` ;
- `https://votre-domaine.up.railway.app/` ;
- `https://votre-domaine.up.railway.app/admin/login`.

Connectez-vous avec `ADMIN_EMAIL` et `ADMIN_PASSWORD`, puis changez idéalement
le mot de passe initial en mettant à jour le hash en base ou en ajoutant une
fonction de changement de mot de passe avant une utilisation plus large.

### 7. Attendre la CI avant les prochains déploiements

Dans les réglages GitHub du service Railway, activez **Wait for CI**. Railway
attendra alors la réussite du workflow GitHub Actions avant de déployer un push
sur `main`. Si un job échoue, le déploiement correspondant sera ignoré.

Documentation Railway utile :

- [PostgreSQL](https://docs.railway.com/databases/postgresql)
- [Variables de référence](https://docs.railway.com/variables#reference-variables)
- [GitHub autodeploys et Wait for CI](https://docs.railway.com/deployments/github-autodeploys#wait-for-ci)
- [Healthchecks](https://docs.railway.com/deployments/healthchecks)

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

La partie publique est majoritairement statique. Seuls la liste et le détail
des projets utilisent actuellement PostgreSQL.
