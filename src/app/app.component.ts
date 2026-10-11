import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav class="nav">
      <a routerLink="/dashboard" class="nav-brand">
        <span class="nav-brand-icon">B</span>
        BOX
      </a>
      <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
      <a routerLink="/history" routerLinkActive="active">History</a>
      <a routerLink="/habits" routerLinkActive="active">Habits</a>
      <div class="nav-actions">
        <button
          class="theme-toggle"
          (click)="themeService.toggle()"
          [attr.aria-label]="themeService.currentTheme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          {{ themeService.currentTheme() === 'dark' ? '☀' : '☾' }}
        </button>
      </div>
    </nav>
    <main class="main">
      <router-outlet></router-outlet>
    </main>
  `,
})
export class AppComponent {
  themeService = inject(ThemeService);
}
