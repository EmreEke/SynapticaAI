import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService, Theme } from '../../services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  today: Date = new Date();
  
  username: string = '';
  role: string = '';
  
  isDropdownOpen: boolean = false;
  
  isSidebarOpen: boolean = false;
  
  currentTheme: Theme = 'light';
  themeSubscription?: Subscription;
  
  isMobile: boolean = false;
  isTablet: boolean = false;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService
  ) {
    this.checkScreenSize();
  }

  ngOnInit() {
    const storedRole = this.authService.getUserRole();
    this.role = storedRole ? storedRole.charAt(0).toUpperCase() + storedRole.slice(1) : 'User';

    this.authService.getProfile().subscribe({
      next: (data) => {
        this.username = data.username;
      },
      error: (err) => {
        console.error('[HATA] Kullanici bilgisi alinamadi:', err);
        this.username = 'Misafir';
      }
    });

    this.currentTheme = this.themeService.getCurrentTheme();
    this.themeSubscription = this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  ngOnDestroy() {
    this.themeSubscription?.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    const width = window.innerWidth;
    this.isMobile = width < 768;
    this.isTablet = width >= 768 && width < 1024;
    
    if (!this.isMobile) {
      this.isSidebarOpen = true;
    } else {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    if (this.isMobile) {
      this.isSidebarOpen = false;
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  onLogout() {
    this.authService.logout();
  }
}
