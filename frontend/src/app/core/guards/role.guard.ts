import { inject } from '@angular/core';
import {CanActivateFn,Router} from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const roleGuard = (
  allowed_roles: string[]
): CanActivateFn => {

  return () => {

    const auth_service = inject(
      AuthService
    );

    const router = inject(
      Router
    );

    if (!auth_service.is_authenticated()) {

      return router.createUrlTree([
        '/login'
      ]);

    }

    return auth_service
      .get_current_user()
      .pipe(

        map((user) => {

          if (
            allowed_roles.includes(
              user.role
            )
          ) {

            return true;

          }

          return router.createUrlTree([
            '/forbidden'
          ]);

        })

      );

  };

};