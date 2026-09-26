import { Injectable, effect, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';


@Injectable({ providedIn: 'root' })

export class ThemeService {

  private readonly theme_signal =
    signal<Theme>(this.get_initial_theme());

  readonly theme =
    this.theme_signal.asReadonly();


  constructor() {

    effect(() => {

      const theme = this.theme_signal();

      document.documentElement.setAttribute(
        'data-theme',
        theme
      );

      localStorage.setItem(
        STORAGE_KEY,
        theme
      );

    });

  }


  toggle_theme(): void {

    this.theme_signal.set(
      this.theme_signal() === 'dark'
        ? 'light'
        : 'dark'
    );

  }


  private get_initial_theme(): Theme {

    const stored = localStorage.getItem(
      STORAGE_KEY
    );

    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    const prefers_dark =
      window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;

    return prefers_dark ? 'dark' : 'light';

  }

}
