import { Component, inject } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  returnUrl: string = '/';

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    const result = await this.authService.login(this.email, this.password);
    this.isLoading = false;

    if (result.success) {
      if (this.returnUrl && this.returnUrl !== '/') {
        this.router.navigateByUrl(this.returnUrl);
      } else {
        // Fallback to role-based redirection
        const role = this.authService.userRole;
        if (role) this.authService.navigateByRole(role);
      }
    } else {
      this.errorMessage = result.error ?? 'Login failed. Please try again.';
    }
  }
}
