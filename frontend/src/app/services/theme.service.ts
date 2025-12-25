import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'synaptica_theme';
  private themeSubject: BehaviorSubject<Theme>;
  public theme$: Observable<Theme>;

  constructor() {
    const savedTheme = this.getSavedTheme();
    this.themeSubject = new BehaviorSubject<Theme>(savedTheme);
    this.theme$ = this.themeSubject.asObservable();
    this.applyTheme(savedTheme);
  }

  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    this.saveTheme(theme);
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    const newTheme = this.getCurrentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  private saveTheme(theme: Theme): void {
    try {
      localStorage.setItem(this.THEME_KEY, theme);
    } catch (error) {
      console.warn('[UYARI] Tema tercihi kaydedilemedi:', error);
    }
  }

  private getSavedTheme(): Theme {
    try {
      const saved = localStorage.getItem(this.THEME_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved as Theme;
      }
    } catch (error) {
      console.warn('[UYARI] Tema tercihi okunamadi:', error);
    }
    
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    
    return 'light';
  }

  private applyTheme(theme: Theme): void {
    if (typeof document !== 'undefined') {
      const htmlElement = document.documentElement;
      
      if (theme === 'dark') {
        htmlElement.classList.add('dark-theme');
        htmlElement.classList.remove('light-theme');
      } else {
        htmlElement.classList.add('light-theme');
        htmlElement.classList.remove('dark-theme');
      }
      
      htmlElement.setAttribute('data-theme', theme);
    }
  }
}
