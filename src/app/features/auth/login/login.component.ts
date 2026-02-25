import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

interface RoleConfig {
  label: string;
  icon: string;
  accentColor: string;
  gradient: string;
  tagline: string;
  description: string;
  features: { icon: string; text: string }[];
  image: string;
  route: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private router = inject(Router);

  selectedRole: string = 'Admin';
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  roleConfigs: Record<string, RoleConfig> = {
    Admin: {
      label: 'Admin',
      icon: 'settings',
      accentColor: 'text-primary-500',
      gradient: 'from-primary-600 to-primary-400',
      tagline: 'Super Admin Panel',
      description: 'Full control over your clinic — manage doctors, patients, appointments and view real-time analytics.',
      features: [
        { icon: 'users', text: 'Add & manage all doctors' },
        { icon: 'calendar', text: 'View all appointments' },
        { icon: 'activity', text: 'Clinic analytics & reports' },
        { icon: 'settings', text: 'System configuration' },
      ],
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop',
      route: '/admin/dashboard',
    },
    Doctor: {
      label: 'Doctor',
      icon: 'activity',
      accentColor: 'text-secondary-500',
      gradient: 'from-secondary-600 to-secondary-400',
      tagline: 'Doctor Portal',
      description: 'Manage your daily schedule, review patient records, and track treatment progress — all in one place.',
      features: [
        { icon: 'calendar', text: 'Daily agenda & schedule' },
        { icon: 'users', text: 'Patient case management' },
        { icon: 'clipboard-list', text: 'Treatment notes & plans' },
        { icon: 'activity', text: 'Session history & reports' },
      ],
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1200&auto=format&fit=crop',
      route: '/doctor/dashboard',
    },
    Patient: {
      label: 'Patient',
      icon: 'heart',
      accentColor: 'text-accent-500',
      gradient: 'from-accent-600 to-accent-400',
      tagline: 'Patient Portal',
      description: 'Book appointments, track your recovery journey, view session history and connect with your care team.',
      features: [
        { icon: 'calendar-plus', text: 'Book appointments online' },
        { icon: 'activity', text: 'Track recovery progress' },
        { icon: 'clock', text: 'View session history' },
        { icon: 'heart', text: 'Connect with doctors' },
      ],
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format&fit=crop',
      route: '/patient/dashboard',
    },
  };

  get currentConfig(): RoleConfig {
    return this.roleConfigs[this.selectedRole];
  }

  selectRole(role: string) {
    this.selectedRole = role;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    this.isLoading = true;
    // Simulate login delay
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate([this.currentConfig.route]);
    }, 900);
  }
}
