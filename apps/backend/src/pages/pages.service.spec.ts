import { DatabaseService } from '../database/database.service';
import { pagesSql } from './pages.sql';
import { PagesService } from './pages.service';

const aboutRow = {
  pageName: 'about',
  version: 1,
  updatedAt: '2026-06-14T10:00:00.000Z',
  cells: {
    eyebrow: 'À propos',
    title: 'Titre',
    bodyMarkdown: 'Contenu',
    linkLabel: 'Voir les projets',
  },
};

describe('PagesService', () => {
  const database = {
    query: jest.fn(),
    transaction: jest.fn(),
  } as unknown as DatabaseService;
  const service = new PagesService(database);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads the current page from the fast current table', async () => {
    jest.mocked(database.query).mockResolvedValueOnce({
      rows: [aboutRow],
      rowCount: 1,
    } as never);

    await expect(service.findAbout()).resolves.toMatchObject({
      pageName: 'about',
      version: 1,
      title: 'Titre',
    });
    expect(database.query).toHaveBeenCalledWith(pagesSql.findCurrent, [
      'about',
    ]);
    expect(pagesSql.findCurrent).toContain('page_content_current');
  });

  it('returns every historical version in database order', async () => {
    jest.mocked(database.query).mockResolvedValueOnce({
      rows: [{ ...aboutRow, version: 2 }, aboutRow],
      rowCount: 2,
    } as never);

    await expect(service.listAboutHistory()).resolves.toEqual([
      expect.objectContaining({ version: 2 }),
      expect.objectContaining({ version: 1 }),
    ]);
    expect(pagesSql.listHistory).toContain('page_content_history');
  });

  it('writes the new version to current and history in one transaction', async () => {
    const client = {
      query: jest
        .fn()
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ version: 1 }] })
        .mockResolvedValue({ rows: [], rowCount: 1 }),
    };
    jest
      .mocked(database.transaction)
      .mockImplementationOnce(async (callback) => callback(client));
    jest.spyOn(service, 'findAbout').mockResolvedValueOnce({
      pageName: 'about',
      version: 2,
      updatedAt: '2026-06-14T11:00:00.000Z',
      eyebrow: 'Profil',
      title: 'Nouveau titre',
      bodyMarkdown: 'Nouveau contenu',
      linkLabel: 'Mes projets',
    });

    await service.updateAbout({
      eyebrow: 'Profil',
      title: 'Nouveau titre',
      bodyMarkdown: 'Nouveau contenu',
      linkLabel: 'Mes projets',
    });

    expect(client.query).toHaveBeenNthCalledWith(1, pagesSql.lockPage, [
      'about',
    ]);
    expect(client.query).toHaveBeenNthCalledWith(
      2,
      pagesSql.findCurrentVersion,
      ['about'],
    );
    expect(client.query).toHaveBeenNthCalledWith(3, pagesSql.clearCurrent, [
      'about',
    ]);
    expect(client.query).toHaveBeenCalledWith(
      pagesSql.insertCurrent,
      expect.arrayContaining(['about', 2, 'title', 'Nouveau titre']),
    );
    expect(client.query).toHaveBeenCalledWith(
      pagesSql.insertHistory,
      expect.arrayContaining(['about', 2, 'title', 'Nouveau titre']),
    );
  });
});
