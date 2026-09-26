import { Category } from './category.model';

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  //category_id: number;
  category: Category;
}

export interface ProductCreate {

  name: string;

  price: number;

  stock: number;

  category_id: number;

}

export interface ProductResponse {

  items: Product[];
  total: number;
  skip: number;
  limit: number;
  page: number;
  pages: number;
  has_next: boolean;
  has_previous: boolean;
}