import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HomePage, HomePagePayload } from '../../core/page-content.model';
import { PagesApiService } from '../../core/pages-api.service';

@Component({
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './home-form.component.html',
  styleUrl: './home-form.component.scss',
})
export class HomeFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly pagesApi = inject(PagesApiService);

  readonly busy = signal(false);
  readonly error = signal('');
  readonly saved = signal(false);
  readonly current = signal<HomePage | null>(null);
  readonly history = signal<HomePage[]>([]);
  readonly form = this.formBuilder.nonNullable.group({
    eyebrow: ['', [Validators.required, Validators.maxLength(80)]],
    title: ['', [Validators.required, Validators.maxLength(250)]],
    introduction: ['', [Validators.required, Validators.maxLength(1000)]],
    linkLabel: ['', [Validators.required, Validators.maxLength(120)]],
    sectionEyebrow: ['', [Validators.required, Validators.maxLength(80)]],
    sectionTitle: ['', [Validators.required, Validators.maxLength(120)]],
    emptyMessage: ['', [Validators.required, Validators.maxLength(250)]],
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
    const payload: HomePagePayload = this.form.getRawValue();

    this.pagesApi.updateHome(payload).subscribe({
      next: (page) => {
        this.current.set(page);
        this.form.reset(this.toFormValue(page));
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
    this.pagesApi.findHomeAdmin().subscribe({
      next: (page) => {
        this.current.set(page);
        this.form.setValue(this.toFormValue(page));
      },
      error: () => this.error.set('Impossible de charger la page.'),
    });
    this.loadHistory();
  }

  private loadHistory(): void {
    this.pagesApi.listHomeHistory().subscribe({
      next: (history) => this.history.set(history),
      error: () => this.error.set('Impossible de charger l’historique.'),
    });
  }

  private toFormValue(page: HomePage): HomePagePayload {
    return {
      eyebrow: page.eyebrow,
      title: page.title,
      introduction: page.introduction,
      linkLabel: page.linkLabel,
      sectionEyebrow: page.sectionEyebrow,
      sectionTitle: page.sectionTitle,
      emptyMessage: page.emptyMessage,
    };
  }
}
