import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectsApiService } from '../../core/projects-api.service';
import { ProjectActivityComponent } from '../project-activity/project-activity.component';

@Component({
  imports: [AsyncPipe, DatePipe, ProjectActivityComponent, RouterLink],
  templateUrl: './projects.component.html',
})
export class ProjectsComponent {
  private readonly projectsApi = inject(ProjectsApiService);
  readonly projects$ = this.projectsApi.listPublished();
}
