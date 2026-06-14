import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PagesApiService } from '../../core/pages-api.service';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
    let fixture: ComponentFixture<AboutComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AboutComponent],
            providers: [
                provideRouter([]),
                {
                    provide: PagesApiService,
                    useValue: {
                        findAbout: () =>
                            of({
                                pageName: 'about',
                                version: 1,
                                updatedAt: '2026-06-14T10:00:00.000Z',
                                eyebrow: 'Profil',
                                title: 'Titre administrable',
                                bodyMarkdown: '**Contenu** administrable.',
                                linkLabel: 'Découvrir les projets',
                            }),
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AboutComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    });

    it('renders the page content returned by the API', () => {
        const element = fixture.nativeElement as HTMLElement;

        expect(element.querySelector('h1')?.textContent).toContain(
            'Titre administrable',
        );
        expect(element.querySelector('.prose strong')?.textContent).toBe(
            'Contenu',
        );
        expect(element.querySelector('.text-link')?.textContent).toContain(
            'Découvrir les projets',
        );
    });
});
