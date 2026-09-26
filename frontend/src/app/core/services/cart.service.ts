import { Injectable, computed, effect, signal } from '@angular/core';

import { Product } from '../models/product.model';

export interface CartItem {

  product: Product;

  quantity: number;

}

const STORAGE_KEY = 'cart';


@Injectable({ providedIn: 'root' })

export class CartService {

  private readonly items_signal =
    signal<CartItem[]>(this.load_from_storage());

  readonly items =
    this.items_signal.asReadonly();

  readonly item_count = computed(() =>
    this.items_signal().reduce(
      (sum, item) => sum + item.quantity,
      0
    )
  );

  readonly total = computed(() =>
    this.items_signal().reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
  );


  constructor() {

    effect(() => {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(this.items_signal())
      );

    });

  }


  add_item(
    product: Product,
    quantity: number
  ): void {

    if (quantity <= 0) {
      return;
    }

    const current = this.items_signal();

    const existing = current.find(
      (item) => item.product.id === product.id
    );

    if (existing) {

      const new_quantity = Math.min(
        existing.quantity + quantity,
        product.stock
      );

      this.items_signal.set(
        current.map(
          (item) =>
            item.product.id === product.id
              ? { ...item, quantity: new_quantity }
              : item
        )
      );

      return;

    }

    this.items_signal.set([
      ...current,
      {
        product,
        quantity: Math.min(quantity, product.stock)
      }
    ]);

  }


  update_quantity(
    product_id: number,
    quantity: number
  ): void {

    if (quantity <= 0) {
      this.remove_item(product_id);
      return;
    }

    this.items_signal.set(
      this.items_signal().map(
        (item) =>
          item.product.id === product_id
            ? {
                ...item,
                quantity: Math.min(quantity, item.product.stock)
              }
            : item
      )
    );

  }


  remove_item(product_id: number): void {

    this.items_signal.set(
      this.items_signal().filter(
        (item) => item.product.id !== product_id
      )
    );

  }


  clear(): void {

    this.items_signal.set([]);

  }


  private load_from_storage(): CartItem[] {

    try {

      const raw = localStorage.getItem(STORAGE_KEY);

      return raw ? JSON.parse(raw) : [];

    } catch {

      return [];

    }

  }

}
