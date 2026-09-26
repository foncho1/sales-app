import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {

  const auth_service = inject(AuthService);
  const router = inject(Router);

  if (auth_service.is_authenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};