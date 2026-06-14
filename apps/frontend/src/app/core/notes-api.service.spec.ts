import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NotesApiService } from './notes-api.service';

describe('NotesApiService', () => {
  let service: NotesApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotesApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(NotesApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads public notes', () => {
    service.listPublished().subscribe((notes) => expect(notes).toEqual([]));
    const request = http.expectOne('/api/notes');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('publishes a queued project update through the admin API', () => {
    service
      .publishProjectUpdate('queue-id', {
        slug: 'mise-a-jour',
        excerpt: 'Résumé',
        published: true,
      })
      .subscribe();

    const request = http.expectOne(
      '/api/admin/project-updates/queue-id/publish',
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      slug: 'mise-a-jour',
      excerpt: 'Résumé',
      published: true,
    });
    request.flush({});
  });

  it('uses the protected note CRUD endpoints', () => {
    service.listAdmin().subscribe();
    http.expectOne('/api/admin/notes').flush([]);

    service.findAdmin('note-id').subscribe();
    http.expectOne('/api/admin/notes/note-id').flush({});

    const payload = {
      projectId: null,
      title: 'Note',
      slug: 'note',
      excerpt: 'Résumé',
      contentMarkdown: 'Contenu',
      published: false,
    };
    service.create(payload).subscribe();
    http.expectOne('/api/admin/notes').flush({});

    service.update('note-id', { published: true }).subscribe();
    http.expectOne('/api/admin/notes/note-id').flush({});

    service.delete('note-id').subscribe();
    http.expectOne('/api/admin/notes/note-id').flush(null);
  });

  it('manages queued project updates', () => {
    service.listProjectUpdates().subscribe();
    http.expectOne('/api/admin/project-updates').flush([]);

    service
      .updateProjectUpdate('queue-id', {
        proposedTitle: 'Titre',
        proposedContentMarkdown: 'Contenu',
      })
      .subscribe();
    http.expectOne('/api/admin/project-updates/queue-id').flush({});

    service.ignoreProjectUpdate('queue-id').subscribe();
    const request = http.expectOne(
      '/api/admin/project-updates/queue-id/ignore',
    );
    expect(request.request.method).toBe('POST');
    request.flush({});
  });
});
