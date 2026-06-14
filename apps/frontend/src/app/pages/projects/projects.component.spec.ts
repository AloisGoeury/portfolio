import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProjectsApiService } from '../../core/projects-api.service';
import { ProjectsComponent } from './projects.component';

describe('ProjectsComponent', () => {
  it('shows the date of the latest GitHub commit', async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ProjectsApiService,
          useValue: {
            listPublished: () =>
              of([
                {
                  id: 'project-id',
                  title: 'Portfolio',
                  slug: 'portfolio',
                  summary: 'Résumé',
                  category: 'Web',
                  startedAt: '2026-01-01',
                  lastCommitAt: '2026-06-14T12:00:00.000Z',
                },
              ]),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProjectsComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Dernière mise à jour');
    expect(fixture.nativeElement.textContent).toContain('14 juin 2026');
  });

  it('shows an empty state when no project is published', async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ProjectsApiService,
          useValue: { listPublished: () => of([]) },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProjectsComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'Aucun projet publié pour le moment.',
    );
  });

  it('renders a project that has not received a GitHub commit yet', async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ProjectsApiService,
          useValue: {
            listPublished: () =>
              of([
                {
                  id: 'project-id',
                  title: 'Projet simple',
                  slug: 'projet-simple',
                  summary: 'Résumé',
                  category: null,
                  startedAt: null,
                  lastCommitAt: null,
                },
              ]),
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProjectsComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Projet simple');
    expect(fixture.nativeElement.textContent).not.toContain(
      'Dernière mise à jour',
    );
  });
});
