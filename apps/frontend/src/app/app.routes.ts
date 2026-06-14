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
    path: 'admin/home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/home-form/home-form.component').then(
        (module) => module.HomeFormComponent,
      ),
    title: 'Modifier la page d’accueil',
  },
  {
    path: 'admin/about',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/about-form/about-form.component').then(
        (module) => module.AboutFormComponent,
      ),
    title: 'Modifier la page À propos',
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
    path: 'admin/notes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/admin-notes/admin-notes.component').then(
        (module) => module.AdminNotesComponent,
      ),
    title: 'Administration des notes',
  },
  {
    path: 'admin/notes/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/note-form/note-form.component').then(
        (module) => module.NoteFormComponent,
      ),
    title: 'Nouvelle note',
  },
  {
    path: 'admin/notes/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/note-form/note-form.component').then(
        (module) => module.NoteFormComponent,
      ),
    title: 'Modifier la note',
  },
  {
    path: 'admin/project-updates',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./admin/project-updates/project-updates.component').then(
        (module) => module.ProjectUpdatesComponent,
      ),
    title: 'File des mises à jour GitHub',
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
    path: 'admin/**',
    redirectTo: 'admin/login',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
