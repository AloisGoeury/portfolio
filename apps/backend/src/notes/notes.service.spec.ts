import { UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { NotesService } from './notes.service';
import { notesSql } from './notes.sql';

describe('NotesService', () => {
  const database = {
    query: jest.fn(),
    transaction: jest.fn(),
  } as unknown as DatabaseService;
  const service = new NotesService(database);

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GITHUB_UPDATES_SECRET = 'test-secret';
  });

  it('rejects GitHub updates without the integration secret', async () => {
    await expect(
      service.receiveGithubUpdate(undefined, {
        projectSlug: 'portfolio',
        repositoryUrl: 'https://github.com/example/portfolio',
        commitSha: 'abcdef123456',
        commitUrl: 'https://github.com/example/portfolio/commit/abcdef123456',
        commitMessage: 'Mise à jour',
        committedAt: '2026-06-14T12:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(database.query).not.toHaveBeenCalled();
  });

  it('checks the linked repository and parameterizes the queued update', async () => {
    jest
      .mocked(database.query)
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'project-id',
            title: 'Portfolio',
            slug: 'portfolio',
            githubRepositoryUrl: 'https://github.com/example/portfolio',
          },
        ],
      } as never)
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'queue-id',
            projectId: 'project-id',
            projectTitle: 'Portfolio',
            projectSlug: 'portfolio',
            status: 'pending',
          },
        ],
      } as never);
    const client = {
      query: jest
        .fn()
        .mockResolvedValueOnce({ rows: [], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [{ id: 'queue-id' }], rowCount: 1 }),
    };
    jest
      .mocked(database.transaction)
      .mockImplementationOnce(async (callback) => callback(client));

    await service.receiveGithubUpdate('Bearer test-secret', {
      projectSlug: 'portfolio',
      repositoryUrl: 'https://github.com/example/portfolio.git',
      commitSha: 'abcdef123456',
      commitUrl: 'https://github.com/example/portfolio/commit/abcdef123456',
      commitMessage: 'Mise à jour',
      committedAt: '2026-06-14T12:00:00.000Z',
      authorName: 'Aloïs',
    });

    expect(database.query).toHaveBeenNthCalledWith(
      1,
      notesSql.findProjectForUpdate,
      ['portfolio'],
    );
    expect(client.query).toHaveBeenNthCalledWith(1, notesSql.updateLastCommit, [
      'project-id',
      'abcdef123456',
      'https://github.com/example/portfolio/commit/abcdef123456',
      'Mise à jour',
      '2026-06-14T12:00:00.000Z',
    ]);
    expect(client.query).toHaveBeenNthCalledWith(
      2,
      notesSql.enqueueProjectUpdate,
      expect.arrayContaining([
        'project-id',
        'abcdef123456',
        'https://github.com/example/portfolio/commit/abcdef123456',
        'Mise à jour',
      ]),
    );
  });
});
