import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ProjectsApiService } from '../../core/projects-api.service';

@Component({
  imports: [AsyncPipe, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private readonly projectsApi = inject(ProjectsApiService);

  readonly featuredProjects$ = this.projectsApi
    .listPublished()
    .pipe(
      map((projects) =>
        projects.filter((project) => project.featured).slice(0, 3),
      ),
    );
}
