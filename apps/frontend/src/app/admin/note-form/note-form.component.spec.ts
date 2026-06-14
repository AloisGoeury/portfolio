import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { NotesApiService } from '../../core/notes-api.service';
import { ProjectsApiService } from '../../core/projects-api.service';
import { NoteFormComponent } from './note-form.component';

describe('NoteFormComponent', () => {
    it('suggests a normalized slug from the title', async () => {
        await TestBed.configureTestingModule({
            imports: [NoteFormComponent],
            providers: [
                provideRouter([]),
                {
                    provide: NotesApiService,
                    useValue: {
                        create: vi.fn(),
                        update: vi.fn(),
                        findAdmin: vi.fn(),
                    },
                },
                {
                    provide: ProjectsApiService,
                    useValue: { listAdmin: vi.fn(() => of([])) },
                },
            ],
        }).compileComponents();

        const fixture = TestBed.createComponent(NoteFormComponent);
        fixture.componentInstance.form.controls.title.setValue(
            'Étape importante',
        );
        fixture.componentInstance.suggestSlug();

        expect(fixture.componentInstance.form.controls.slug.value).toBe(
            'etape-importante',
        );
    });

    it('creates a note associated with a project', async () => {
        const notesApi = {
            create: vi.fn(() => of({})),
            update: vi.fn(),
            findAdmin: vi.fn(),
        };
        await TestBed.configureTestingModule({
            imports: [NoteFormComponent],
            providers: [
                provideRouter([]),
                { provide: NotesApiService, useValue: notesApi },
                {
                    provide: ProjectsApiService,
                    useValue: {
                        listAdmin: vi.fn(() =>
                            of([{ id: 'project-id', title: 'Portfolio' }]),
                        ),
                    },
                },
            ],
        }).compileComponents();

        const fixture = TestBed.createComponent(NoteFormComponent);
        fixture.componentInstance.form.patchValue({
            projectId: 'project-id',
            title: 'Une note',
            slug: 'une-note',
            excerpt: 'Résumé',
            contentMarkdown: 'Contenu',
            published: true,
        });
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Portfolio');
        fixture.nativeElement
            .querySelector('form')
            .dispatchEvent(new Event('submit'));

        expect(notesApi.create).toHaveBeenCalledWith({
            projectId: 'project-id',
            title: 'Une note',
            slug: 'une-note',
            excerpt: 'Résumé',
            contentMarkdown: 'Contenu',
            published: true,
        });
    });

    it('does not submit an invalid form', async () => {
        const notesApi = {
            create: vi.fn(),
            update: vi.fn(),
            findAdmin: vi.fn(),
        };
        await TestBed.configureTestingModule({
            imports: [NoteFormComponent],
            providers: [
                provideRouter([]),
                { provide: NotesApiService, useValue: notesApi },
                {
                    provide: ProjectsApiService,
                    useValue: { listAdmin: vi.fn(() => of([])) },
                },
            ],
        }).compileComponents();

        const fixture = TestBed.createComponent(NoteFormComponent);
        fixture.detectChanges();
        fixture.nativeElement
            .querySelector('form')
            .dispatchEvent(new Event('submit'));
        expect(notesApi.create).not.toHaveBeenCalled();
    });

    it('loads and updates an existing note without a linked project', async () => {
        const note = {
            id: 'note-id',
            projectId: null,
            projectTitle: null,
            projectSlug: null,
            title: 'Note existante',
            slug: 'note-existante',
            excerpt: '',
            contentMarkdown: 'Contenu',
            published: false,
            publishedAt: null,
            createdAt: '2026-06-14T12:00:00.000Z',
            updatedAt: '2026-06-14T12:00:00.000Z',
        };
        const notesApi = {
            create: vi.fn(),
            update: vi.fn(() => of(note)),
            findAdmin: vi.fn(() => of(note)),
        };
        await TestBed.configureTestingModule({
            imports: [NoteFormComponent],
            providers: [
                provideRouter([]),
                { provide: NotesApiService, useValue: notesApi },
                {
                    provide: ProjectsApiService,
                    useValue: { listAdmin: vi.fn(() => of([])) },
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: { get: () => 'note-id' } },
                    },
                },
            ],
        }).compileComponents();
        const fixture = TestBed.createComponent(NoteFormComponent);
        fixture.detectChanges();

        expect(fixture.componentInstance.form.controls.projectId.value).toBe(
            '',
        );
        fixture.componentInstance.suggestSlug();
        fixture.componentInstance.save();
        expect(notesApi.update).toHaveBeenCalledWith(
            'note-id',
            expect.objectContaining({
                title: 'Note existante',
                projectId: null,
            }),
        );
    });
});
