import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
    imports: [ReactiveFormsModule],
    templateUrl: './login.component.html',
})
export class LoginComponent {
    private readonly formBuilder = inject(FormBuilder);
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);

    readonly busy = signal(false);
    readonly error = signal('');
    readonly form = this.formBuilder.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
    });

    submit(): void {
        if (this.form.invalid) {
            return;
        }

        this.busy.set(true);
        this.error.set('');
        const { email, password } = this.form.getRawValue();

        this.auth.login(email, password).subscribe({
            next: () => void this.router.navigate(['/admin/projects']),
            error: () => {
                this.error.set('Email ou mot de passe incorrect.');
                this.busy.set(false);
            },
        });
    }
}
