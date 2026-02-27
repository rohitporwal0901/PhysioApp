import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { MockApiService } from '../../../core/services/mock-api.service';
import { BookingService, BookedAppointment } from '../../../core/services/booking.service';
import { Observable } from 'rxjs';
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

  appointments$: Observable<any[]> | undefined;
  patients$: Observable<any[]> | undefined;

  stats = {
    todayPatients: 0,
    pendingReports: 3,
    weeklyRevenue: '$1,240',
    upcomingMeetings: 2
  };

  ngOnInit() {
    // We now just grab all appointments for D1 directly from the unified BookingService
    this.appointments$ = this.bookingService.getAppointmentsForDoctor('D1').pipe(
      map(appointments => {
        // Update stats dynamically based on the fully merged lists
        this.stats.todayPatients = appointments.length;

        // We ensure they're mapped appropriately for the HTML template to use
        return appointments.map(a => ({
          ...a,
          // If the ID was dynamically generated (starts with A plus timestamp), mark as dynamic
          isDynamic: a.id.length > 5
        }));
      })
    );

    this.patients$ = this.api.getPatients();
  }
}

