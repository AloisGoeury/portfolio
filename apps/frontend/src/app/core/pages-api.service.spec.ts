import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PagesApiService } from './pages-api.service';

describe('PagesApiService', () => {
  let service: PagesApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PagesApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(PagesApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('loads the public about page', () => {
    service.findAbout().subscribe();

    const request = http.expectOne('/api/pages/about');
    expect(request.request.method).toBe('GET');
    request.flush({});
  });

  it('updates the about page through the protected endpoint', () => {
    const payload = {
      eyebrow: 'Profil',
      title: 'Titre',
      bodyMarkdown: 'Contenu',
      linkLabel: 'Projets',
    };

    service.updateAbout(payload).subscribe();

    const request = http.expectOne('/api/admin/pages/about');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(payload);
    request.flush({});
  });

  it('loads the protected page history', () => {
    service.listAboutHistory().subscribe();

    const request = http.expectOne('/api/admin/pages/about/history');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });
});
