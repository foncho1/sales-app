import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Order,
  OrderCreate,
  OrderStatus
} from '../models/order.model';


@Injectable({ providedIn: 'root' })
export class OrderService {

  private readonly http = inject(HttpClient);

  private readonly api_url = 'http://localhost:8000';


  get_orders(): Observable<Order[]> {

    return this.http.get<Order[]>(
      `${this.api_url}/orders/`
    );

  }


  get_order(id: number): Observable<Order> {

    return this.http.get<Order>(
      `${this.api_url}/orders/${id}`
    );

  }


  create_order(order: OrderCreate): Observable<Order> {

    return this.http.post<Order>(
      `${this.api_url}/orders/`,
      order
    );

  }


  update_status(
    id: number,
    status: OrderStatus
  ): Observable<Order> {

    return this.http.patch<Order>(
      `${this.api_url}/orders/${id}/status`,
      { status }
    );

  }


  cancel_order(id: number): Observable<Order> {

    return this.http.delete<Order>(
      `${this.api_url}/orders/${id}`
    );

  }


  download_invoice(id: number): Observable<Blob> {

    return this.http.get(
      `${this.api_url}/orders/${id}/invoice`,
      { responseType: 'blob' }
    );

  }

}
