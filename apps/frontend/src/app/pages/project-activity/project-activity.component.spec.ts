import { TestBed } from '@angular/core/testing';
import { ProjectActivityComponent } from './project-activity.component';

describe('ProjectActivityComponent', () => {
    it('renders the update date and commit link', async () => {
        await TestBed.configureTestingModule({
            imports: [ProjectActivityComponent],
        }).compileComponents();

        const fixture = TestBed.createComponent(ProjectActivityComponent);
        fixture.componentRef.setInput('date', '2026-06-14T12:00:00.000Z');
        fixture.componentRef.setInput(
            'commitUrl',
            'https://github.com/example/repo/commit/abc',
        );
        fixture.componentRef.setInput(
            'commitMessage',
            'Ajoute une fonctionnalité',
        );
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain(
            'Dernière mise à jour',
        );
        expect(fixture.nativeElement.textContent).toContain('14 juin 2026');
        expect(fixture.nativeElement.querySelector('a')?.textContent).toContain(
            'Ajoute une fonctionnalité',
        );
    });

    it('hides commit details in compact mode', async () => {
        await TestBed.configureTestingModule({
            imports: [ProjectActivityComponent],
        }).compileComponents();

        const fixture = TestBed.createComponent(ProjectActivityComponent);
        fixture.componentRef.setInput('date', '2026-06-14T12:00:00.000Z');
        fixture.componentRef.setInput(
            'commitUrl',
            'https://example.com/commit',
        );
        fixture.componentRef.setInput('compact', true);
        fixture.detectChanges();

        expect(
            fixture.nativeElement.querySelector('.activity-compact'),
        ).not.toBe(null);
        expect(fixture.nativeElement.querySelector('a')).toBeNull();
    });
});
