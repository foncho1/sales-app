import { DatePipe } from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  inject
} from '@angular/core';

import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Order,
  OrderCreate,
  OrderStatus
} from '../core/models/order.model';

import { OrderService } from '../core/services/order.service';

import { Product } from '../core/models/product.model';
import { ProductService } from '../core/services/product.service';

import { User } from '../core/models/user.model';
import { AuthService } from '../core/services/auth.service';



type OrderItemFormGroup = FormGroup<{
  product_id: FormControl<number | null>;
  quantity: FormControl<number | null>;
}>;


@Component({
  selector: 'app-orders',

  imports: [
    ReactiveFormsModule,
    DatePipe
  ],

  templateUrl: './orders.html',

  styleUrl: './orders.scss'
})
export class Orders {

  private readonly order_service =
    inject(OrderService);

  private readonly product_service =
    inject(ProductService);

  private readonly auth_service =
    inject(AuthService);

  private readonly form_builder =
    inject(FormBuilder);

  private readonly change_detector =
    inject(ChangeDetectorRef);


  protected readonly order_statuses: OrderStatus[] =
    ['PENDING', 'COMPLETED', 'CANCELLED'];


  protected orders: Order[] = [];

  // Lista completa devuelta por el backend (no soporta paginación por servidor)

  private all_orders: Order[] = [];

  protected products: Product[] = [];

  protected current_user: User | null = null;


  protected total = 0;

  protected skip = 0;

  protected readonly limit = 10;

  protected page = 1;

  protected pages = 1;

  protected has_next = false;

  protected has_previous = false;


  protected loading = false;

  protected list_error_message = '';


  protected creating = false;

  protected create_loading = false;

  protected form_error_message = '';

  protected updating_status_id: number | null = null;

  protected cancelling_id: number | null = null;

  protected downloading_id: number | null = null;


  protected readonly order_form = this.form_builder.group({

    items: this.form_builder.array<OrderItemFormGroup>([
      this.build_item_group()
    ])

  });


  constructor() {

    this.load_current_user();
    this.load_products();
    this.load_orders();

  }


  // --- Carga de datos ---

