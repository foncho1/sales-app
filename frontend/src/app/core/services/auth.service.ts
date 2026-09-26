import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';

import { TokenResponse } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);

  private readonly api_url = 'http://localhost:8000';

  private readonly current_user_subject =
    new BehaviorSubject<User | null>(null);

  readonly current_user$ =
    this.current_user_subject.asObservable();


  login(
    email: string,
    password: string
  ): Observable<TokenResponse> {

    const body = new URLSearchParams();

    body.set('username', email);
    body.set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<TokenResponse>(
      `${this.api_url}/auth/login`,
      body.toString(),
      { headers }
    ).pipe(
      tap((response) => {

        localStorage.setItem(
          'access_token',
          response.access_token
        );

      })
    );
  }


  get_token(): string | null {

    return localStorage.getItem(
      'access_token'
    );

  }


  is_authenticated(): boolean {

    return this.get_token() !== null;

  }


  get_current_user(): Observable<User> {

    return this.http.get<User>(
      `${this.api_url}/auth/me`
    ).pipe(
      tap((user) => {

        this.current_user_subject.next(
          user
        );

      })
    );

  }


  logout(): void {

    localStorage.removeItem(
      'access_token'
    );

    this.current_user_subject.next(
      null
    );

  }

}