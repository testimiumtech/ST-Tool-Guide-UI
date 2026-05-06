import { Injectable, effect, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  private readonly themeSignal = signal<ThemeMode>(this.getInitialTheme());
  readonly theme = this.themeSignal.asReadonly();

  constructor() {
    this.mediaQuery.addEventListener('change', (event) => {
      if (!this.hasStoredTheme()) {
        this.themeSignal.set(event.matches ? 'dark' : 'light');
      }
    });

    effect(() => {
      const theme = this.theme();
      const themeColor = theme === 'dark' ? '#08111f' : '#f8fafc';

      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.style.colorScheme = theme;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);

      localStorage.setItem('theme', theme);
    });
  }

  private getInitialTheme(): ThemeMode {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    return this.mediaQuery.matches ? 'dark' : 'light';
  }

  private hasStoredTheme(): boolean {
    const stored = localStorage.getItem('theme');
    return stored === 'light' || stored === 'dark';
  }

  toggleTheme(): void {
    this.themeSignal.update((current) => (current === 'light' ? 'dark' : 'light'));
  }

  setTheme(theme: ThemeMode): void {
    this.themeSignal.set(theme);
  }
}
