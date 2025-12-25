import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontend';
  today: Date = new Date();

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.checkInitialAuth();
  }

  private checkInitialAuth() {
    const token = this.authService.getToken();
    
    if (!token) {
      const currentPath = this.router.url;
      if (currentPath !== '/login' && !currentPath.startsWith('/login')) {
        this.router.navigate(['/login']);
      }
    }
  }
}
