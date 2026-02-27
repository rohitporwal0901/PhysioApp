import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { BookingService, BookedAppointment } from '../../../core/services/booking.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private api = inject(MockApiService);
  private bookingService = inject(BookingService);

  doctors$: Observable<any[]> | null = null;
  upcomingAppointments: any[] = [];
  patientName = 'Guest';

  ngOnInit() {
    this.doctors$ = this.api.getDoctors();

    // Get patient name from booking service
    const patient = this.bookingService.currentPatient;
    if (patient) {
      this.patientName = patient.fullName.split(' ')[0]; // First name
    }

    // Get dynamically booked appointments for this patient
    this.bookingService.getMyAppointments().subscribe(appointments => {
      this.upcomingAppointments = appointments.map(a => {
        const d = new Date(a.date + 'T00:00:00');
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return {
          date: dateStr,
          time: a.time,
          doctor: a.doctorName,
          specialty: a.doctorSpecialty,
          status: a.status === 'confirmed' ? 'Confirmed' : a.status === 'scheduled' ? 'Pending' : a.status,
          isDynamic: true
        };
      });
    });
  }
}

