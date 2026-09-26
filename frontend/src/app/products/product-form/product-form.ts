import {
  Component,
  inject
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  Category
} from '../../core/models/category.model';

import {
  CategoryService
} from '../../core/services/category.service';

import {
  ProductService
} from '../../core/services/product.service';

import {
  ProductCreate
} from '../../core/models/product.model';


@Component({
  selector: 'app-product-form',

  imports: [
    ReactiveFormsModule
  ],

  templateUrl: './product-form.html',

  styleUrl: './product-form.scss'
})
export class ProductForm {

  private readonly form_builder =
    inject(FormBuilder);

  private readonly product_service =
    inject(ProductService);

  private readonly category_service =
    inject(CategoryService);

  private readonly router =
    inject(Router);

  private readonly route =
    inject(ActivatedRoute);


  protected categories: Category[] = [];

  protected loading = false;

  protected error_message = '';

  // Cuando editing_id es null, el formulario está en modo "crear".
  protected editing_id: number | null = null;


  protected readonly product_form =
    this.form_builder.group({

      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100)
        ]
      ],

      price: [
        null as number | null,
        [
          Validators.required,
          Validators.min(0.01)
        ]
      ],

      stock: [
        null as number | null,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      category_id: [
        null as number | null,
        [
          Validators.required
        ]
      ]

    });


  constructor() {

    this.load_categories();

    const id_param =
      this.route.snapshot.paramMap.get('id');

    if (id_param) {

      this.editing_id = Number(id_param);

      this.load_product(this.editing_id);

    }

  }


  private load_product(id: number): void {

    this.loading = true;

    this.product_service
      .get_product(id)
      .subscribe({

        next: (product) => {

          this.product_form.patchValue({
            name: product.name,
            price: product.price,
            stock: product.stock,
            category_id: product.category.id
          });

          this.loading = false;

        },

        error: (error) => {

          console.error(
            'Error obteniendo producto:',
            error
          );

          this.error_message =
            'No se pudo cargar el producto.';

          this.loading = false;

        }

      });

  }


  protected load_categories(): void {

    this.category_service
      .get_categories()
      .subscribe({

        next: (categories) => {

          this.categories =
            categories;

        },

        error: (error) => {

          console.error(
            'Error obteniendo categorías:',
            error
          );

          this.error_message =
            'No se pudieron cargar las categorías.';

        }

      });

  }


  protected submit(): void {

    if (
      this.product_form.invalid
    ) {

      this.product_form
        .markAllAsTouched();

      return;

    }


    const form_value =
      this.product_form.getRawValue();


    if (
      form_value.price === null ||
      form_value.stock === null ||
      form_value.category_id === null
    ) {

      return;

    }


    const product: ProductCreate = {

      name:
        form_value.name!.trim(),

      price:
        form_value.price,

      stock:
        form_value.stock,

      category_id:
        form_value.category_id

    };


    this.loading = true;

    this.error_message = '';


    const request$ =
      this.editing_id === null
        ? this.product_service.create_product(product)
        : this.product_service.update_product(this.editing_id, product);


    request$.subscribe({

        next: () => {

          this.loading = false;

          this.router.navigate(
            ['/admin/products']
          );

        },

        error: (error) => {

          console.error(
            'Error guardando producto:',
            error
          );

          this.loading = false;

          this.error_message =
            this.editing_id === null
              ? 'No se pudo crear el producto.'
              : 'No se pudo actualizar el producto.';

        }

      });

  }


  protected cancel(): void {

    this.router.navigate(
      this.editing_id === null
        ? ['/products']
        : ['/admin/products']
    );

  }

}