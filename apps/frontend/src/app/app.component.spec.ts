import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('renders the public navigation and footer', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
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
});
