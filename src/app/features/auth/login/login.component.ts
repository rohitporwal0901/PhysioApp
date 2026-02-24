import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, Activity, Mail, Lock } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor() {
    // We can't import icons directly in imports array with .pick() for some versions, or we can.
    // Let's use it this way or setup global. Let's provide them where needed.
  }

  selectedRole: string = 'Admin';
  private router = inject(Router);

  selectRole(role: string) {
    this.selectedRole = role;
  }

  login() {
    switch (this.selectedRole) {
      case 'Admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'Doctor':
        this.router.navigate(['/doctor/dashboard']);
        break;
      case 'Patient':
        this.router.navigate(['/patient/dashboard']);
        break;
    }
  }
}
