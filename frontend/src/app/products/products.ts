import {Component,inject,ChangeDetectorRef} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {Product,ProductResponse} from '../core/models/product.model';

import {ProductService} from '../core/services/product.service';
import { Category } from '../core/models/category.model';
import { CategoryService } from '../core/services/category.service';
import { CartService } from '../core/services/cart.service';


@Component({
  selector: 'app-products',

  imports: [],

  templateUrl: './products.html',

  styleUrl: './products.scss'
})
export class Products {

  private readonly product_service =
    inject(ProductService);

  private readonly change_detector =
  inject(ChangeDetectorRef);

  private readonly category_service =
  inject(CategoryService);

  private readonly search_subject =
  new Subject<string>();

  private readonly router =
  inject(Router);

  private readonly route =
  inject(ActivatedRoute);

  private readonly cart_service =
  inject(CartService);


  // true en /admin/products (data: { manage: true } en las rutas):
  // muestra acciones de gestión (editar/eliminar) en vez de agregar al carrito.
  protected readonly manage_mode: boolean =
    this.route.snapshot.data['manage'] === true;

  protected products: Product[] = [];
  protected categories: Category[] = [];
  protected added_product_id: number | null = null;
  protected deleting_id: number | null = null;
  protected error_message = '';
  protected total = 0;
  protected skip = 0;
  protected limit = 10;
  protected has_next = false;
  protected has_previous = false;
  protected loading = false;
  protected page = 1;
  protected pages = 1;
  protected search = '';
  protected category_id: number | null = null;
  protected min_price: number | null = null;
  protected max_price: number | null = null;
  protected sort: string | null = null;


  constructor() {
    this.search_subject.pipe(
      debounceTime(600),
      distinctUntilChanged()
    ).subscribe((search) => {

      this.search = search;

      this.skip = 0;

      this.load_products();

    });

    this.load_categories();
    this.load_products();

  }


  protected load_products(): void {

    this.loading = true;


    this.product_service.get_products(
      this.skip,this.limit,this.search,this.category_id,this.min_price,this.max_price,this.sort)
      .subscribe({

        next: (response: ProductResponse) => {

          this.products = response.items;

          this.total = response.total;

          this.skip = response.skip;

          this.limit = response.limit;

          this.page = response.page;

          this.pages = response.pages;

          this.has_next = response.has_next;

          this.has_previous = response.has_previous;

          this.loading = false;

          this.change_detector.markForCheck();


        },

        error: (error) => {

          console.error(
            'Error obteniendo productos:',
            error
          );

          this.loading = false;
          this.change_detector.markForCheck();

        }

      });

  }


  protected next_page(): void {

    if (!this.has_next) {
      return;
    }


    this.skip += this.limit;

    this.load_products();

  }


  protected previous_page(): void {

    if (!this.has_previous) {
      return;
    }


    this.skip -= this.limit;

    if (this.skip < 0) {
      this.skip = 0;
    }


    this.load_products();

  }

  protected change_limit(event: Event): void {

    const select =
      event.target as HTMLSelectElement;

    const new_limit =
      Number(select.value);

    if (new_limit <= 0) {
      return;
    }

    this.limit = new_limit;

    this.skip = 0;

    this.load_products();

  }

  protected search_products(event: Event):void {

    const input =
      event.target as HTMLInputElement;

    this.search_subject.next(
    input.value)
  }

  protected load_categories(): void {

    this.category_service
      .get_categories()
      .subscribe({

        next: (categories) => {

          this.categories =
            categories;

          this.change_detector.markForCheck();

        },

        error: (error) => {

          console.error(
            'Error obteniendo categorías:',
            error
          );

        }

      });

  }

  protected change_category(event: Event): void {

    const select =
      event.target as HTMLSelectElement;

    const value =
      select.value;

    this.category_id =
      value
        ? Number(value)
        : null;


  }

  protected change_min_price(event: Event): void{

    const input =
    event.target as HTMLInputElement;

    const value =
    input.value.trim();

    this.min_price =
      value
      ? Number(value)
      : null;

  }

  protected change_max_price(event: Event): void{

    const input =
    event.target as HTMLInputElement;

   const value =
    input.value.trim();

   this.max_price =
      value
      ? Number(value)
      : null;

  }

  protected change_sort(event: Event): void {

    const select =
      event.target as HTMLSelectElement;

    this.sort =
      select.value
        ? select.value
        : null;

  }

  protected apply_filters(): void {

    this.skip = 0;

    this.load_products();

  }

  protected clear_filters(): void {

    this.search = '';

    this.category_id = null;

    this.min_price = null;

    this.max_price = null;

    this.sort = null;

    this.skip = 0;

    this.load_products();

    this.change_detector.markForCheck();

  }

  protected create_product(): void {

    this.router.navigate(
      ['/products/new']
    );

  }


  protected edit_product(product: Product): void {

    this.router.navigate(
      ['/products', product.id, 'edit']
    );

  }


  protected delete_product(product: Product): void {

    const confirmed = confirm(
      `¿Eliminar el producto "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.deleting_id = product.id;

    this.error_message = '';

    this.product_service
      .delete_product(product.id)
      .subscribe({

        next: () => {

          this.products = this.products.filter(
            (existing) => existing.id !== product.id
          );

          this.total = Math.max(0, this.total - 1);

          this.deleting_id = null;

          this.change_detector.markForCheck();

        },

        error: (error) => {

          console.error(
            'Error eliminando producto:',
            error
          );

          this.error_message =
            'No se pudo eliminar el producto. Puede que tenga pedidos asociados.';

          this.deleting_id = null;

          this.change_detector.markForCheck();

        }

      });

  }


  protected add_to_cart(
    product: Product,
    quantity: number
  ): void {

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      product.stock <= 0
    ) {
      return;
    }

    this.cart_service.add_item(
      product,
      quantity
    );

    this.added_product_id = product.id;

    setTimeout(() => {

      if (this.added_product_id === product.id) {
        this.added_product_id = null;
      }

      this.change_detector.markForCheck();

    }, 1200);

  }

}