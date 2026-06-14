import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { marked } from 'marked';
import { from, map, switchMap } from 'rxjs';
import { ProjectsApiService } from '../../core/projects-api.service';
import { ProjectActivityComponent } from '../project-activity/project-activity.component';

@Component({
    imports: [AsyncPipe, ProjectActivityComponent, RouterLink],
    templateUrl: './project-detail.component.html',
})
export class ProjectDetailComponent {
    private readonly route = inject(ActivatedRoute);
    private readonly projectsApi = inject(ProjectsApiService);

    readonly viewModel$ = this.route.paramMap.pipe(
        switchMap((params) =>
            this.projectsApi.findPublished(params.get('slug') ?? ''),
        ),
        switchMap((project) =>
            from(Promise.resolve(marked.parse(project.contentMarkdown))).pipe(
                map((html) => ({ project, html })),
            ),
        ),
    );
}
