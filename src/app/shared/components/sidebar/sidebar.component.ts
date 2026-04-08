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

import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, ConfirmDialogComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() role: string = ''; // Can be passed or detected
  @Input() isMobileMenuOpen: boolean = false;
  @Output() closeMenu = new EventEmitter<void>();

  private authService = inject(AuthService);
  showLogoutConfirm = false;

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
      case 'lab': return 'Lab Manager';
      default: return 'Admin';
    }
  }

  get roleIcon(): string {
    switch (this.effectiveRole.toLowerCase()) {
      case 'doctor': return 'activity';
      case 'patient': return 'heart';
      case 'lab': return 'microscope';
      default: return 'settings';
    }
  }

  get roleColorClasses(): string {
    switch (this.effectiveRole.toLowerCase()) {
      case 'doctor': return 'from-secondary-500 to-secondary-600';
      case 'patient': return 'from-accent-500 to-accent-600';
      case 'lab': return 'from-indigo-500 to-indigo-600';
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
          { label: 'My Profile', icon: 'user', path: '/doctor/profile' },
        ];
      case 'patient':
        return [
          { label: 'My Dashboard', icon: 'layout-dashboard', path: '/patient/dashboard' },
          { label: 'Book Session', icon: 'calendar-plus', path: '/patient/book-appointment', badge: 'New', badgeColor: 'bg-status-success/10 text-status-success dark:bg-status-success/20' },
          { label: 'My Sessions', icon: 'activity', path: '/patient/sessions' },
          { label: 'Diagnostic Labs', icon: 'microscope', path: '/patient/lab-services' },
          { label: 'My Profile', icon: 'user', path: '/patient/profile' },
        ];
      case 'lab':
        return [
          { label: 'Dashboard', icon: 'layout-dashboard', path: '/lab/dashboard' },
        ];
      case 'admin':
      default:
        return [
          { label: 'Dashboard', icon: 'layout-dashboard', path: '/admin/dashboard' },
          { label: 'Doctors', icon: 'activity', path: '/admin/doctors' },
          { label: 'Patients', icon: 'users', path: '/admin/patients' },
          { label: 'Diagnostic Labs', icon: 'microscope', path: '/admin/lab-technicians' },
          { label: 'Video Management', icon: 'youtube', path: '/admin/video-settings' },
          { label: 'Specializations', icon: 'stethoscope', path: '/admin/specialties' },
        ];
    }
  }

  get subscription() {
    return (this.currentUser as any)?.subscription;
  }

  get planName(): string {
    const plan = this.subscription?.plan;
    if (plan === 'monthly') return 'Monthly Plan';
    if (plan === 'halfYearly') return 'Half-Yearly Plan';
    if (plan === 'yearly') return 'Yearly Plan';
    return (this.effectiveRole === 'doctor' || this.effectiveRole === 'lab') ? 'No Active Plan' : '';
  }

  get expiryDateDisplay(): string {
    if (!this.subscription?.expiryDate) return '';
    const expiry = this.subscription.expiryDate;
    const date = (expiry as any).toDate ? (expiry as any).toDate() : new Date(expiry);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  get daysRemaining(): number {
    if (!this.subscription?.expiryDate) return 0;
    const expiry = this.subscription.expiryDate;
    const date = (expiry as any).toDate ? (expiry as any).toDate() : new Date(expiry);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  get isExpiredState(): boolean {
    if (!this.subscription) return false;
    const status = this.subscription.status === 'expired';
    const dateExpired = this.subscription.expiryDate ? this.daysRemaining <= 0 : false;
    return status || dateExpired;
  }

  async onLogout() {
    this.showLogoutConfirm = true;
  }

  async confirmLogout() {
    await this.authService.logout();
    this.showLogoutConfirm = false;
  }
}
