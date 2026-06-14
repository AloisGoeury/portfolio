import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AboutPage, AboutPagePayload } from '../../core/page-content.model';
import { PagesApiService } from '../../core/pages-api.service';

@Component({
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './about-form.component.html',
  styleUrl: './about-form.component.scss',
})
export class AboutFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly pagesApi = inject(PagesApiService);

  readonly busy = signal(false);
  readonly error = signal('');
  readonly saved = signal(false);
  readonly current = signal<AboutPage | null>(null);
  readonly history = signal<AboutPage[]>([]);
  readonly form = this.formBuilder.nonNullable.group({
    eyebrow: ['', [Validators.required, Validators.maxLength(80)]],
    title: ['', [Validators.required, Validators.maxLength(250)]],
    bodyMarkdown: ['', [Validators.required, Validators.maxLength(10000)]],
    linkLabel: ['', [Validators.required, Validators.maxLength(120)]],
  });

  constructor() {
    this.load();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.busy.set(true);
    this.error.set('');
    this.saved.set(false);
    const payload: AboutPagePayload = this.form.getRawValue();

    this.pagesApi.updateAbout(payload).subscribe({
      next: (page) => {
        this.current.set(page);
        this.form.reset({
          eyebrow: page.eyebrow,
          title: page.title,
          bodyMarkdown: page.bodyMarkdown,
          linkLabel: page.linkLabel,
        });
        this.busy.set(false);
        this.saved.set(true);
        this.loadHistory();
      },
      error: () => {
        this.error.set('Impossible d’enregistrer la page.');
        this.busy.set(false);
      },
    });
  }

  private load(): void {
    this.pagesApi.findAboutAdmin().subscribe({
      next: (page) => {
        this.current.set(page);
        this.form.setValue({
          eyebrow: page.eyebrow,
          title: page.title,
          bodyMarkdown: page.bodyMarkdown,
          linkLabel: page.linkLabel,
        });
      },
      error: () => this.error.set('Impossible de charger la page.'),
    });
    this.loadHistory();
  }

  private loadHistory(): void {
    this.pagesApi.listAboutHistory().subscribe({
      next: (history) => this.history.set(history),
      error: () => this.error.set('Impossible de charger l’historique.'),
    });
  }
}
