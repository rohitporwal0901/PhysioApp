import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  private router = inject(Router);

  isMobileMenuOpen = false;
  currentRole = 'Admin';
  pageTitle = 'Dashboard';

  ngOnInit() {
    this.updateLayoutState(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateLayoutState(event.urlAfterRedirects);
    });
  }

  updateLayoutState(url: string) {
    if (url.includes('doctor')) {
      this.currentRole = 'Doctor';
    } else if (url.includes('patient')) {
      this.currentRole = 'Patient';
    } else {
      this.currentRole = 'Admin';
    }

    if (url.includes('agenda')) this.pageTitle = 'My Agenda';
    else if (url.includes('book-appointment')) this.pageTitle = 'Book Appointment';
    else if (url.includes('patients')) this.pageTitle = 'Patients Directory';
    else if (url.includes('doctors')) this.pageTitle = 'Doctors Directory';
    else this.pageTitle = 'Dashboard';
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}

