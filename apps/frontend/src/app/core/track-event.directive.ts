import { Directive, inject, input } from '@angular/core';
import {
    AnalyticsEvent,
    AnalyticsProperties,
    AnalyticsService,
} from './analytics.service';

@Directive({
    selector: '[appTrackEvent]',
    host: { '(click)': 'track()' },
})
export class TrackEventDirective {
    readonly appTrackEvent = input.required<AnalyticsEvent>();
    readonly eventProperties = input<AnalyticsProperties>({});
    private readonly analytics = inject(AnalyticsService);

    track(): void {
        this.analytics.track(this.appTrackEvent(), this.eventProperties());
    }
}
