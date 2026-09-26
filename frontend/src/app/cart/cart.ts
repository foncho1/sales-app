import {
  ChangeDetectorRef,
  Component,
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  CartService
} from '../core/services/cart.service';

import {
  OrderService
} from '../core/services/order.service';

import {
  OrderCreate
} from '../core/models/order.model';


@Component({
  selector: 'app-cart',

  imports: [],

  templateUrl: './cart.html',

  styleUrl: './cart.scss'
})
export class Cart {

  private readonly cart_service =
    inject(CartService);

  private readonly order_service =
    inject(OrderService);

  private readonly change_detector =
    inject(ChangeDetectorRef);

  private readonly router =
    inject(Router);


  protected readonly items =
    this.cart_service.items;

  protected readonly total =
    this.cart_service.total;


  protected creating = false;

  protected error_message = '';


  protected update_quantity(
    product_id: number,
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    const quantity =
      input.valueAsNumber;

    if (!Number.isFinite(quantity)) {
      return;
    }

    this.cart_service.update_quantity(
      product_id,
      quantity
    );

  }


  protected remove_item(product_id: number): void {

    this.cart_service.remove_item(
      product_id
    );

  }


  protected clear_cart(): void {

    const confirmed = confirm(
      '¿Vaciar el carrito?'
    );

    if (!confirmed) {
      return;
    }

    this.cart_service.clear();

  }


  protected create_order(): void {

    const items = this.items().map(
      (item) => ({
        product_id: item.product.id,
        quantity: item.quantity
      })
    );

    if (items.length === 0) {
      return;
    }

    const order: OrderCreate = { items };

    this.creating = true;

    this.error_message = '';

    this.order_service
      .create_order(order)
      .subscribe({

        next: () => {

          this.creating = false;

          this.cart_service.clear();

          this.router.navigate(
            ['/orders']
          );

        },

        error: (error) => {

          console.error(
            'Error creando pedido:',
            error
          );

          this.error_message =
            error.status === 400 && error.error?.detail
              ? error.error.detail
              : 'No se pudo crear el pedido.';

          this.creating = false;

          this.change_detector.markForCheck();

        }

      });

  }


  protected continue_shopping(): void {

    this.router.navigate(
      ['/products']
    );

  }

}
