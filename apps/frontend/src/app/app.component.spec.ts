import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './core/auth.service';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('renders the public navigation and footer', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { isAuthenticated: () => false },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('header')?.textContent).toContain(
      'Aloïs Goeury',
    );
    expect(element.querySelector('nav')?.textContent).toContain('Projets');
    expect(element.querySelector('nav')?.textContent).toContain('Notes');
    expect(element.querySelector('nav')?.textContent).toContain('À propos');
    expect(element.querySelector('footer')?.textContent).toContain(
      'Conçu et écrit avec attention.',
    );
  });

  it('shows an admin link when the visitor is authenticated', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { isAuthenticated: () => true },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('nav')?.textContent).toContain(
      'Admin',
    );
  });
});
