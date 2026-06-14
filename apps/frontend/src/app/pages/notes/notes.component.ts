import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { marked } from 'marked';
import { from, map, switchMap } from 'rxjs';
import { NotesApiService } from '../../core/notes-api.service';

@Component({
  imports: [AsyncPipe, DatePipe],
  templateUrl: './notes.component.html',
})
export class NotesComponent {
  private readonly notesApi = inject(NotesApiService);

  readonly notes$ = this.notesApi.listPublished().pipe(
    switchMap((notes) =>
      from(
        Promise.all(
          notes.map(async (note) => ({
            ...note,
            html: await marked.parse(note.contentMarkdown),
          })),
        ),
      ),
    ),
    map((notes) => notes),
  );
}
