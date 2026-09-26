import { HttpClient } from '@angular/common/http';

import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { User, UserCreate, UserUpdate } from '../models/user.model';


@Injectable({ providedIn: 'root' })

export class UserService {

  private readonly http = inject(HttpClient);

  private readonly api_url = 'http://localhost:8000';


  register_user(user: UserCreate): Observable<User> {

    return this.http.post<User>(
      `${this.api_url}/auth/register`,
      user
    );

  }


  get_users(): Observable<User[]> {

    return this.http.get<User[]>(
      `${this.api_url}/users/`
    );

  }


  update_user(
    id: number,
    user: UserUpdate
  ): Observable<User> {

    return this.http.put<User>(
      `${this.api_url}/users/${id}`,
      user
    );

  }


  delete_user(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.api_url}/users/${id}`
    );

  }

}
