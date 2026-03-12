import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { MockApiService } from '../../../core/services/mock-api.service';
import { BookingService, BookedAppointment } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private api = inject(MockApiService);
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);

  appointments$: Observable<BookedAppointment[]> = of([]);
  patientsCount$: Observable<number> = of(0);
  todayDate = new Date();

  stats = {
    todayPatients: 0,
    pendingConfirmations: 0,
    totalPatients: 0,
    activeSessions: 0
  };

  ngOnInit() {
    const user = this.authService.currentUser;
    if (user && user.role === 'doctor') {
      this.appointments$ = this.bookingService.getDoctorAppointments(user.uid);
      
      this.appointments$.subscribe(apts => {
        const todayStr = new Date().toISOString().split('T')[0];
        
        this.stats.todayPatients = apts.filter(a => a.date === todayStr && a.status === 'confirmed').length;
        this.stats.pendingConfirmations = apts.filter(a => a.status === 'pending').length;
        this.stats.activeSessions = apts.filter(a => a.status === 'confirmed').length;
      });

      // Simple total patients count for this doctor (unique patient IDs)
      this.appointments$.pipe(
        map(apts => new Set(apts.map(a => a.patientId)).size)
      ).subscribe(count => this.stats.totalPatients = count);
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
    }
  }
}
