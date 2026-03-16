import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService, AppUser } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  path: string;
  badge?: string;
  badgeColor?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() role: string = ''; // Can be passed or detected
  @Input() isMobileMenuOpen: boolean = false;
  @Output() closeMenu = new EventEmitter<void>();

  private authService = inject(AuthService);

  get currentUser(): AppUser | null {
    return this.authService.currentUser;
  }

  get effectiveRole(): string {
    return this.role || this.currentUser?.role || 'admin';
  }

  get userName(): string {
    return this.currentUser?.fullName ?? 'User';
  }

  get userEmail(): string {
    return this.currentUser?.email ?? '';
  }

  get roleLabel(): string {
    switch (this.effectiveRole.toLowerCase()) {
      case 'doctor': return 'Doctor';
      case 'patient': return 'Patient';
      default: return 'Admin';
    }
  }

  get roleIcon(): string {
    switch (this.effectiveRole.toLowerCase()) {
      case 'doctor': return 'activity';
      case 'patient': return 'heart';
      default: return 'settings';
    }
  }

  get roleColorClasses(): string {
    switch (this.effectiveRole.toLowerCase()) {
      case 'doctor': return 'from-secondary-500 to-secondary-600';
      case 'patient': return 'from-accent-500 to-accent-600';
      default: return 'from-primary-500 to-primary-600';
    }
  }

  get menuItems(): MenuItem[] {
    switch (this.effectiveRole.toLowerCase()) {
      case 'doctor':
        return [
          { label: 'Dashboard', icon: 'layout-dashboard', path: '/doctor/dashboard' },
          { label: 'My Agenda', icon: 'calendar', path: '/doctor/agenda', badge: 'Today', badgeColor: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' },
          { label: 'My Patients', icon: 'users', path: '/doctor/patients' },
        ];
      case 'patient':
        return [
          { label: 'My Dashboard', icon: 'layout-dashboard', path: '/patient/dashboard' },
          { label: 'Book Session', icon: 'calendar-plus', path: '/patient/book-appointment', badge: 'New', badgeColor: 'bg-status-success/10 text-status-success dark:bg-status-success/20' },
          { label: 'My Sessions', icon: 'activity', path: '/patient/sessions' },
          { label: 'Lab Services', icon: 'microscope', path: '/patient/lab-services' },
        ];
      case 'admin':
      default:
        return [
          { label: 'Dashboard', icon: 'layout-dashboard', path: '/admin/dashboard' },
          { label: 'Doctors', icon: 'activity', path: '/admin/doctors' },
          { label: 'Patients', icon: 'users', path: '/admin/patients' },
          { label: 'Lab Technicians', icon: 'microscope', path: '/admin/lab-technicians' },
        ];
    }
  }

  async onLogout() {
    await this.authService.logout();
  }
}
