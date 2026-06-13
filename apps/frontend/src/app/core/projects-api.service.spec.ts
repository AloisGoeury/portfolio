import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProjectsApiService } from './projects-api.service';

describe('ProjectsApiService', () => {
  let service: ProjectsApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProjectsApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ProjectsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('loads published projects from the public API', () => {
    service.listPublished().subscribe((projects) => {
      expect(projects).toEqual([]);
    });

    const request = http.expectOne('/api/projects');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('uses the protected endpoint when updating a project', () => {
    service.update('project-id', { published: true }).subscribe();

    const request = http.expectOne('/api/admin/projects/project-id');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ published: true });
    request.flush({});
  });
});
