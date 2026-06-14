import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

const TOKEN_KEY = 'portfolio_access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);

    login(email: string, password: string): Observable<void> {
        return this.http
            .post<{
                accessToken: string;
            }>('/api/auth/login', { email, password })
            .pipe(
                tap(({ accessToken }) =>
                    localStorage.setItem(TOKEN_KEY, accessToken),
                ),
                map(() => undefined),
            );
    }

    token(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    isAuthenticated(): boolean {
        const token = this.token();
        if (!token) {
            return false;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1])) as {
                exp: number;
            };
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }

    logout(): void {
        localStorage.removeItem(TOKEN_KEY);
    }
}
