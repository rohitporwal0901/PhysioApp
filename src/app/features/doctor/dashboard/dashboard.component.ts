import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { MockApiService } from '../../../core/services/mock-api.service';
import { BookingService, BookedAppointment } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private api = inject(MockApiService);
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);

  appointments: BookedAppointment[] = [];
  filteredAppointments: BookedAppointment[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];
  patientsCount$: Observable<number> = of(0);
  todayDate = new Date();
  isLoading = true;

  stats = {
    todayPatients: 0,
    pendingConfirmations: 0,
    totalPatients: 0,
    activeSessions: 0
  };

  ngOnInit() {
    const user = this.authService.currentUser;
    if (user && user.role === 'doctor') {
      this.bookingService.getDoctorAppointments(user.uid).subscribe(apts => {
        this.appointments = apts;
        this.updateStats(apts);
        this.filterAppointments();
        this.isLoading = false;
      });
    }
  }

  onDateChange() {
    this.filterAppointments();
  }

  private filterAppointments() {
    this.filteredAppointments = this.appointments
      .filter(apt => apt.date === this.selectedDate)
      .sort((a, b) => this.parseTime(a.time) - this.parseTime(b.time));
  }

  private parseTime(timeStr: string) {
    const match = timeStr.match(/(\d+):(\d+)\s+(AM|PM)/i);
    if (!match) return 0;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    if (match[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (match[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  private updateStats(apts: BookedAppointment[]) {
    const todayStr = new Date().toISOString().split('T')[0];
    
    this.stats.todayPatients = apts.filter(a => a.date === todayStr && a.status === 'confirmed').length;
    this.stats.pendingConfirmations = apts.filter(a => a.status === 'pending').length;
    this.stats.activeSessions = apts.filter(a => a.status === 'confirmed').length;
    
    // Total unique patients
    this.stats.totalPatients = new Set(apts.map(a => a.patientId)).size;
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
