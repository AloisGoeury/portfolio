import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { marked } from 'marked';
import { from, map, switchMap } from 'rxjs';
import { PagesApiService } from '../../core/pages-api.service';

@Component({
  imports: [AsyncPipe, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  private readonly pagesApi = inject(PagesApiService);

  readonly viewModel$ = this.pagesApi
    .findAbout()
    .pipe(
      switchMap((page) =>
        from(Promise.resolve(marked.parse(page.bodyMarkdown))).pipe(
          map((html) => ({ page, html })),
        ),
      ),
    );
}
