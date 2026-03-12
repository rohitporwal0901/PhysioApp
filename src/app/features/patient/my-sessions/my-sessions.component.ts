import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { MockApiService } from '../../../core/services/mock-api.service';
import { BookingService, BookedAppointment } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-my-sessions',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './my-sessions.component.html',
  styleUrl: './my-sessions.component.scss'
})
export class MySessionsComponent implements OnInit {
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);

  upcomingSessions: BookedAppointment[] = [];
  pastSessions: BookedAppointment[] = [];
  activeTab: 'upcoming' | 'past' = 'upcoming';
  isLoading = true;

  ngOnInit() {
    const user = this.authService.currentUser;
    if (user && user.role === 'patient') {
      this.bookingService.getPatientAppointments(user.uid).subscribe(appointments => {
        // Step 1: Divide sessions into Upcoming and Past based on status
        this.upcomingSessions = appointments
          .filter(apt => apt.status === 'pending' || apt.status === 'confirmed')
          .sort((a, b) => this.compareDateTime(a, b));

        this.pastSessions = appointments
          .filter(apt => apt.status === 'completed' || apt.status === 'cancelled')
          .sort((a, b) => this.compareDateTime(b, a)); // Past history latest first

        this.isLoading = false;
      });
    }
  }

  /** Helper to compare date and time for sorting */
  private compareDateTime(a: BookedAppointment, b: BookedAppointment): number {
    const dateA = new Date(a.date + 'T00:00:00');
    const dateB = new Date(b.date + 'T00:00:00');
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    return this.parseTime(a.time) - this.parseTime(b.time);
  }

  private parseTime(timeStr: string): number {
    const match = timeStr.match(/(\d+):(\d+)\s+(AM|PM)/i);
    if (!match) return 0;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    if (match[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (match[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  encodeURIComponent(str: string): string {
    return encodeURIComponent(str);
  }
}
