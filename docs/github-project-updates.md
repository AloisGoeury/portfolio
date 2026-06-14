# Relier un dépôt GitHub au Portfolio

Cette intégration envoie le dernier commit d'un dépôt vers le Portfolio. Le
Portfolio met à jour l'activité du projet et crée une proposition dans
**Admin > File GitHub**. Rien n'est publié automatiquement dans les notes :
la proposition peut être réécrite, publiée ou ignorée.

## 1. Configurer le Portfolio

1. Générez un secret long et aléatoire.
2. Ajoutez-le dans Railway sous le nom `GITHUB_UPDATES_SECRET`.
3. Dans le CMS, ouvrez le projet concerné et renseignez **Dépôt GitHub lié**
   avec l'URL exacte du dépôt, par exemple
   `https://github.com/mon-compte/mon-projet`.
4. Conservez le slug du projet, par exemple `mon-projet`.

Le même secret peut être utilisé par plusieurs dépôts. Il doit rester dans les
secrets GitHub et ne jamais être écrit dans un fichier versionné.

## 2. Configurer le dépôt externe

Dans **Settings > Secrets and variables > Actions**, ajoutez :

- secret `PORTFOLIO_UPDATES_SECRET` : la même valeur que sur Railway ;
- variable `PORTFOLIO_API_URL` : l'origine du Portfolio, sans slash final,
  par exemple `https://portfolio.example.com` ;
- variable `PORTFOLIO_PROJECT_SLUG` : le slug configuré dans le CMS.

Ajoutez ensuite `.github/workflows/portfolio-update.yml` :

```yaml
name: Notify portfolio

on:
    push:
        branches: [main]

jobs:
    notify:
        runs-on: ubuntu-latest
        permissions:
            contents: read
        steps:
            - name: Send the latest commit to the portfolio
              env:
                  API_URL: ${{ vars.PORTFOLIO_API_URL }}
                  PROJECT_SLUG: ${{ vars.PORTFOLIO_PROJECT_SLUG }}
                  UPDATE_SECRET: ${{ secrets.PORTFOLIO_UPDATES_SECRET }}
                  REPOSITORY_URL: https://github.com/${{ github.repository }}
                  COMMIT_SHA: ${{ github.sha }}
                  COMMIT_URL: https://github.com/${{ github.repository }}/commit/${{ github.sha }}
                  COMMIT_MESSAGE: ${{ github.event.head_commit.message }}
                  COMMITTED_AT: ${{ github.event.head_commit.timestamp }}
                  AUTHOR_NAME: ${{ github.event.head_commit.author.name }}
              run: |
                  jq -n \
                    --arg projectSlug "$PROJECT_SLUG" \
                    --arg repositoryUrl "$REPOSITORY_URL" \
                    --arg commitSha "$COMMIT_SHA" \
                    --arg commitUrl "$COMMIT_URL" \
                    --arg commitMessage "$COMMIT_MESSAGE" \
                    --arg committedAt "$COMMITTED_AT" \
                    --arg authorName "$AUTHOR_NAME" \
                    '{
                      projectSlug: $projectSlug,
                      repositoryUrl: $repositoryUrl,
                      commitSha: $commitSha,
                      commitUrl: $commitUrl,
                      commitMessage: $commitMessage,
                      committedAt: $committedAt,
                      authorName: $authorName
                    }' |
                  curl --fail-with-body \
                    --request POST \
                    --header "Authorization: Bearer $UPDATE_SECRET" \
                    --header "Content-Type: application/json" \
                    --data-binary @- \
                    "$API_URL/api/integrations/github/project-updates"
```

Le couple projet/SHA est idempotent : relancer un workflow ne crée pas deux
propositions pour le même commit.

## 3. Publier une note

Après un push :

1. ouvrez **Admin > File GitHub** ;
2. modifiez le titre, le résumé, le slug et le Markdown proposés ;
3. choisissez **Publier dans les notes** ou **Ignorer**.

La date et le lien du dernier commit apparaissent immédiatement sur le projet,
même si la proposition de note reste en attente.

## Configuration de ce dépôt

Le dépôt du Portfolio contient déjà
`.github/workflows/portfolio-update.yml`. Il cible :

- la branche `master`, après la réussite du workflow `CI` ;
- le projet `construire-ce-portfolio` ;
- le dépôt `https://github.com/AloisGoeury/portfolio`.

La notification attend jusqu'à dix minutes que Railway serve la nouvelle
version. Cela évite d'appeler la route sur l'ancien déploiement pendant le
build.

Il reste à définir dans les paramètres GitHub du dépôt :

- variable `PORTFOLIO_API_URL` : l'URL publique Railway du Portfolio ;
- secret `PORTFOLIO_UPDATES_SECRET` : la même valeur que
  `GITHUB_UPDATES_SECRET` dans Railway.

Le workflow peut ensuite être testé avec **Actions > Update portfolio
activity > Run workflow**.
