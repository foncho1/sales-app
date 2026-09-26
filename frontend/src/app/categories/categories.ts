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
  Category
} from '../core/models/category.model';

import {
  CategoryService
} from '../core/services/category.service';


@Component({
  selector: 'app-categories',

  imports: [
    ReactiveFormsModule
  ],

  templateUrl: './categories.html',

  styleUrl: './categories.scss'
})
export class Categories {

  private readonly category_service =
    inject(CategoryService);

  private readonly form_builder =
    inject(FormBuilder);

  private readonly change_detector =
    inject(ChangeDetectorRef);


  protected categories: Category[] = [];

  protected loading = false;

  protected error_message = '';


  // Cuando es null, el formulario está en modo "crear".
  // Cuando tiene una categoría, está en modo "editar" esa categoría.
  protected editing_category: Category | null = null;

  protected form_open = false;

  protected saving = false;

  protected deleting_id: number | null = null;


  protected readonly category_form =
    this.form_builder.group({

      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50)
        ]
      ]

    });


  constructor() {

    this.load_categories();

  }


  protected load_categories(): void {

    this.loading = true;

    this.error_message = '';

    this.category_service
      .get_categories()
      .subscribe({

        next: (categories) => {

          this.categories = categories;

          this.loading = false;

          this.change_detector.markForCheck();

        },

        error: (error) => {

          console.error(
            'Error obteniendo categorías:',
            error
          );

          this.error_message =
            'No se pudieron cargar las categorías.';

          this.loading = false;

          this.change_detector.markForCheck();

        }

      });

  }


  protected start_create(): void {

    this.editing_category = null;

    this.category_form.reset({
      name: ''
    });

    this.form_open = true;

  }


  protected start_edit(category: Category): void {

    this.editing_category = category;

    this.category_form.reset({
      name: category.name
    });

    this.form_open = true;

  }


  protected cancel_form(): void {

    this.form_open = false;

    this.editing_category = null;

    this.category_form.reset({
      name: ''
    });

  }


  protected submit(): void {

    if (this.category_form.invalid) {

      this.category_form.markAllAsTouched();

      return;

    }

    const name =
      (this.category_form.controls.name.value ?? '').trim();

    if (!name) {
      return;
    }

    this.saving = true;

    this.error_message = '';

    if (this.editing_category) {

      this.category_service
        .update_category(
          this.editing_category.id,
          { name }
        )
        .subscribe({

          next: (updated_category) => {

            this.categories = this.categories.map(
              (category) =>
                category.id === updated_category.id
                  ? updated_category
                  : category
            );

            this.saving = false;

            this.cancel_form();

            this.change_detector.markForCheck();

          },

          error: (error) => {

            console.error(
              'Error actualizando categoría:',
              error
            );

            this.error_message =
              'No se pudo actualizar la categoría.';

            this.saving = false;

            this.change_detector.markForCheck();

          }

        });

      return;

    }

    this.category_service
      .create_category({ name })
      .subscribe({

        next: (created_category) => {

          this.categories = [
            ...this.categories,
            created_category
          ];

          this.saving = false;

          this.cancel_form();

          this.change_detector.markForCheck();

        },

        error: (error) => {

          console.error(
            'Error creando categoría:',
            error
          );

          this.error_message =
            'No se pudo crear la categoría.';

          this.saving = false;

          this.change_detector.markForCheck();

        }

      });

  }


  protected delete_category(category: Category): void {

    const confirmed = confirm(
      `¿Eliminar la categoría "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.deleting_id = category.id;

    this.error_message = '';

    this.category_service
      .delete_category(category.id)
      .subscribe({

        next: () => {

          this.categories = this.categories.filter(
            (existing) => existing.id !== category.id
          );

          this.deleting_id = null;

          this.change_detector.markForCheck();

        },

        error: (error) => {

          console.error(
            'Error eliminando categoría:',
            error
          );

          this.error_message =
            'No se pudo eliminar la categoría. Puede que tenga productos asociados.';

          this.deleting_id = null;

          this.change_detector.markForCheck();

        }

      });

  }

}
