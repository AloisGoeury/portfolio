import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ProjectLink,
  ProjectPayload,
  ProjectTag,
} from '../../core/project.model';
import { ProjectsApiService } from '../../core/projects-api.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './project-form.component.html',
})
export class ProjectFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly projectsApi = inject(ProjectsApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly projectId = this.route.snapshot.paramMap.get('id');
  readonly busy = signal(false);
  readonly error = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    slug: [
      '',
      [
        Validators.required,
        Validators.maxLength(220),
        Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      ],
    ],
    summary: ['', [Validators.required, Validators.maxLength(600)]],
    contentMarkdown: [''],
    status: ['draft'],
    category: [''],
    coverUrl: [''],
    featured: [false],
    published: [false],
    startedAt: [''],
    endedAt: [''],
    tags: [''],
    links: [''],
  });

  constructor() {
    if (this.projectId) {
      this.projectsApi.findAdmin(this.projectId).subscribe({
        next: (project) =>
          this.form.patchValue({
            title: project.title,
            slug: project.slug,
            summary: project.summary,
            contentMarkdown: project.contentMarkdown,
            status: project.status,
            category: project.category ?? '',
            coverUrl: project.coverUrl ?? '',
            featured: project.featured,
            published: project.published,
            startedAt: project.startedAt ?? '',
            endedAt: project.endedAt ?? '',
            tags: project.tags.map((tag) => tag.name).join(', '),
            links: project.links
              .map((link) => `${link.label} | ${link.url} | ${link.type ?? ''}`)
              .join('\n'),
          }),
        error: () => this.error.set('Impossible de charger le projet.'),
      });
    }
  }

  suggestSlug(): void {
    if (!this.form.controls.slug.value) {
      this.form.controls.slug.setValue(
        this.slugify(this.form.controls.title.value),
      );
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.busy.set(true);
    this.error.set('');
    const payload = this.toPayload();
    const request = this.projectId
      ? this.projectsApi.update(this.projectId, payload)
      : this.projectsApi.create(payload);

    request.subscribe({
      next: () => void this.router.navigate(['/admin/projects']),
      error: () => {
        this.error.set(
          'Enregistrement impossible. Vérifiez le slug et les URL.',
        );
        this.busy.set(false);
      },
    });
  }

  private toPayload(): ProjectPayload {
    const value = this.form.getRawValue();
    return {
      title: value.title.trim(),
      slug: value.slug.trim(),
      summary: value.summary.trim(),
      contentMarkdown: value.contentMarkdown,
      status: value.status,
      category: value.category.trim() || null,
      coverUrl: value.coverUrl.trim() || null,
      featured: value.featured,
      published: value.published,
      startedAt: value.startedAt || null,
      endedAt: value.endedAt || null,
      tags: this.parseTags(value.tags),
      links: this.parseLinks(value.links),
    };
  }

  private parseTags(value: string): ProjectTag[] {
    return value
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name) => ({ name, slug: this.slugify(name) }));
  }

  private parseLinks(value: string): ProjectLink[] {
    return value
      .split('\n')
      .map((line) => line.split('|').map((part) => part.trim()))
      .filter((parts) => Boolean(parts[0] && parts[1]))
      .map(([label, url, type]) => ({ label, url, type: type || null }));
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
