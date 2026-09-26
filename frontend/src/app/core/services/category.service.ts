import {HttpClient} from '@angular/common/http';

import {inject,Injectable} from '@angular/core';

import {Observable} from 'rxjs';

import {
  Category,
  CategoryCreate,
  CategoryUpdate
} from '../models/category.model';


@Injectable({providedIn: 'root'})


export class CategoryService {

  private readonly http = inject(HttpClient);

  private readonly api_url = 'http://localhost:8000';


  get_categories(): Observable<Category[]> {

    return this.http.get<Category[]>(
      `${this.api_url}/categories/`
    );

  }


  create_category(
    category: CategoryCreate
  ): Observable<Category> {

    return this.http.post<Category>(
      `${this.api_url}/categories/`,
      category
    );

  }


  update_category(
    id: number,
    category: CategoryUpdate
  ): Observable<Category> {

    return this.http.put<Category>(
      `${this.api_url}/categories/${id}`,
      category
    );

  }


  delete_category(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.api_url}/categories/${id}`
    );

  }

}