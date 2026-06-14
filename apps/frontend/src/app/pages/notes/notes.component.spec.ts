import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { NotesApiService } from '../../core/notes-api.service';
import { NotesComponent } from './notes.component';

describe('NotesComponent', () => {
  it('renders published notes returned by the API', async () => {
    await TestBed.configureTestingModule({
      imports: [NotesComponent],
      providers: [
        {
          provide: NotesApiService,
          useValue: {
            listPublished: () =>
              of([
                {
                  id: 'note-id',
                  projectId: null,
                  projectTitle: null,
                  projectSlug: null,
                  title: 'Une note',
                  slug: 'une-note',
                  excerpt: 'Résumé',
                  contentMarkdown: '**Contenu**',
                  published: true,
                  publishedAt: '2026-06-14T12:00:00.000Z',
                  createdAt: '2026-06-14T12:00:00.000Z',
                  updatedAt: '2026-06-14T12:00:00.000Z',
                },
              ]),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(NotesComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Une note');
    expect(fixture.nativeElement.querySelector('strong')?.textContent).toBe(
      'Contenu',
    );
  });

  it('shows an empty state when no note is published', async () => {
    await TestBed.configureTestingModule({
      imports: [NotesComponent],
      providers: [
        {
          provide: NotesApiService,
          useValue: { listPublished: () => of([]) },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(NotesComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'Aucune note publiée pour le moment.',
    );
  });

  it('falls back to the creation date and omits an empty excerpt', async () => {
    await TestBed.configureTestingModule({
      imports: [NotesComponent],
      providers: [
        {
          provide: NotesApiService,
          useValue: {
            listPublished: () =>
              of([
                {
                  id: 'note-id',
                  title: 'Sans résumé',
                  excerpt: '',
                  contentMarkdown: 'Contenu',
                  publishedAt: null,
                  createdAt: '2026-06-14T12:00:00.000Z',
                },
              ]),
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(NotesComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Sans résumé');
    expect(fixture.nativeElement.querySelectorAll('article > p')).toHaveLength(
      0,
    );
  });
});
