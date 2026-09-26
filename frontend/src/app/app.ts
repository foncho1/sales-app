import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('sales-app');

  protected readonly theme_service = inject(ThemeService);

  protected toggle_theme(): void {
    this.theme_service.toggle_theme();
  }
}
