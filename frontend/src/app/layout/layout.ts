import {Component,inject} from '@angular/core';

import {Router,RouterLink,RouterLinkActive,RouterOutlet} from '@angular/router';

import { AuthService } from '../core/services/auth.service';
import { CartService } from '../core/services/cart.service';
import { User } from '../core/models/user.model';

@Component({
  selector: 'app-layout',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {

  private readonly auth_service = inject(AuthService);
  private readonly cart_service = inject(CartService);
  private readonly router = inject(Router);

  protected current_user: User | null = null;

  protected readonly cart_item_count = this.cart_service.item_count;

  constructor() {

    if (this.auth_service.is_authenticated()) {

      this.auth_service
        .get_current_user()
        .subscribe({
          next: (user) => {

            this.current_user = user;

          },
          error: () => {

            this.auth_service.logout();

            this.router.navigate([
              '/login'
            ]);

          }
        });

    }

  }


  protected logout(): void {

    this.auth_service.logout();

    this.router.navigate([
      '/login'
    ]);

  }


  protected is_admin(): boolean {

    return this.current_user?.role === 'ADMIN';

  }

}