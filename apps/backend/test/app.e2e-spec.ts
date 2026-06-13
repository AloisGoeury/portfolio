import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/database/database.service';

describe('Portfolio API (e2e)', () => {
  let app: INestApplication;
  let database: DatabaseService;
  let accessToken: string;

  beforeAll(async () => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('E2E tests require NODE_ENV=test.');
    }

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
      'TRUNCATE project_links, project_tags, tags, projects, users CASCADE',
    );

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
});
