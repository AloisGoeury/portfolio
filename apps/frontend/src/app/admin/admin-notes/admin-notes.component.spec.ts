import { of } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotesApiService } from '../../core/notes-api.service';
import { AdminNotesComponent } from './admin-notes.component';

describe('AdminNotesComponent', () => {
    let fixture: ComponentFixture<AdminNotesComponent>;
    const notesApi = {
        listAdmin: vi.fn(() => of([])),
        update: vi.fn(),
        delete: vi.fn(),
    };
    const note = {
        id: 'note-id',
        projectId: 'project-id',
        projectTitle: 'Portfolio',
        projectSlug: 'portfolio',
        title: 'Une note',
        slug: 'une-note',
        excerpt: 'Résumé',
        contentMarkdown: 'Contenu',
        published: false,
        publishedAt: null,
        createdAt: '2026-06-14T12:00:00.000Z',
        updatedAt: '2026-06-14T12:00:00.000Z',
    };

    beforeEach(async () => {
        vi.clearAllMocks();
        notesApi.listAdmin.mockReturnValue(of([]));
        await TestBed.configureTestingModule({
            imports: [AdminNotesComponent],
            providers: [
                provideRouter([]),
                { provide: NotesApiService, useValue: notesApi },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(AdminNotesComponent);
        fixture.detectChanges();
    });

    it('loads the notes and exposes the GitHub queue action', () => {
        expect(notesApi.listAdmin).toHaveBeenCalled();
        expect(fixture.nativeElement.textContent).toContain('File GitHub');
        expect(fixture.nativeElement.textContent).toContain(
            'Aucune note dans le CMS.',
        );
    });

    it('publishes and removes a note from the list', () => {
        notesApi.update.mockReturnValue(of({ ...note, published: true }));
        notesApi.delete.mockReturnValue(of(undefined));
        fixture.componentInstance.notes.set([note]);
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Une note');
        const buttons = fixture.nativeElement.querySelectorAll('button');
        buttons[0].click();
        fixture.detectChanges();
        expect(fixture.componentInstance.notes()[0].published).toBe(true);

        vi.spyOn(window, 'confirm').mockReturnValue(true);
        buttons[1].click();
        expect(fixture.componentInstance.notes()).toEqual([]);
    });

    it('keeps a note when deletion is cancelled', () => {
        fixture.componentInstance.notes.set([note]);
        vi.spyOn(window, 'confirm').mockReturnValue(false);
        fixture.componentInstance.remove(note);
        expect(notesApi.delete).not.toHaveBeenCalled();
    });
});
