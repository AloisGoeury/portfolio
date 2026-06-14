import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NotePayload } from '../../core/note.model';
import { NotesApiService } from '../../core/notes-api.service';
import { Project } from '../../core/project.model';
import { ProjectsApiService } from '../../core/projects-api.service';

@Component({
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './note-form.component.html',
    styleUrl: './note-form.component.scss',
})
export class NoteFormComponent {
    private readonly formBuilder = inject(FormBuilder);
    private readonly notesApi = inject(NotesApiService);
    private readonly projectsApi = inject(ProjectsApiService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    readonly noteId = this.route.snapshot.paramMap.get('id');
    readonly projects = signal<Project[]>([]);
    readonly busy = signal(false);
    readonly error = signal('');
    readonly form = this.formBuilder.nonNullable.group({
        projectId: [''],
        title: ['', [Validators.required, Validators.maxLength(200)]],
        slug: [
            '',
            [
                Validators.required,
                Validators.maxLength(220),
                Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
            ],
        ],
        excerpt: ['', Validators.maxLength(600)],
        contentMarkdown: ['', Validators.required],
        published: [false],
    });

    constructor() {
        this.projectsApi.listAdmin().subscribe({
            next: (projects) => this.projects.set(projects),
            error: () => this.error.set('Impossible de charger les projets.'),
        });

        if (this.noteId) {
            this.notesApi.findAdmin(this.noteId).subscribe({
                next: (note) =>
                    this.form.patchValue({
                        projectId: note.projectId ?? '',
                        title: note.title,
                        slug: note.slug,
                        excerpt: note.excerpt,
                        contentMarkdown: note.contentMarkdown,
                        published: note.published,
                    }),
                error: () => this.error.set('Impossible de charger la note.'),
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
        const value = this.form.getRawValue();
        const payload: NotePayload = {
            projectId: value.projectId || null,
            title: value.title.trim(),
            slug: value.slug.trim(),
            excerpt: value.excerpt.trim(),
            contentMarkdown: value.contentMarkdown,
            published: value.published,
        };
        const request = this.noteId
            ? this.notesApi.update(this.noteId, payload)
            : this.notesApi.create(payload);
        request.subscribe({
            next: () => void this.router.navigate(['/admin/notes']),
            error: () => {
                this.error.set('Enregistrement impossible. Vérifiez le slug.');
                this.busy.set(false);
            },
        });
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
