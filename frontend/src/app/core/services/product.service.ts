import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {Product,ProductResponse, ProductCreate} from '../models/product.model';

@Injectable({providedIn: 'root'})

export class ProductService {

  private readonly http = inject(HttpClient);

  private readonly api_url =
    'http://localhost:8000';


  get_products(
    skip: number = 0,
    limit: number = 10,
    search?: string,
    category_id?: number | null,
    min_price?: number | null,
    max_price?: number | null,
    sort?: string | null
  ){
    let params = new HttpParams()
    .set('skip', skip)
    .set('limit', limit);

  if (search?.trim()) {

    params = params.set(
      'search',
      search.trim()
    );

  }

  if (category_id !== null && category_id !== undefined) {

    params = params.set(
      'category_id',
      category_id
    );

  }

   if (min_price !== null && min_price !== undefined){

    params = params.set( 'min_price', min_price);

   }


  if (max_price !== null && max_price !== undefined){

    params = params.set('max_price', max_price);

  }


  if (sort) {params = params.set('sort', sort);

  }


  return this.http.get<ProductResponse>(
    `${this.api_url}/products/`,
    { params }
  );
  }

  create_product(product: ProductCreate) {

  return this.http.post<Product>(
    `${this.api_url}/products/`,product);

}


  get_product(id: number): Observable<Product> {

    return this.http.get<Product>(
      `${this.api_url}/products/${id}`
    );

  }


  update_product(
    id: number,
    product: ProductCreate
  ): Observable<Product> {

    return this.http.put<Product>(
      `${this.api_url}/products/${id}`,
      product
    );

  }


  delete_product(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.api_url}/products/${id}`
    );

  }

}