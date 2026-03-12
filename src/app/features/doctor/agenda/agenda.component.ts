import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService, BookedAppointment } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { Observable, of } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss'
})
export class AgendaComponent implements OnInit {
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);

  allAppointments: BookedAppointment[] = [];
  filteredAgenda: BookedAppointment[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedAppointment: BookedAppointment | null = null;
  isLoading = true;

  ngOnInit() {
    const user = this.authService.currentUser;
    if (user && user.role === 'doctor') {
      this.bookingService.getDoctorAppointments(user.uid).subscribe(data => {
        this.allAppointments = data;
        this.filterAgenda();
        this.isLoading = false;
      });
    }
  }

  onDateChange() {
    this.filterAgenda();
    this.selectedAppointment = null;
  }

  filterAgenda() {
    const parseTime = (timeStr: string) => {
      const match = timeStr.match(/(\d+):(\d+)\s+(AM|PM)/i);
      if(!match) return 0;
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      if(match[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
      if(match[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    this.filteredAgenda = this.allAppointments
      .filter(apt => apt.date === this.selectedDate)
      .sort((a, b) => parseTime(a.time) - parseTime(b.time));
  }

  selectAppointment(apt: BookedAppointment) {
    this.selectedAppointment = apt;
  }

  async confirmAppointment(apt: BookedAppointment) {
    if (!apt.id) return;
    try {
      await this.bookingService.updateAppointmentStatus(apt.id, 'confirmed');
      if (this.selectedAppointment?.id === apt.id) {
        this.selectedAppointment.status = 'confirmed';
      }
    } catch (error) {
      console.error('Error confirming appointment', error);
    }
  }

  async rejectAppointment(apt: BookedAppointment) {
    if (!apt.id) return;
    try {
      // Rejection cancels the appointment, opening the slot back up
      await this.bookingService.updateAppointmentStatus(apt.id, 'cancelled');
      if (this.selectedAppointment?.id === apt.id) {
        this.selectedAppointment.status = 'cancelled';
      }
    } catch (error) {
      console.error('Error rejecting appointment', error);
    }
  }

  async completeAppointment(apt: BookedAppointment) {
    if (!apt.id) return;
    try {
      // Completing the appointment also frees up the slot status for others if needed
      await this.bookingService.updateAppointmentStatus(apt.id, 'completed');
      if (this.selectedAppointment?.id === apt.id) {
        this.selectedAppointment.status = 'completed';
      }
    } catch (error) {
      console.error('Error completing appointment', error);
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
    }
  }
}
