import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, timeout, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000';
  private idleTimeout: number = 30 * 60 * 1000;
  private idleTimer: any = null;
  private lastActivityTime: number = Date.now();
  private healthCheckTimer: any = null;
  private healthCheckInterval: number = 30 * 1000;
  private consecutiveFailures: number = 0;
  private maxFailures: number = 2;

  constructor(private http: HttpClient, private injector: Injector) {
    this.initIdleTimeout();
    this.verifyTokenOnInit();
  }

  login(username: string, password: string): Observable<any> {
    const body = new HttpParams()
      .set('username', username)
      .set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(`${this.apiUrl}/token`, body.toString(), { headers }).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('role', response.role);
        localStorage.setItem('token_expire_time', (Date.now() + (24 * 60 * 60 * 1000)).toString());
        this.resetIdleTimer();
        this.startHealthCheck();
      })
    );
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  logout() {
    this.clearIdleTimer();
    this.clearHealthCheck();
    
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('token_expire_time');
    
    const router = this.injector.get(Router);
    router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    const expireTime = localStorage.getItem('token_expire_time');
    if (expireTime) {
      const expireTimestamp = parseInt(expireTime, 10);
      if (Date.now() > expireTimestamp) {
        setTimeout(() => {
          this.logout();
        }, 0);
        return false;
      }
    }

    return true;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string | null {
    return localStorage.getItem('role');
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/me`);
  }

  private initIdleTimeout() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.resetIdleTimer();
      }, true);
    });

    this.resetIdleTimer();
  }

  private resetIdleTimer() {
    this.clearIdleTimer();
    
    if (this.isLoggedIn()) {
      this.lastActivityTime = Date.now();
      
      this.idleTimer = setInterval(() => {
        const now = Date.now();
        const timeSinceLastActivity = now - this.lastActivityTime;
        
        if (timeSinceLastActivity >= this.idleTimeout) {
          console.log('[INFO] Oturum zaman asimina ugradi (30 dakika inaktivite)');
          this.logout();
        }
      }, 60000);
    }
  }

  private clearIdleTimer() {
    if (this.idleTimer) {
      clearInterval(this.idleTimer);
      this.idleTimer = null;
    }
  }

  public updateActivity() {
    this.resetIdleTimer();
  }

  private verifyTokenOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      this.verifyToken();
    }
  }

  private verifyToken() {
    this.http.get(`${this.apiUrl}/api/me`).pipe(
      timeout(5000),
      catchError((error) => {
        if (error.status === 401 || error.status === 0 || error.name === 'TimeoutError') {
          console.log('[HATA] Token gecersiz veya backend calismiyor: Oturum kapatiliyor...');
          this.logout();
        }
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response) {
          this.consecutiveFailures = 0;
          this.startHealthCheck();
        } else {
          this.logout();
        }
      },
      error: (error) => {
        if (error.status === 401 || error.status === 0 || error.name === 'TimeoutError') {
          this.logout();
        }
      }
    });
  }

  private startHealthCheck() {
    this.clearHealthCheck();
    
    if (!this.isLoggedIn()) {
      return;
    }

    this.healthCheckTimer = setInterval(() => {
      this.checkBackendHealth();
    }, this.healthCheckInterval);
  }

  private checkBackendHealth() {
    if (!this.isLoggedIn()) {
      this.clearHealthCheck();
      return;
    }

    this.http.get(`${this.apiUrl}/api/me`).pipe(
      timeout(5000),
      catchError((error) => {
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response) {
          this.consecutiveFailures = 0;
        } else {
          this.handleHealthCheckFailure();
        }
      },
      error: (error) => {
        this.handleHealthCheckFailure();
      }
    });
  }

  private handleHealthCheckFailure() {
    this.consecutiveFailures++;
    console.warn(`[UYARI] Backend kontrolu basarisiz (${this.consecutiveFailures}/${this.maxFailures})`);
    
    if (this.consecutiveFailures >= this.maxFailures) {
      console.log('[HATA] Backend calismiyor veya token gecersiz: Oturum kapatiliyor...');
      this.logout();
    }
  }

  private clearHealthCheck() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
    this.consecutiveFailures = 0;
  }
}
