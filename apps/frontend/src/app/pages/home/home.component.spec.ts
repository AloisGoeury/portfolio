import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PagesApiService } from '../../core/pages-api.service';
import { ProjectsApiService } from '../../core/projects-api.service';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HomeComponent],
            providers: [
                provideRouter([]),
                {
                    provide: PagesApiService,
                    useValue: {
                        findHome: () =>
                            of({
                                pageName: 'home',
                                version: 2,
                                updatedAt: '2026-06-14T10:00:00.000Z',
                                eyebrow: 'Profil',
                                title: 'Accueil administrable',
                                introduction: 'Une introduction administrable.',
                                linkLabel: 'Découvrir les projets',
                                sectionEyebrow: 'Sélection',
                                sectionTitle: 'Projets choisis',
                                emptyMessage: 'Aucun projet choisi.',
                            }),
                    },
                },
                {
                    provide: ProjectsApiService,
                    useValue: {
                        listPublished: () =>
                            of([
                                {
                                    id: 'featured',
                                    title: 'Projet visible',
                                    slug: 'projet-visible',
                                    summary: 'Résumé',
                                    category: 'Web',
                                    featured: true,
                                    tags: [
                                        { name: 'Angular', slug: 'angular' },
                                    ],
                                },
                                {
                                    id: 'regular',
                                    title: 'Projet non sélectionné',
                                    slug: 'projet-non-selectionne',
                                    summary: 'Résumé',
                                    category: null,
                                    featured: false,
                                    tags: [],
                                },
                            ]),
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(HomeComponent);
        fixture.detectChanges();
    });

    it('renders editable page content and featured projects only', () => {
        const element = fixture.nativeElement as HTMLElement;

        expect(element.querySelector('h1')?.textContent).toContain(
            'Accueil administrable',
        );
        expect(element.querySelector('.hero-copy')?.textContent).toContain(
            'Une introduction administrable.',
        );
        expect(
            element.querySelector('.section-heading h2')?.textContent,
        ).toContain('Projets choisis');
        expect(element.textContent).toContain('Projet visible');
        expect(element.textContent).not.toContain('Projet non sélectionné');
    });
});
