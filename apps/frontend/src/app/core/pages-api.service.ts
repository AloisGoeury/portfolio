import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
    AboutPage,
    AboutPagePayload,
    HomePage,
    HomePagePayload,
} from './page-content.model';

@Injectable({ providedIn: 'root' })
export class PagesApiService {
    private readonly http = inject(HttpClient);

    findHome(): Observable<HomePage> {
        return this.http.get<HomePage>('/api/pages/home');
    }

    findHomeAdmin(): Observable<HomePage> {
        return this.http.get<HomePage>('/api/admin/pages/home');
    }

    listHomeHistory(): Observable<HomePage[]> {
        return this.http.get<HomePage[]>('/api/admin/pages/home/history');
    }

    updateHome(payload: HomePagePayload): Observable<HomePage> {
        return this.http.patch<HomePage>('/api/admin/pages/home', payload);
    }

    findAbout(): Observable<AboutPage> {
        return this.http.get<AboutPage>('/api/pages/about');
    }

    findAboutAdmin(): Observable<AboutPage> {
        return this.http.get<AboutPage>('/api/admin/pages/about');
    }

    listAboutHistory(): Observable<AboutPage[]> {
        return this.http.get<AboutPage[]>('/api/admin/pages/about/history');
    }

    updateAbout(payload: AboutPagePayload): Observable<AboutPage> {
        return this.http.patch<AboutPage>('/api/admin/pages/about', payload);
    }
}
