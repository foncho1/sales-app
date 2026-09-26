import {
  Component,
  inject
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  UserService
} from '../../core/services/user.service';

import {
  UserCreate,
  UserRole
} from '../../core/models/user.model';


function passwords_match(
  control: AbstractControl
): ValidationErrors | null {

  const password =
    control.get('password')?.value;

  const confirm_password =
    control.get('confirm_password')?.value;

  return password === confirm_password
    ? null
    : { passwords_mismatch: true };

}


@Component({
  selector: 'app-register-user',

  imports: [
    ReactiveFormsModule
  ],

  templateUrl: './register-user.html',

  styleUrl: './register-user.scss'
})
export class RegisterUser {

  private readonly form_builder =
    inject(FormBuilder);

  private readonly user_service =
    inject(UserService);

  private readonly router =
    inject(Router);


  protected loading = false;

  protected error_message = '';

  protected success_message = '';


  protected readonly user_form =
    this.form_builder.group({

      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50)
        ]
      ],

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
          Validators.required,
          Validators.minLength(6)
        ]
      ],

      confirm_password: [
        '',
        [
          Validators.required
        ]
      ],

      role: [
        'USER' as UserRole,
        [
          Validators.required
        ]
      ]

    }, {
      validators: passwords_match
    });


  protected register(): void {

    if (this.user_form.invalid) {

      this.user_form.markAllAsTouched();

      return;

    }

    const form_value =
      this.user_form.getRawValue();

    const user: UserCreate = {

      username:
        form_value.username!.trim(),

      email:
        form_value.email!.trim(),

      password:
        form_value.password!,

      role:
        form_value.role!

    };


    this.loading = true;

    this.error_message = '';

    this.success_message = '';


    this.user_service
      .register_user(user)
      .subscribe({

        next: () => {

          this.loading = false;

          this.success_message =
            `Usuario "${user.username}" registrado correctamente.`;

          this.user_form.reset();

        },

        error: (error) => {

          console.error(
            'Error registrando usuario:',
            error
          );

          this.loading = false;

          this.error_message =
            error.status === 409
              ? 'Ya existe un usuario con ese email o nombre de usuario.'
              : 'No se pudo registrar el usuario.';

        }

      });

  }


  protected cancel(): void {

    this.router.navigate(
      ['/admin/users']
    );

  }

}
