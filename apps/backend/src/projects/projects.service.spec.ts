import { DatabaseService } from '../database/database.service';
import { projectsSql } from './projects.sql';
import { Project, ProjectsService } from './projects.service';

const publishedProject: Project = {
  id: 'project-id',
  title: 'Projet publié',
  slug: 'projet-publie',
  summary: 'Résumé',
  contentMarkdown: '# Contenu',
  status: 'published',
  category: null,
  coverUrl: null,
  featured: false,
  published: true,
  startedAt: null,
  endedAt: null,
  createdAt: '2026-06-13T00:00:00.000Z',
  updatedAt: '2026-06-13T00:00:00.000Z',
  tags: [],
  links: [],
};

describe('ProjectsService', () => {
  const database = {
    query: jest.fn(),
    transaction: jest.fn(),
  } as unknown as DatabaseService;
  const service = new ProjectsService(database);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the public SQL query when listing published projects', async () => {
    jest.mocked(database.query).mockResolvedValueOnce({
      rows: [publishedProject],
      rowCount: 1,
    } as never);

    await expect(service.listPublished()).resolves.toEqual([publishedProject]);
    expect(database.query).toHaveBeenCalledWith(projectsSql.listPublished);
    expect(projectsSql.listPublished).toContain('p.published = true');
  });

  it('passes the slug as a parameter when loading a public project', async () => {
    jest.mocked(database.query).mockResolvedValueOnce({
      rows: [publishedProject],
      rowCount: 1,
    } as never);

    await expect(service.findPublishedBySlug('projet-publie')).resolves.toEqual(
      publishedProject,
    );
    expect(database.query).toHaveBeenCalledWith(
      projectsSql.findPublishedBySlug,
      ['projet-publie'],
    );
    expect(projectsSql.findPublishedBySlug).toContain(
      'p.slug = $1 AND p.published = true',
    );
  });

  it('parameterizes every project value during creation', async () => {
    const client = {
      query: jest
        .fn()
        .mockResolvedValueOnce({ rows: [{ id: 'new-project-id' }] })
        .mockResolvedValueOnce({ rows: [], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [{ id: 'tag-id' }], rowCount: 1 })
        .mockResolvedValue({ rows: [], rowCount: 1 }),
    };
    jest
      .mocked(database.transaction)
      .mockImplementationOnce(async (callback) => callback(client));
    jest
      .spyOn(service, 'findAdminById')
      .mockResolvedValueOnce({ ...publishedProject, id: 'new-project-id' });

    await service.create({
      title: 'Nouveau projet',
      slug: 'nouveau-projet',
      summary: 'Résumé',
      contentMarkdown: '# Contenu',
      published: false,
      tags: [{ name: 'NestJS', slug: 'nestjs' }],
      links: [
        {
          label: 'Site',
          url: 'https://example.com',
          type: 'website',
        },
      ],
    });

    expect(client.query).toHaveBeenNthCalledWith(1, projectsSql.create, [
      'Nouveau projet',
      'nouveau-projet',
      'Résumé',
      '# Contenu',
      'draft',
      null,
      null,
      false,
      false,
      null,
      null,
    ]);
    expect(client.query).toHaveBeenCalledWith(projectsSql.upsertTag, [
      'NestJS',
      'nestjs',
    ]);
    expect(client.query).toHaveBeenCalledWith(projectsSql.addLink, [
      'new-project-id',
      'Site',
      'https://example.com',
      'website',
    ]);
  });
});
