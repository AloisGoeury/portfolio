import { DatabaseService } from './database.service';

const INITIAL_PAGE_CONTENT = {
  home: [
    ['eyebrow', 'Développeur et Tech lead'],
    [
      'title',
      `Je participe à la création d'outils informatiques aidant différents corps de métiers dans leurs tâches quotidienne`,
    ],
    [
      'introduction',
      'Ce site rassemble mes projets persos, mes notes de travail et quelques idées encore en train de prendre forme.',
    ],
    ['linkLabel', 'Voir les projets →'],
    ['sectionEyebrow', 'Sélection'],
    ['sectionTitle', 'Travaux récents'],
    ['emptyMessage', 'Les premiers projets arrivent bientôt.'],
  ],
  about: [
    ['eyebrow', 'À propos'],
    ['title', 'Faire moins, mais le faire avec soin.'],
    [
      'bodyMarkdown',
      `Je suis un ingénieur devenu développeur et même tech lead. J'aime le code, la tech, mais encore plus la gestion de projet et l'orchestration de tout un projet web par exemple.

Mon travail se situe entre conception, prototypage et réalisation. Ce portfolio est aussi un atelier : il me permet de tester de nouvelles technologies sur différents projets, de tout répertorier en un endroit et suivre tout ce travail.`,
    ],
    ['linkLabel', 'Parcourir les projets →'],
  ],
} as const;

export async function seedPageContent(
  database: DatabaseService,
): Promise<boolean> {
  return database.transaction(async (client) => {
    let created = false;

    for (const [pageName, content] of Object.entries(INITIAL_PAGE_CONTENT)) {
      const existing = await client.query(
        `SELECT 1
         FROM page_content_current
         WHERE page_name = $1
         LIMIT 1`,
        [pageName],
      );

      if (existing.rowCount) {
        continue;
      }

      const updatedAt = new Date();
      for (const [cell, value] of content) {
        const params = [pageName, 1, cell, value, updatedAt];
        await client.query(
          `INSERT INTO page_content_current (
             page_name, page_version, cell, value, updated_at
           )
           VALUES ($1, $2, $3, $4, $5)`,
          params,
        );
        await client.query(
          `INSERT INTO page_content_history (
             page_name, page_version, cell, value, updated_at
           )
           VALUES ($1, $2, $3, $4, $5)`,
          params,
        );
      }
      created = true;
    }

    return created;
  });
}
