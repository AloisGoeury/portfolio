import { DatabaseService } from './database.service';
import { seedPageContent } from './seed-page-content';

describe('seedPageContent', () => {
  const database = {
    transaction: jest.fn(),
  } as unknown as DatabaseService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates the initial pages in current and history', async () => {
    const client = {
      query: jest
        .fn()
        .mockResolvedValueOnce({ rows: [], rowCount: 0 })
        .mockResolvedValueOnce({ rows: [], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [], rowCount: 0 })
        .mockResolvedValue({ rows: [], rowCount: 1 }),
    };
    jest
      .mocked(database.transaction)
      .mockImplementationOnce(async (callback) => callback(client));

    await expect(seedPageContent(database)).resolves.toBe(true);

    expect(client.query).toHaveBeenCalledTimes(24);
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO page_content_current'),
      expect.arrayContaining(['home', 1, 'sectionTitle', 'Travaux récents']),
    );
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO page_content_current'),
      expect.arrayContaining([
        'about',
        1,
        'title',
        'Faire moins, mais le faire avec soin.',
      ]),
    );
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO page_content_history'),
      expect.arrayContaining(['about', 1, 'linkLabel']),
    );
  });

  it('does not overwrite an existing page', async () => {
    const client = {
      query: jest.fn().mockResolvedValue({
        rows: [{ '?column?': 1 }],
        rowCount: 1,
      }),
    };
    jest
      .mocked(database.transaction)
      .mockImplementationOnce(async (callback) => callback(client));

    await expect(seedPageContent(database)).resolves.toBe(false);
    expect(client.query).toHaveBeenCalledTimes(2);
  });
});
