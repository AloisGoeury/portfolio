import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';
import { seedPageContent } from '../src/database/seed-page-content';

describe('Portfolio API (e2e)', () => {
  let app: INestApplication;
  let database: DatabaseService;
  let accessToken: string;

  beforeAll(async () => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('E2E tests require NODE_ENV=test.');
    }
    process.env.GITHUB_UPDATES_SECRET = 'github-test-secret';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    database = app.get(DatabaseService);
    await database.query(
      `TRUNCATE project_update_queue, notes, page_content_history,
       page_content_current, project_links, project_tags, tags, projects,
       users CASCADE`,
    );
    await seedPageContent(database);

    const passwordHash = await bcrypt.hash('test-password', 4);
    await database.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)`,
      ['admin@example.com', passwordHash, 'ADMIN'],
    );

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'test-password',
      })
      .expect(201);

    accessToken = login.body.accessToken as string;
  });

  afterAll(async () => {
    await app.close();
  });

  it('exposes the healthcheck', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);

    expect(response.body.status).toBe('ok');
  });

  it('protects every admin route', async () => {
    await request(app.getHttpServer()).get('/api/admin/projects').expect(401);
    await request(app.getHttpServer())
      .get('/api/admin/pages/about')
      .expect(401);
    await request(app.getHttpServer()).get('/api/admin/notes').expect(401);
    await request(app.getHttpServer())
      .get('/api/admin/project-updates')
      .expect(401);
  });

  it('keeps immutable page history while exposing the latest version', async () => {
    const initial = await request(app.getHttpServer())
      .get('/api/pages/about')
      .expect(200);
    expect(initial.body).toMatchObject({
      version: 1,
      title: 'Faire moins, mais le faire avec soin.',
    });

    await request(app.getHttpServer())
      .patch('/api/admin/pages/about')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        eyebrow: 'Profil',
        title: 'Titre version 2',
        bodyMarkdown: 'Contenu version 2',
        linkLabel: 'Voir les projets',
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          version: 2,
          title: 'Titre version 2',
        });
      });

    const history = await request(app.getHttpServer())
      .get('/api/admin/pages/about/history')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(history.body).toHaveLength(2);
    expect(
      history.body.map((version: { version: number }) => version.version),
    ).toEqual([2, 1]);
    expect(history.body[1].title).toBe('Faire moins, mais le faire avec soin.');
  });

  it('keeps drafts private, then exposes them after publication', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/admin/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Projet de test',
        slug: 'projet-de-test',
        summary: 'Un projet créé par les tests.',
        contentMarkdown: '# Projet de test',
        published: false,
        status: 'draft',
        tags: [{ name: 'Test', slug: 'test' }],
        links: [
          {
            label: 'Exemple',
            url: 'https://example.com',
            type: 'website',
          },
        ],
      })
      .expect(201);

    const projectId = created.body.id as string;

    const publicDrafts = await request(app.getHttpServer())
      .get('/api/projects')
      .expect(200);
    expect(publicDrafts.body).toEqual([]);

    await request(app.getHttpServer())
      .get('/api/projects/projet-de-test')
      .expect(404);

    await request(app.getHttpServer())
      .patch(`/api/admin/projects/${projectId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ published: true, status: 'published' })
      .expect(200);

    const publicProjects = await request(app.getHttpServer())
      .get('/api/projects')
      .expect(200);
    expect(publicProjects.body).toHaveLength(1);
    expect(publicProjects.body[0]).toMatchObject({
      slug: 'projet-de-test',
      published: true,
      tags: [{ name: 'Test', slug: 'test' }],
    });

    await request(app.getHttpServer())
      .delete(`/api/admin/projects/${projectId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .get('/api/projects/projet-de-test')
      .expect(404);
  });

  it('queues GitHub commits and lets the admin publish an editable note', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/admin/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Projet GitHub',
        slug: 'projet-github',
        summary: 'Un projet connecté à GitHub.',
        contentMarkdown: '# Projet GitHub',
        githubRepositoryUrl: 'https://github.com/example/projet-github',
        published: true,
        status: 'published',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/integrations/github/project-updates')
      .send({
        projectSlug: 'projet-github',
        repositoryUrl: 'https://github.com/example/projet-github',
        commitSha: '1234567890abcdef',
        commitUrl:
          'https://github.com/example/projet-github/commit/1234567890abcdef',
        commitMessage: 'Ajoute une nouvelle fonctionnalité',
        committedAt: '2026-06-14T12:00:00.000Z',
        authorName: 'Aloïs',
      })
      .expect(401);

    await request(app.getHttpServer())
      .post('/api/integrations/github/project-updates')
      .set('Authorization', 'Bearer github-test-secret')
      .send({
        projectSlug: 'projet-github',
        repositoryUrl: 'https://github.com/example/projet-github.git',
        commitSha: '1234567890abcdef',
        commitUrl:
          'https://github.com/example/projet-github/commit/1234567890abcdef',
        commitMessage: 'Ajoute une nouvelle fonctionnalité',
        committedAt: '2026-06-14T12:00:00.000Z',
        authorName: 'Aloïs',
      })
      .expect(201);

    const project = await request(app.getHttpServer())
      .get('/api/projects/projet-github')
      .expect(200);
    expect(project.body).toMatchObject({
      lastCommitSha: '1234567890abcdef',
      lastCommitMessage: 'Ajoute une nouvelle fonctionnalité',
      lastCommitAt: '2026-06-14T12:00:00.000Z',
    });

    const queue = await request(app.getHttpServer())
      .get('/api/admin/project-updates')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(queue.body).toHaveLength(1);
    expect(queue.body[0]).toMatchObject({
      projectSlug: 'projet-github',
      status: 'pending',
    });

    const queueId = queue.body[0].id as string;
    await request(app.getHttpServer())
      .patch(`/api/admin/project-updates/${queueId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        proposedTitle: 'Une étape importante',
        proposedContentMarkdown: 'Le détail réécrit depuis le CMS.',
      })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/admin/project-updates/${queueId}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        slug: 'une-etape-importante',
        excerpt: 'Résumé public.',
        published: true,
      })
      .expect(201);

    const notes = await request(app.getHttpServer())
      .get('/api/notes')
      .expect(200);
    expect(notes.body).toHaveLength(1);
    expect(notes.body[0]).toMatchObject({
      title: 'Une étape importante',
      slug: 'une-etape-importante',
      excerpt: 'Résumé public.',
      published: true,
    });

    await request(app.getHttpServer())
      .delete(`/api/admin/projects/${created.body.id as string}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);
  });
});
