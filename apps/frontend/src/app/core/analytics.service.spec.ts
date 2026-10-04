import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
    const track = vi.fn();
    let router: { url: string };
    let document: { defaultView: { umami?: { track: typeof track } } | null };
    let service: AnalyticsService;

    beforeEach(() => {
        track.mockReset();
        router = { url: '/projets' };
        document = { defaultView: { umami: { track } } };
        TestBed.configureTestingModule({
            providers: [
                { provide: DOCUMENT, useValue: document },
                { provide: Router, useValue: router },
            ],
        });
        service = TestBed.inject(AnalyticsService);
    });

    it('sends the event and its properties exactly once', () => {
        service.track('project-open', { project: 'portfolio', source: 'home' });
        expect(track).toHaveBeenCalledExactlyOnceWith('project-open', {
            project: 'portfolio',
            source: 'home',
        });
    });

    it.each(['/admin', '/admin/projects', '/admin?tab=1', '/admin;tab=1'])(
        'ignores clicks from %s',
        (url) => {
            router.url = url;
            service.track('contact-click', {});
            expect(track).not.toHaveBeenCalled();
        },
    );

    it('does not exclude public project slugs containing admin', () => {
        router.url = '/projets/admin';
        service.track('contact-click', {});
        expect(track).toHaveBeenCalledOnce();
    });

    it('works without a browser window', () => {
        document.defaultView = null;
        expect(() => service.track('contact-click', {})).not.toThrow();
    });

    it('works before the tracker loads and uses it on subsequent clicks', () => {
        document.defaultView = {};
        expect(() => service.track('contact-click', {})).not.toThrow();
        document.defaultView.umami = { track };
        service.track('contact-click', {});
        expect(track).toHaveBeenCalledOnce();
    });

    it('isolates synchronous tracker errors', () => {
        track.mockImplementation(() => {
            throw new Error('Tracker unavailable');
        });
        expect(() => service.track('contact-click', {})).not.toThrow();
    });

    it('handles rejected tracker requests', async () => {
        track.mockRejectedValue(new Error('Network unavailable'));
        service.track('contact-click', {});
        await Promise.resolve();
        expect(track).toHaveBeenCalledOnce();
    });
});
