import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotesApiService } from '../../core/notes-api.service';
import { ProjectUpdatesComponent } from './project-updates.component';

describe('ProjectUpdatesComponent', () => {
    it('only displays pending GitHub proposals', async () => {
        const notesApi = {
            listProjectUpdates: vi.fn(() =>
                of([
                    {
                        id: 'pending',
                        projectId: 'project-id',
                        projectTitle: 'Portfolio',
                        projectSlug: 'portfolio',
                        commitSha: 'abcdef123456',
                        commitUrl: 'https://example.com/commit',
                        commitMessage: 'Mise à jour',
                        committedAt: '2026-06-14T12:00:00.000Z',
                        authorName: null,
                        proposedTitle: 'Mise à jour',
                        proposedContentMarkdown: 'Contenu',
                        status: 'pending' as const,
                        noteId: null,
                        createdAt: '2026-06-14T12:00:00.000Z',
                        updatedAt: '2026-06-14T12:00:00.000Z',
                    },
                ]),
            ),
        };
        await TestBed.configureTestingModule({
            imports: [ProjectUpdatesComponent],
            providers: [
                provideRouter([]),
                { provide: NotesApiService, useValue: notesApi },
            ],
        }).compileComponents();

        const fixture = TestBed.createComponent(ProjectUpdatesComponent);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Portfolio');
        expect(fixture.nativeElement.textContent).toContain(
            'Publier dans les notes',
        );
    });

    it('saves, publishes and ignores pending proposals', async () => {
        const update = {
            id: 'pending',
            projectId: 'project-id',
            projectTitle: 'Portfolio',
            projectSlug: 'portfolio',
            commitSha: 'abcdef123456',
            commitUrl: 'https://example.com/commit',
            commitMessage: 'Mise à jour',
            committedAt: '2026-06-14T12:00:00.000Z',
            authorName: null,
            proposedTitle: 'Mise à jour',
            proposedContentMarkdown: 'Contenu',
            status: 'pending' as const,
            noteId: null,
            createdAt: '2026-06-14T12:00:00.000Z',
            updatedAt: '2026-06-14T12:00:00.000Z',
        };
        const notesApi = {
            listProjectUpdates: vi.fn(() => of([update])),
            updateProjectUpdate: vi.fn(() => of(update)),
            publishProjectUpdate: vi.fn(() => of({})),
            ignoreProjectUpdate: vi.fn(() =>
                of({ ...update, status: 'ignored' }),
            ),
        };
        await TestBed.configureTestingModule({
            imports: [ProjectUpdatesComponent],
            providers: [
                provideRouter([]),
                { provide: NotesApiService, useValue: notesApi },
            ],
        }).compileComponents();
        const fixture = TestBed.createComponent(ProjectUpdatesComponent);
        fixture.detectChanges();
        const editable = fixture.componentInstance.updates()[0];

        const buttons = fixture.nativeElement.querySelectorAll('button');
        buttons[0].click();
        expect(notesApi.updateProjectUpdate).toHaveBeenCalled();

        buttons[1].click();
        expect(notesApi.publishProjectUpdate).toHaveBeenCalledWith(
            'pending',
            expect.objectContaining({ published: true }),
        );
        expect(fixture.componentInstance.updates()).toEqual([]);

        fixture.componentInstance.updates.set([editable]);
        fixture.detectChanges();
        fixture.nativeElement.querySelectorAll('button')[2].click();
        expect(fixture.componentInstance.updates()).toEqual([]);
    });

    it('shows the empty state when every proposal is already handled', async () => {
        await TestBed.configureTestingModule({
            imports: [ProjectUpdatesComponent],
            providers: [
                provideRouter([]),
                {
                    provide: NotesApiService,
                    useValue: {
                        listProjectUpdates: vi.fn(() =>
                            of([{ id: 'handled', status: 'published' }]),
                        ),
                    },
                },
            ],
        }).compileComponents();
        const fixture = TestBed.createComponent(ProjectUpdatesComponent);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain(
            'Aucune proposition GitHub en attente.',
        );
    });
});
