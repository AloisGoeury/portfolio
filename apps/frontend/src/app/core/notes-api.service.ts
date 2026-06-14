import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Note, NotePayload, QueuedProjectUpdate } from './note.model';

@Injectable({ providedIn: 'root' })
export class NotesApiService {
  private readonly http = inject(HttpClient);

  listPublished(): Observable<Note[]> {
    return this.http.get<Note[]>('/api/notes');
  }

  listAdmin(): Observable<Note[]> {
    return this.http.get<Note[]>('/api/admin/notes');
  }

  findAdmin(id: string): Observable<Note> {
    return this.http.get<Note>(`/api/admin/notes/${id}`);
  }

  create(payload: NotePayload): Observable<Note> {
    return this.http.post<Note>('/api/admin/notes', payload);
  }

  update(id: string, payload: Partial<NotePayload>): Observable<Note> {
    return this.http.patch<Note>(`/api/admin/notes/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/admin/notes/${id}`);
  }

  listProjectUpdates(): Observable<QueuedProjectUpdate[]> {
    return this.http.get<QueuedProjectUpdate[]>('/api/admin/project-updates');
  }

  updateProjectUpdate(
    id: string,
    payload: Pick<
      QueuedProjectUpdate,
      'proposedTitle' | 'proposedContentMarkdown'
    >,
  ): Observable<QueuedProjectUpdate> {
    return this.http.patch<QueuedProjectUpdate>(
      `/api/admin/project-updates/${id}`,
      payload,
    );
  }

  publishProjectUpdate(
    id: string,
    payload: { slug: string; excerpt: string; published: boolean },
  ): Observable<Note> {
    return this.http.post<Note>(
      `/api/admin/project-updates/${id}/publish`,
      payload,
    );
  }

  ignoreProjectUpdate(id: string): Observable<QueuedProjectUpdate> {
    return this.http.post<QueuedProjectUpdate>(
      `/api/admin/project-updates/${id}/ignore`,
      {},
    );
  }
}
