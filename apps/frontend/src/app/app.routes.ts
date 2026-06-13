import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(
        (module) => module.HomeComponent,
      ),
    title: 'Accueil — Portfolio',
  },
  {
    path: 'projets',
    loadComponent: () =>
      import('./pages/projects/projects.component').then(
        (module) => module.ProjectsComponent,
      ),
    title: 'Projets — Portfolio',
  },
  {
    path: 'projets/:slug',
    loadComponent: () =>
      import('./pages/project-detail/project-detail.component').then(
        (module) => module.ProjectDetailComponent,
      ),
    title: 'Projet — Portfolio',
  },
  {
    path: 'notes',
    loadComponent: () =>
      import('./pages/notes/notes.component').then(
        (module) => module.NotesComponent,
      ),
    title: 'Notes — Portfolio',
  },
  {
    path: 'a-propos',
    loadComponent: () =>
      import('./pages/about/about.component').then(
        (module) => module.AboutComponent,
      ),
    title: 'À propos — Portfolio',
  },
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./admin/login/login.component').then(
        (module) => module.LoginComponent,
      ),
    title: 'Connexion — Portfolio',
  },
  {
    path: 'admin/projects',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/admin-projects/admin-projects.component').then(
        (module) => module.AdminProjectsComponent,
      ),
    title: 'Administration des projets',
  },
  {
    path: 'admin/projects/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/project-form/project-form.component').then(
        (module) => module.ProjectFormComponent,
      ),
    title: 'Nouveau projet',
  },
  {
    path: 'admin/projects/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/project-form/project-form.component').then(
        (module) => module.ProjectFormComponent,
      ),
    title: 'Modifier le projet',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
