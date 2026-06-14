import { DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { Component, LOCALE_ID, input } from '@angular/core';

registerLocaleData(localeFr);

@Component({
  selector: 'app-project-activity',
  imports: [DatePipe],
  providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }],
  templateUrl: './project-activity.component.html',
  styleUrl: './project-activity.component.scss',
})
export class ProjectActivityComponent {
  readonly date = input.required<string>();
  readonly commitUrl = input<string | null>(null);
  readonly commitMessage = input<string | null>(null);
  readonly compact = input(false);
}
