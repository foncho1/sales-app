import { Product } from './product.model';


export type OrderStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'CANCELLED';


export interface OrderItem {

  id: number;

  product: Product;

  quantity: number;

  unit_price: number;

  subtotal: number;

}


export interface Order {

  id: number;

  status: OrderStatus;

  total: number;

  created_at: string;

  items: OrderItem[];

}


export interface OrderItemCreate {

  product_id: number;

  quantity: number;

}


export interface OrderCreate {

  items: OrderItemCreate[];

}


export interface OrderStatusUpdate {

  status: OrderStatus;

}


export interface OrderResponse {

  items: Order[];
  total: number;
  skip: number;
  limit: number;
  page: number;
  pages: number;
  has_next: boolean;
  has_previous: boolean;
}
