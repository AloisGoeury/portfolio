import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { QueuedProjectUpdate } from '../../core/note.model';
import { NotesApiService } from '../../core/notes-api.service';

interface EditableProjectUpdate extends QueuedProjectUpdate {
  slug: string;
  excerpt: string;
}

@Component({
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './project-updates.component.html',
  styleUrl: './project-updates.component.scss',
})
export class ProjectUpdatesComponent {
  private readonly notesApi = inject(NotesApiService);

  readonly updates = signal<EditableProjectUpdate[]>([]);
  readonly error = signal('');

  constructor() {
    this.load();
  }

  saveDraft(update: EditableProjectUpdate): void {
    this.notesApi
      .updateProjectUpdate(update.id, {
        proposedTitle: update.proposedTitle,
        proposedContentMarkdown: update.proposedContentMarkdown,
      })
      .subscribe({
        next: (saved) => this.replace(saved),
        error: () => this.error.set('Impossible d’enregistrer la proposition.'),
      });
  }

  publish(update: EditableProjectUpdate): void {
    this.notesApi
      .updateProjectUpdate(update.id, {
        proposedTitle: update.proposedTitle,
        proposedContentMarkdown: update.proposedContentMarkdown,
      })
      .subscribe({
        next: () =>
          this.notesApi
            .publishProjectUpdate(update.id, {
              slug: update.slug,
              excerpt: update.excerpt,
              published: true,
            })
            .subscribe({
              next: () => this.remove(update.id),
              error: () =>
                this.error.set(
                  'Impossible de publier. Vérifiez notamment le slug.',
                ),
            }),
        error: () => this.error.set('Impossible d’enregistrer la proposition.'),
      });
  }

  ignore(update: EditableProjectUpdate): void {
    this.notesApi.ignoreProjectUpdate(update.id).subscribe({
      next: () => this.remove(update.id),
      error: () => this.error.set('Impossible d’ignorer la proposition.'),
    });
  }

  private load(): void {
    this.notesApi.listProjectUpdates().subscribe({
      next: (updates) =>
        this.updates.set(
          updates
            .filter((update) => update.status === 'pending')
            .map((update) => ({
              ...update,
              slug: this.slugify(
                `${update.projectSlug}-${update.commitSha.slice(0, 7)}`,
              ),
              excerpt: update.commitMessage,
            })),
        ),
      error: () => this.error.set('Impossible de charger la file GitHub.'),
    });
  }

  private replace(saved: QueuedProjectUpdate): void {
    this.updates.update((updates) =>
      updates.map((update) =>
        update.id === saved.id ? { ...update, ...saved } : update,
      ),
    );
  }

  private remove(id: string): void {
    this.updates.update((updates) =>
      updates.filter((update) => update.id !== id),
    );
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
