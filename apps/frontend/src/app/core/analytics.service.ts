import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

export type AnalyticsEvent =
    | 'navigation-click'
    | 'project-open'
    | 'project-link-click'
    | 'contact-click';

export type AnalyticsProperties = Record<string, string>;

export interface UmamiTracker {
    track: (
        event: AnalyticsEvent,
        properties: AnalyticsProperties,
    ) => void | Promise<unknown>;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
    private readonly document = inject(DOCUMENT);
    private readonly router = inject(Router);

    track(event: AnalyticsEvent, properties: AnalyticsProperties): void {
        if (/^\/admin(?:[/?#;]|$)/.test(this.router.url)) {
            return;
        }

        const browser = this.document.defaultView as
            | (Window & { umami?: UmamiTracker })
            | null;

        // Analytics must never interrupt navigation, even if the tracker fails.
        try {
            const result = browser?.umami?.track(event, properties);
            void Promise.resolve(result).catch(() => undefined);
        } catch {
            // The tracker may be unavailable or blocked by the browser.
        }
    }
}
