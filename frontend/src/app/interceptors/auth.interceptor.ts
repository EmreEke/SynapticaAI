import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  const token = localStorage.getItem('token');

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return next(clonedRequest).pipe(
      catchError((error) => {
        if (error.status === 401) {
          console.log('[HATA] Yetkilendirme hatasi: Oturum kapatiliyor...');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('token_expire_time');
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};
