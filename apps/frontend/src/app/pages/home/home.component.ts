import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { PagesApiService } from '../../core/pages-api.service';
import { ProjectsApiService } from '../../core/projects-api.service';

@Component({
    imports: [AsyncPipe, RouterLink],
    templateUrl: './home.component.html',
})
export class HomeComponent {
    private readonly pagesApi = inject(PagesApiService);
    private readonly projectsApi = inject(ProjectsApiService);

    readonly viewModel$ = combineLatest({
        page: this.pagesApi.findHome(),
        featuredProjects: this.projectsApi
            .listPublished()
            .pipe(
                map((projects) =>
                    projects.filter((project) => project.featured).slice(0, 3),
                ),
            ),
    });
}
