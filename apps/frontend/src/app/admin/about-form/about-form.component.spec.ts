import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PagesApiService } from '../../core/pages-api.service';
import { AboutFormComponent } from './about-form.component';

const aboutPage = {
  pageName: 'about',
  version: 1,
  updatedAt: '2026-06-14T10:00:00.000Z',
  eyebrow: 'À propos',
  title: 'Titre',
  bodyMarkdown: 'Contenu',
  linkLabel: 'Projets',
};

describe('AboutFormComponent', () => {
  let fixture: ComponentFixture<AboutFormComponent>;
  let component: AboutFormComponent;
  const pagesApi = {
    findAboutAdmin: vi.fn(() => of(aboutPage)),
    listAboutHistory: vi.fn(() => of([aboutPage])),
    updateAbout: vi.fn(() => of({ ...aboutPage, version: 2 })),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [AboutFormComponent],
      providers: [
        provideRouter([]),
        { provide: PagesApiService, useValue: pagesApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the current content and its history', () => {
    expect(component.form.getRawValue()).toEqual({
      eyebrow: 'À propos',
      title: 'Titre',
      bodyMarkdown: 'Contenu',
      linkLabel: 'Projets',
    });
    expect(component.history()).toEqual([aboutPage]);
  });

  it('saves a new version and refreshes the history', () => {
    component.form.controls.title.setValue('Titre version 2');
    component.save();

    expect(pagesApi.updateAbout).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Titre version 2' }),
    );
    expect(component.current()?.version).toBe(2);
    expect(component.saved()).toBe(true);
    expect(pagesApi.listAboutHistory).toHaveBeenCalledTimes(2);
  });
});
