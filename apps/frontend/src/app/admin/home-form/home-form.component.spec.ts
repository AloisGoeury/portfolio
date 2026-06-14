import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PagesApiService } from '../../core/pages-api.service';
import { HomeFormComponent } from './home-form.component';

const homePage = {
    pageName: 'home',
    version: 1,
    updatedAt: '2026-06-14T10:00:00.000Z',
    eyebrow: 'Profil',
    title: 'Titre',
    introduction: 'Introduction',
    linkLabel: 'Projets',
    sectionEyebrow: 'Sélection',
    sectionTitle: 'Travaux récents',
    emptyMessage: 'Aucun projet.',
};

describe('HomeFormComponent', () => {
    let fixture: ComponentFixture<HomeFormComponent>;
    let component: HomeFormComponent;
    const pagesApi = {
        findHomeAdmin: vi.fn(() => of(homePage)),
        listHomeHistory: vi.fn(() => of([homePage])),
        updateHome: vi.fn(() => of({ ...homePage, version: 2 })),
    };

    beforeEach(async () => {
        vi.clearAllMocks();
        await TestBed.configureTestingModule({
            imports: [HomeFormComponent],
            providers: [
                provideRouter([]),
                { provide: PagesApiService, useValue: pagesApi },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(HomeFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('loads the current content and its history', () => {
        expect(component.form.getRawValue()).toEqual({
            eyebrow: 'Profil',
            title: 'Titre',
            introduction: 'Introduction',
            linkLabel: 'Projets',
            sectionEyebrow: 'Sélection',
            sectionTitle: 'Travaux récents',
            emptyMessage: 'Aucun projet.',
        });
        expect(component.history()).toEqual([homePage]);
    });

    it('saves a new version and refreshes the history', () => {
        component.form.controls.title.setValue('Titre version 2');
        component.save();

        expect(pagesApi.updateHome).toHaveBeenCalledWith(
            expect.objectContaining({ title: 'Titre version 2' }),
        );
        expect(component.current()?.version).toBe(2);
        expect(component.saved()).toBe(true);
        expect(pagesApi.listHomeHistory).toHaveBeenCalledTimes(2);
    });
});
