import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Note } from '../../core/note.model';
import { NotesApiService } from '../../core/notes-api.service';

@Component({
  imports: [DatePipe, RouterLink],
  templateUrl: './admin-notes.component.html',
  styleUrl: './admin-notes.component.scss',
})
export class AdminNotesComponent {
  private readonly notesApi = inject(NotesApiService);

  readonly notes = signal<Note[]>([]);
  readonly error = signal('');

  constructor() {
    this.load();
  }

  togglePublished(note: Note): void {
    this.notesApi.update(note.id, { published: !note.published }).subscribe({
      next: (updated) =>
        this.notes.update((notes) =>
          notes.map((item) => (item.id === updated.id ? updated : item)),
        ),
      error: () => this.error.set('Impossible de modifier la publication.'),
    });
  }

  remove(note: Note): void {
    if (!window.confirm(`Supprimer définitivement « ${note.title} » ?`)) {
      return;
    }
    this.notesApi.delete(note.id).subscribe({
      next: () =>
        this.notes.update((notes) =>
          notes.filter((item) => item.id !== note.id),
        ),
      error: () => this.error.set('Impossible de supprimer la note.'),
    });
  }

  private load(): void {
    this.notesApi.listAdmin().subscribe({
      next: (notes) => this.notes.set(notes),
      error: () => this.error.set('Impossible de charger les notes.'),
    });
  }
}
