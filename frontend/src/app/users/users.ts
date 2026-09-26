import {
  ChangeDetectorRef,
  Component,
  inject
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  User,
  UserRole
} from '../core/models/user.model';

import {
  UserService
} from '../core/services/user.service';

import {
  AuthService
} from '../core/services/auth.service';


@Component({
  selector: 'app-users',

  imports: [
    ReactiveFormsModule
  ],

  templateUrl: './users.html',

  styleUrl: './users.scss'
})
export class Users {

  private readonly user_service =
    inject(UserService);

  private readonly auth_service =
    inject(AuthService);

  private readonly form_builder =
    inject(FormBuilder);

  private readonly change_detector =
    inject(ChangeDetectorRef);

  private readonly router =
    inject(Router);


  protected users: User[] = [];

  protected current_user: User | null = null;

  protected loading = false;

  protected error_message = '';


  // Cuando editing_user es null, no hay ninguna edición en curso.
  protected editing_user: User | null = null;

  protected form_open = false;

  protected saving = false;

  protected deleting_id: number | null = null;


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

      role: [
        'USER' as UserRole,
        [
          Validators.required
        ]
      ]

    });


  constructor() {

    this.load_current_user();
    this.load_users();

  }


  private load_current_user(): void {

    this.auth_service
      .get_current_user()
      .subscribe({

        next: (user) => {

          this.current_user = user;

          this.change_detector.markForCheck();

        },

        error: (error) => {

          console.error(
            'Error obteniendo usuario actual:',
            error
          );

        }

      });

  }


  protected load_users(): void {

    this.loading = true;

    this.error_message = '';

    this.user_service
      .get_users()
      .subscribe({

        next: (users) => {

          this.users = users;

          this.loading = false;

          this.change_detector.markForCheck();

        },

        error: (error) => {

          console.error(
            'Error obteniendo usuarios:',
            error
          );

          this.error_message =
            'No se pudieron cargar los usuarios.';

          this.loading = false;

          this.change_detector.markForCheck();

        }

      });

  }


  protected create_user(): void {

    this.router.navigate(
      ['/admin/users/new']
    );

  }


  protected start_edit(user: User): void {

    this.editing_user = user;

    this.user_form.reset({
      username: user.username,
      email: user.email,
      role: (user.role as UserRole) ?? 'USER'
    });

    this.form_open = true;

  }


  protected cancel_form(): void {

    this.form_open = false;

    this.editing_user = null;

  }


  protected submit(): void {

    if (
      this.user_form.invalid ||
      this.editing_user === null
    ) {

      this.user_form.markAllAsTouched();

      return;

    }

    const form_value =
      this.user_form.getRawValue();

    this.saving = true;

    this.error_message = '';

    this.user_service
      .update_user(this.editing_user.id, {
        username: form_value.username!.trim(),
        email: form_value.email!.trim(),
        role: form_value.role!
      })
      .subscribe({

        next: (updated_user) => {

          this.users = this.users.map(
            (user) =>
              user.id === updated_user.id
                ? updated_user
                : user
          );

          this.saving = false;

          this.cancel_form();

          this.change_detector.markForCheck();

        },

        error: (error) => {

          console.error(
            'Error actualizando usuario:',
            error
          );

          this.error_message =
            error.status === 409
              ? 'Ya existe un usuario con ese email o nombre de usuario.'
              : 'No se pudo actualizar el usuario.';

          this.saving = false;

          this.change_detector.markForCheck();

        }

      });

  }


  protected is_self(user: User): boolean {

    return this.current_user?.id === user.id;

  }


  protected delete_user(user: User): void {

    const confirmed = confirm(
      `¿Eliminar al usuario "${user.username}"?`
    );

    if (!confirmed) {
      return;
    }

    this.deleting_id = user.id;

    this.error_message = '';

    this.user_service
      .delete_user(user.id)
      .subscribe({

        next: () => {

          this.users = this.users.filter(
            (existing) => existing.id !== user.id
          );

          this.deleting_id = null;

          this.change_detector.markForCheck();

        },

        error: (error) => {

          console.error(
            'Error eliminando usuario:',
            error
          );

          this.error_message =
            error.status === 400
              ? 'No puedes eliminar tu propio usuario.'
              : 'No se pudo eliminar el usuario.';

          this.deleting_id = null;

          this.change_detector.markForCheck();

        }

      });

  }

}
