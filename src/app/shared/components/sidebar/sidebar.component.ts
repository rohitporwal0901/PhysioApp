import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

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

  get menuItems() {
    switch (this.role) {
      case 'Doctor':
        return [
          { label: 'Agenda', icon: 'calendar', path: '/doctor/agenda' },
          { label: 'Dashboard', icon: 'layout-dashboard', path: '/doctor/dashboard' },
          { label: 'Patients', icon: 'users', path: '/doctor/patients' },
        ];
      case 'Patient':
        return [
          { label: 'Dashboard', icon: 'layout-dashboard', path: '/patient/dashboard' },
          { label: 'Book Appointment', icon: 'plus', path: '/patient/book-appointment' },
          { label: 'My Sessions', icon: 'activity', path: '/patient/sessions' },
        ];
      case 'Admin':
      default:
        return [
          { label: 'Dashboard', icon: 'layout-dashboard', path: '/admin/dashboard' },
          { label: 'Doctors', icon: 'users', path: '/admin/doctors' },
          { label: 'Patients', icon: 'users', path: '/admin/patients' },
        ];
    }
  }
}

