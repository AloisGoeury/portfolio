import { convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { ProjectsApiService } from '../../core/projects-api.service';
import { ProjectDetailComponent } from './project-detail.component';

describe('ProjectDetailComponent', () => {
    it('links to the latest GitHub commit', async () => {
        await TestBed.configureTestingModule({
            imports: [ProjectDetailComponent],
            providers: [
                provideRouter([]),
                {
                    provide: ActivatedRoute,
                    useValue: {
                        paramMap: of(convertToParamMap({ slug: 'portfolio' })),
                    },
                },
                {
                    provide: ProjectsApiService,
                    useValue: {
                        findPublished: () =>
                            of({
                                id: 'project-id',
                                title: 'Portfolio',
                                slug: 'portfolio',
                                summary: 'Résumé',
                                contentMarkdown: '# Contenu',
                                category: 'Web',
                                coverUrl: 'https://example.com/cover.jpg',
                                tags: [
                                    {
                                        id: 'tag-id',
                                        name: 'Angular',
                                        slug: 'angular',
                                    },
                                ],
                                links: [
                                    {
                                        id: 'link-id',
                                        label: 'Dépôt',
                                        url: 'https://github.com/example/repo',
                                    },
                                ],
                                lastCommitAt: '2026-06-14T12:00:00.000Z',
                                lastCommitUrl:
                                    'https://github.com/example/repo/commit/abc',
                                lastCommitMessage: 'Ajoute la synchronisation',
                            }),
                    },
                },
            ],
        }).compileComponents();

        const fixture = TestBed.createComponent(ProjectDetailComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const commitLink = Array.from(
            fixture.nativeElement.querySelectorAll(
                'a',
            ) as NodeListOf<HTMLAnchorElement>,
        ).find((link) =>
            link.textContent?.includes('Ajoute la synchronisation'),
        );
        expect(commitLink?.href).toBe(
            'https://github.com/example/repo/commit/abc',
        );
        expect(fixture.nativeElement.querySelector('img')).not.toBeNull();
        expect(fixture.nativeElement.textContent).toContain('Angular');
        expect(fixture.nativeElement.textContent).toContain('Dépôt');
    });

    it('renders a project without optional media or GitHub activity', async () => {
        await TestBed.configureTestingModule({
            imports: [ProjectDetailComponent],
            providers: [
                provideRouter([]),
                {
                    provide: ActivatedRoute,
                    useValue: {
                        paramMap: of(convertToParamMap({ slug: 'simple' })),
                    },
                },
                {
                    provide: ProjectsApiService,
                    useValue: {
                        findPublished: () =>
                            of({
                                id: 'project-id',
                                title: 'Simple',
                                slug: 'simple',
                                summary: 'Résumé',
                                contentMarkdown: 'Contenu',
                                category: null,
                                coverUrl: null,
                                tags: [],
                                links: [],
                                lastCommitAt: null,
                            }),
                    },
                },
            ],
        }).compileComponents();
        const fixture = TestBed.createComponent(ProjectDetailComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Simple');
        expect(fixture.nativeElement.querySelector('img')).toBeNull();
    });

    it('shows a generic commit label when the message is empty', async () => {
        await TestBed.configureTestingModule({
            imports: [ProjectDetailComponent],
            providers: [
                provideRouter([]),
                {
                    provide: ActivatedRoute,
                    useValue: {
                        paramMap: of(convertToParamMap({ slug: 'simple' })),
                    },
                },
                {
                    provide: ProjectsApiService,
                    useValue: {
                        findPublished: () =>
                            of({
                                id: 'project-id',
                                title: 'Simple',
                                slug: 'simple',
                                summary: 'Résumé',
                                contentMarkdown: 'Contenu',
                                category: null,
                                coverUrl: null,
                                tags: [],
                                links: [],
                                lastCommitAt: '2026-06-14T12:00:00.000Z',
                                lastCommitUrl: 'https://example.com/commit',
                                lastCommitMessage: null,
                            }),
                    },
                },
            ],
        }).compileComponents();
        const fixture = TestBed.createComponent(ProjectDetailComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain(
            'Voir le dernier commit',
        );
    });
});
