import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {

  const auth_service = inject(AuthService);

  const token = localStorage.getItem('access_token');

  if (!token) {
    return next(request);
  }

  const authenticated_request = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authenticated_request);
};