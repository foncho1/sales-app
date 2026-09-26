import { Component, inject } from '@angular/core';
import {FormBuilder,ReactiveFormsModule,Validators} from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  private readonly form_builder = inject(FormBuilder);
  private readonly auth_service = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly login_form = this.form_builder.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],
    password: [
      '',
      [
        Validators.required
      ]
    ]
  });

  protected loading = false;
  protected error_message = '';

  protected login(): void {

    if (this.login_form.invalid) {
      this.login_form.markAllAsTouched();
      return;
    }

    const email = this.login_form.controls.email.value;
    const password = this.login_form.controls.password.value;

    if (!email || !password) {
      return;
    }

    this.loading = true;
    this.error_message = '';

    this.auth_service.login(
      email,
      password
    ).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/products']);
      },
      error: (error) => {
        console.error('Error de login:', error);
        this.loading = false;
        this.error_message = 'Email o contraseña incorrectos.';
      }
    });
  }
}
