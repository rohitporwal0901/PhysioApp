import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

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
  @Input() role: string = 'Admin';
  @Input() isMobileMenuOpen: boolean = false;
  @Output() closeMenu = new EventEmitter<void>();

  get roleLabel(): string {
    return this.role;
  }

  get roleIcon(): string {
    switch (this.role) {
      case 'Doctor': return 'activity';
      case 'Patient': return 'heart';
      default: return 'settings';
    }
  }

  get roleColor(): string {
    switch (this.role) {
      case 'Doctor': return 'from-secondary-500 to-secondary-600';
      case 'Patient': return 'from-accent-500 to-accent-600';
      default: return 'from-primary-500 to-primary-600';
    }
  }

  get userName(): string {
    switch (this.role) {
      case 'Doctor': return 'Dr. Sarah Jenkins';
      case 'Patient': return 'John Doe';
      default: return 'Super Admin';
    }
  }

  get menuItems(): MenuItem[] {
    switch (this.role) {
      case 'Doctor':
        return [
          { label: 'Dashboard', icon: 'layout-dashboard', path: '/doctor/dashboard' },
          { label: 'My Agenda', icon: 'calendar', path: '/doctor/agenda', badge: 'Today', badgeColor: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' },
          { label: 'My Patients', icon: 'users', path: '/doctor/patients' },
        ];
      case 'Patient':
        return [
          { label: 'My Dashboard', icon: 'layout-dashboard', path: '/patient/dashboard' },
          { label: 'Book Session', icon: 'calendar-plus', path: '/patient/book-appointment', badge: 'New', badgeColor: 'bg-status-success/10 text-status-success dark:bg-status-success/20' },
          { label: 'My Sessions', icon: 'activity', path: '/patient/sessions' },
        ];
      case 'Admin':
      default:
        return [
          { label: 'Dashboard', icon: 'layout-dashboard', path: '/admin/dashboard' },
          { label: 'Doctors', icon: 'activity', path: '/admin/doctors' },
          { label: 'Patients', icon: 'users', path: '/admin/patients' },
        ];
    }
  }
}
