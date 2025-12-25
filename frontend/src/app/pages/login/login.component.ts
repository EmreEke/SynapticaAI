import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (!this.username || !this.password) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.authService.updateActivity();
        setTimeout(() => {
            this.router.navigate(['/dashboard']);
        }, 500);
      },
      error: (err) => {
        console.error('[HATA] Giris hatasi:', err);
        this.errorMessage = 'Kullanıcı adı veya şifre hatalı!';
        this.isLoading = false;
      }
    });
  }
}
