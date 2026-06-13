import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Project } from '../../core/project.model';
import { ProjectsApiService } from '../../core/projects-api.service';

@Component({
  imports: [DatePipe, RouterLink],
  templateUrl: './admin-projects.component.html',
})
export class AdminProjectsComponent {
  private readonly projectsApi = inject(ProjectsApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly projects = signal<Project[]>([]);
  readonly error = signal('');

  constructor() {
    this.load();
  }

  togglePublished(project: Project): void {
    const published = !project.published;
    this.projectsApi
      .update(project.id, {
        published,
        status: published ? 'published' : 'draft',
      })
      .subscribe({
        next: (updated) =>
          this.projects.update((projects) =>
            projects.map((item) => (item.id === updated.id ? updated : item)),
          ),
        error: () => this.error.set('Impossible de modifier la publication.'),
      });
  }

  remove(project: Project): void {
    if (!window.confirm(`Supprimer définitivement « ${project.title} » ?`)) {
      return;
    }

    this.projectsApi.delete(project.id).subscribe({
      next: () =>
        this.projects.update((projects) =>
          projects.filter((item) => item.id !== project.id),
        ),
      error: () => this.error.set('Impossible de supprimer le projet.'),
    });
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/admin/login']);
  }

  private load(): void {
    this.projectsApi.listAdmin().subscribe({
      next: (projects) => this.projects.set(projects),
      error: () => this.error.set('Impossible de charger les projets.'),
    });
  }
}
