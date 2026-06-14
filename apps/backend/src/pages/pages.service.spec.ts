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

const homeRow = {
    pageName: 'home',
    version: 1,
    updatedAt: '2026-06-14T10:00:00.000Z',
    cells: {
        eyebrow: 'Développeur',
        title: 'Titre accueil',
        introduction: 'Introduction',
        linkLabel: 'Voir les projets',
        sectionEyebrow: 'Sélection',
        sectionTitle: 'Travaux récents',
        emptyMessage: 'Aucun projet.',
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

    it('maps the current home page and its history', async () => {
        jest.mocked(database.query)
            .mockResolvedValueOnce({
                rows: [homeRow],
                rowCount: 1,
            } as never)
            .mockResolvedValueOnce({
                rows: [{ ...homeRow, version: 2 }, homeRow],
                rowCount: 2,
            } as never);

        await expect(service.findHome()).resolves.toMatchObject({
            pageName: 'home',
            title: 'Titre accueil',
            sectionTitle: 'Travaux récents',
        });
        await expect(service.listHomeHistory()).resolves.toEqual([
            expect.objectContaining({ version: 2 }),
            expect.objectContaining({ version: 1 }),
        ]);
        expect(database.query).toHaveBeenNthCalledWith(
            1,
            pagesSql.findCurrent,
            ['home'],
        );
        expect(database.query).toHaveBeenNthCalledWith(
            2,
            pagesSql.listHistory,
            ['home'],
        );
    });

    it('writes the new version to current and history in one transaction', async () => {
        const client = {
            query: jest
                .fn()
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ version: 1 }] })
                .mockResolvedValue({ rows: [], rowCount: 1 }),
        };
        jest.mocked(database.transaction).mockImplementationOnce(
            async (callback) => callback(client),
        );
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

    it('writes a new home version with the home page key', async () => {
        const client = {
            query: jest
                .fn()
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ version: 1 }] })
                .mockResolvedValue({ rows: [], rowCount: 1 }),
        };
        jest.mocked(database.transaction).mockImplementationOnce(
            async (callback) => callback(client),
        );
        jest.spyOn(service, 'findHome').mockResolvedValueOnce({
            pageName: 'home',
            version: 2,
            updatedAt: '2026-06-14T11:00:00.000Z',
            eyebrow: 'Profil',
            title: 'Nouvel accueil',
            introduction: 'Nouvelle introduction',
            linkLabel: 'Mes projets',
            sectionEyebrow: 'Sélection',
            sectionTitle: 'Projets choisis',
            emptyMessage: 'Aucun projet.',
        });

        await service.updateHome({
            eyebrow: 'Profil',
            title: 'Nouvel accueil',
            introduction: 'Nouvelle introduction',
            linkLabel: 'Mes projets',
            sectionEyebrow: 'Sélection',
            sectionTitle: 'Projets choisis',
            emptyMessage: 'Aucun projet.',
        });

        expect(client.query).toHaveBeenNthCalledWith(1, pagesSql.lockPage, [
            'home',
        ]);
        expect(client.query).toHaveBeenCalledWith(
            pagesSql.insertCurrent,
            expect.arrayContaining([
                'home',
                2,
                'sectionTitle',
                'Projets choisis',
            ]),
        );
        expect(client.query).toHaveBeenCalledWith(
            pagesSql.insertHistory,
            expect.arrayContaining([
                'home',
                2,
                'sectionTitle',
                'Projets choisis',
            ]),
        );
    });
});
