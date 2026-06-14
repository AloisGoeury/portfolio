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

  it('loads the public home page', () => {
    service.findHome().subscribe();

    const request = http.expectOne('/api/pages/home');
    expect(request.request.method).toBe('GET');
    request.flush({});
  });

  it('loads and updates the protected home page', () => {
    const payload = {
      eyebrow: 'Profil',
      title: 'Titre',
      introduction: 'Introduction',
      linkLabel: 'Projets',
      sectionEyebrow: 'Sélection',
      sectionTitle: 'Travaux',
      emptyMessage: 'Aucun projet.',
    };

    service.findHomeAdmin().subscribe();
    http.expectOne('/api/admin/pages/home').flush({});

    service.updateHome(payload).subscribe();
    const updateRequest = http.expectOne('/api/admin/pages/home');
    expect(updateRequest.request.method).toBe('PATCH');
    expect(updateRequest.request.body).toEqual(payload);
    updateRequest.flush({});

    service.listHomeHistory().subscribe();
    const historyRequest = http.expectOne('/api/admin/pages/home/history');
    expect(historyRequest.request.method).toBe('GET');
    historyRequest.flush([]);
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