  private load_current_user(): void {

    if (!this.auth_service.is_authenticated()) {
      return;
    }

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


  private load_products(): void {

    this.product_service
      .get_products(0, 100)
      .subscribe({

        next: (response) => {

          this.products = response.items;

          this.change_detector.markForCheck();

        },

        error: (error) => {

          console.error(
            'Error obteniendo productos:',
            error
          );

        }

      });

  }


  protected load_orders(): void {

    this.loading = true;

    this.list_error_message = '';

    this.order_service
      .get_orders()
      .subscribe({

        next: (orders) => {

          this.all_orders = orders;

          this.update_page();

          this.loading = false;

          this.change_detector.markForCheck();

        },

        error: (error) => {

          console.error(
            'Error obteniendo pedidos:',
            error
          );

          this.list_error_message =
            'No se pudieron cargar los pedidos.';

          this.loading = false;

          this.change_detector.markForCheck();

        }

      });

  }


  private update_page(): void {

    this.total = this.all_orders.length;

    this.pages = Math.max(
      1,
      Math.ceil(this.total / this.limit)
    );

    if (this.skip >= this.total && this.total > 0) {
      this.skip = (this.pages - 1) * this.limit;
    }

    this.page = Math.floor(this.skip / this.limit) + 1;

    this.orders = this.all_orders.slice(
      this.skip,
      this.skip + this.limit
    );

    this.has_previous = this.skip > 0;

    this.has_next = this.skip + this.limit < this.total;

  }


  protected next_page(): void {

    if (!this.has_next) {
      return;
    }

    this.skip += this.limit;

    this.update_page();

  }


  protected previous_page(): void {

    if (!this.has_previous) {
      return;
    }

    this.skip = Math.max(0, this.skip - this.limit);

    this.update_page();

  }


  // --- Alta de pedidos ---

  private build_item_group(): OrderItemFormGroup {

    return this.form_builder.group({

      product_id: this.form_builder.control<number | null>(
        null,
        Validators.required
      ),

      quantity: this.form_builder.control<number | null>(
        1,
        [
          Validators.required,
          Validators.min(1)
        ]
      )

    });

  }


  protected get items(): FormArray<OrderItemFormGroup> {

    return this.order_form.controls.items;

  }


  protected start_create(): void {

    this.creating = true;

    this.form_error_message = '';

    this.reset_item_rows();

  }


  protected cancel_create(): void {

    this.creating = false;

    this.reset_item_rows();

  }


  private reset_item_rows(): void {

    while (this.items.length > 0) {
      this.items.removeAt(0);
    }

    this.items.push(this.build_item_group());

  }


  protected add_item(): void {

    this.items.push(this.build_item_group());

  }


  protected remove_item(index: number): void {

    if (this.items.length <= 1) {
      return;
    }

    this.items.removeAt(index);

  }


  protected product_for(product_id: number | null): Product | undefined {

    if (product_id === null) {
      return undefined;
    }

    return this.products.find(
      (product) => product.id === product_id
    );

  }


  protected row_subtotal(index: number): number {

    const group = this.items.at(index);

    const product = this.product_for(group.controls.product_id.value);

    const quantity = group.controls.quantity.value ?? 0;

    if (!product) {
      return 0;
    }

    return product.price * quantity;

  }


  protected get form_total(): number {

    return this.items.controls.reduce(
      (accumulated, _group, index) =>
        accumulated + this.row_subtotal(index),
      0
    );

  }


  protected submit_order(): void {

    if (this.order_form.invalid) {

      this.order_form.markAllAsTouched();

      return;

    }

    const raw_items = this.order_form.getRawValue().items;

    const items = raw_items
      .filter(
        (item): item is { product_id: number; quantity: number } =>
          item.product_id !== null && item.quantity !== null
      );

    if (items.length === 0) {
      return;
    }

    const order: OrderCreate = { items };

    this.create_loading = true;

    this.form_error_message = '';

    this.order_service
      .create_order(order)
      .subscribe({

        next: () => {

          this.create_loading = false;

          this.creating = false;

          this.reset_item_rows();

          this.skip = 0;

          this.load_orders();

        },

        error: (error) => {

          console.error(
            'Error creando pedido:',
            error
          );

          this.form_error_message =
            'No se pudo crear el pedido.';

          this.create_loading = false;

          this.change_detector.markForCheck();

        }

      });

  }


  // Gestión de pedidos existentes

  protected is_admin(): boolean {

    return this.current_user?.role === 'ADMIN';

  }


  protected can_change_status(): boolean {

    return this.is_admin();

  }


  // El backend solo permite cancelar pedidos en estado PENDING
  protected can_cancel(order: Order): boolean {

    return order.status === 'PENDING';

  }


  protected change_status(order: Order, event: Event): void {

    const select = event.target as HTMLSelectElement;

    const status = select.value as OrderStatus;

    if (status === order.status) {
      return;
    }

    this.updating_status_id = order.id;

    this.order_service
      .update_status(order.id, status)
      .subscribe({

        next: (updated_order) => {

          this.all_orders = this.all_orders.map(
            (existing) =>
              existing.id === updated_order.id
                ? updated_order
                : existing
          );

          this.update_page();

          this.updating_status_id = null;

          this.change_detector.markForCheck();

        },

        error: (error) => {

          console.error(
            'Error actualizando estado del pedido:',
            error
          );

          this.list_error_message =
            'No se pudo actualizar el estado del pedido.';

          this.updating_status_id = null;

          this.change_detector.markForCheck();

        }

      });

  }


  protected cancel_order(order: Order): void {

    const confirmed = confirm(
      `¿Cancelar el pedido #${order.id}? Se repondrá el stock reservado.`
    );

    if (!confirmed) {
      return;
    }

    this.cancelling_id = order.id;

    this.order_service
      .cancel_order(order.id)
      .subscribe({

        next: (cancelled_order) => {

          this.all_orders = this.all_orders.map(
            (existing) =>
              existing.id === cancelled_order.id
                ? cancelled_order
                : existing
          );

          this.update_page();

          this.cancelling_id = null;

          this.change_detector.markForCheck();

        },

        error: (error) => {

          console.error(
            'Error cancelando pedido:',
            error
          );

          this.list_error_message =
            'No se pudo cancelar el pedido.';

          this.cancelling_id = null;

          this.change_detector.markForCheck();

        }

      });

  }


  protected download_invoice(order: Order): void {

    this.downloading_id = order.id;

    this.order_service
      .download_invoice(order.id)
      .subscribe({

        next: (pdf) => {

          const url = window.URL.createObjectURL(pdf);

          const link = document.createElement('a');

          link.href = url;
          link.download = `factura-${order.id}.pdf`;

          link.click();

          window.URL.revokeObjectURL(url);

          this.downloading_id = null;

          this.change_detector.markForCheck();

        },

        error: (error) => {

          console.error(
            'Error descargando factura:',
            error
          );

          this.list_error_message =
            'No se pudo descargar la factura.';

          this.downloading_id = null;

          this.change_detector.markForCheck();

        }

      });

  }

}
