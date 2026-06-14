import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Project, ProjectPayload } from './project.model';

@Injectable({ providedIn: 'root' })
export class ProjectsApiService {
    private readonly http = inject(HttpClient);

    listPublished(): Observable<Project[]> {
        return this.http.get<Project[]>('/api/projects');
    }

    findPublished(slug: string): Observable<Project> {
        return this.http.get<Project>(`/api/projects/${slug}`);
    }

    listAdmin(): Observable<Project[]> {
        return this.http.get<Project[]>('/api/admin/projects');
    }

    findAdmin(id: string): Observable<Project> {
        return this.http.get<Project>(`/api/admin/projects/${id}`);
    }

    create(payload: ProjectPayload): Observable<Project> {
        return this.http.post<Project>('/api/admin/projects', payload);
    }

    update(id: string, payload: Partial<ProjectPayload>): Observable<Project> {
        return this.http.patch<Project>(`/api/admin/projects/${id}`, payload);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`/api/admin/projects/${id}`);
    }
}
