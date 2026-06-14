import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { ProjectsApiService } from '../../core/projects-api.service';
import { ProjectFormComponent } from './project-form.component';

describe('ProjectFormComponent', () => {
  it('includes the GitHub repository in the project payload', async () => {
    const projectsApi = {
      create: vi.fn(() => of({})),
      update: vi.fn(),
      findAdmin: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [ProjectFormComponent],
      providers: [
        provideRouter([]),
        { provide: ProjectsApiService, useValue: projectsApi },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProjectFormComponent);
    fixture.componentInstance.form.patchValue({
      title: 'Portfolio',
      slug: 'portfolio',
      summary: 'Résumé',
      githubRepositoryUrl: 'https://github.com/example/portfolio',
    });
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit'));

    expect(projectsApi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        githubRepositoryUrl: 'https://github.com/example/portfolio',
      }),
    );
    expect(fixture.nativeElement.textContent).toContain('Dépôt GitHub lié');
  });

  it('parses optional dates, tags and links when creating a project', async () => {
    const projectsApi = {
      create: vi.fn(() => of({})),
      update: vi.fn(),
      findAdmin: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [ProjectFormComponent],
      providers: [
        provideRouter([]),
        { provide: ProjectsApiService, useValue: projectsApi },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProjectFormComponent);
    fixture.componentInstance.form.patchValue({
      title: 'Projet complet',
      slug: 'projet-complet',
      summary: 'Résumé',
      category: 'Web',
      coverUrl: 'https://example.com/cover.jpg',
      startedAt: '2026-01-01',
      endedAt: '2026-06-14',
      tags: 'Angular, NestJS',
      links:
        'Dépôt | https://github.com/example/repo | github\nSite | https://example.com',
    });
    fixture.componentInstance.save();

    expect(projectsApi.create).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'Web',
        startedAt: '2026-01-01',
        endedAt: '2026-06-14',
        tags: [
          { name: 'Angular', slug: 'angular' },
          { name: 'NestJS', slug: 'nestjs' },
        ],
        links: [
          {
            label: 'Dépôt',
            url: 'https://github.com/example/repo',
            type: 'github',
          },
          {
            label: 'Site',
            url: 'https://example.com',
            type: null,
          },
        ],
      }),
    );
  });

  it('loads and updates an existing project', async () => {
    const project = {
      id: 'project-id',
      title: 'Portfolio',
      slug: 'portfolio',
      summary: 'Résumé',
      contentMarkdown: 'Contenu',
      status: 'published',
      category: null,
      coverUrl: null,
      githubRepositoryUrl: null,
      lastCommitSha: null,
      lastCommitUrl: null,
      lastCommitMessage: null,
      lastCommitAt: null,
      featured: true,
      published: true,
      startedAt: null,
      endedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-06-14T00:00:00.000Z',
      tags: [{ name: 'Angular', slug: 'angular' }],
      links: [
        {
          label: 'Dépôt',
          url: 'https://github.com/example/repo',
          type: null,
        },
      ],
    };
    const projectsApi = {
      create: vi.fn(),
      update: vi.fn(() => of(project)),
      findAdmin: vi.fn(() => of(project)),
    };
    await TestBed.configureTestingModule({
      imports: [ProjectFormComponent],
      providers: [
        provideRouter([]),
        { provide: ProjectsApiService, useValue: projectsApi },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => 'project-id' } },
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProjectFormComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.form.controls.title.value).toBe(
      'Portfolio',
    );
    fixture.componentInstance.suggestSlug();
    fixture.componentInstance.save();
    expect(projectsApi.update).toHaveBeenCalledWith(
      'project-id',
      expect.objectContaining({ title: 'Portfolio' }),
    );
  });

  it('does not save an invalid project', async () => {
    const projectsApi = {
      create: vi.fn(),
      update: vi.fn(),
      findAdmin: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [ProjectFormComponent],
      providers: [
        provideRouter([]),
        { provide: ProjectsApiService, useValue: projectsApi },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProjectFormComponent);
    fixture.componentInstance.save();
    expect(projectsApi.create).not.toHaveBeenCalled();
  });
});
