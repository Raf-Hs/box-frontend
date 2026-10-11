import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav class="nav">
      <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
      <a routerLink="/history" routerLinkActive="active">History</a>
      <a routerLink="/habits" routerLinkActive="active">Habits</a>
    </nav>
    <main class="main">
      <router-outlet></router-outlet>
    </main>
  `,
})
export class AppComponent {}
