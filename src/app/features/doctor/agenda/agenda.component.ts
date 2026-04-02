import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService, BookedAppointment } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { Observable, of } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ConfirmDialogComponent],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss'
})
export class AgendaComponent implements OnInit {
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);

  allAppointments: BookedAppointment[] = [];
  filteredAgenda: BookedAppointment[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];
  private prevDate: string = this.selectedDate;
  selectedAppointment: BookedAppointment | null = null;
  isLoading = true;
  actionLoading = false;
  clinicalNotes: string = '';

  // Confirmation dialog state
  confirmConfig = {
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    confirmBtnClass: '',
    icon: '',
    action: () => { }
  };

  // Unsplash profile image collections for patients
  private patientImages = [
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop'
  ];

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
    // Prevent clearing: if value is emptied (Clear button clicked), restore on next tick
    if (!this.selectedDate) {
      setTimeout(() => { this.selectedDate = this.prevDate; }, 10);
      return;
    }
    this.prevDate = this.selectedDate;
    this.filterAgenda();
    this.selectedAppointment = null;
  }

  filterAgenda() {
    const parseTime = (timeStr: string) => {
      const match = timeStr.match(/(\d+):(\d+)\s+(AM|PM)/i);
      if (!match) return 0;
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      if (match[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (match[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    this.filteredAgenda = this.allAppointments
      .filter(apt => apt.date === this.selectedDate)
      .sort((a, b) => parseTime(a.time) - parseTime(b.time));
  }

  selectAppointment(apt: BookedAppointment) {
    this.selectedAppointment = apt;
    this.clinicalNotes = apt.treatmentNotes || '';
  }

  async confirmAppointment(apt: BookedAppointment) {
    if (!apt.id || this.actionLoading) return;

    this.confirmConfig = {
      isOpen: true,
      title: 'Confirm Appointment',
      message: `Are you sure you want to confirm this session with ${apt.patientName}?`,
      confirmText: 'Confirm',
      confirmBtnClass: 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-500/25',
      icon: 'check-circle',
      action: async () => {
        this.actionLoading = true;
        try {
          if (apt.id) {
            await this.bookingService.updateAppointmentStatus(apt.id, 'confirmed');
            if (this.selectedAppointment?.id === apt.id) {
              this.selectedAppointment.status = 'confirmed';
            }
          }
        } catch (error) {
          console.error('Error confirming appointment', error);
        } finally {
          this.actionLoading = false;
        }
      }
    };
  }

  async rejectAppointment(apt: BookedAppointment) {
    if (!apt.id || this.actionLoading) return;

    this.confirmConfig = {
      isOpen: true,
      title: 'Reject Appointment',
      message: `Do you want to decline this request from ${apt.patientName}?`,
      confirmText: 'Decline',
      confirmBtnClass: 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/25',
      icon: 'alert-circle',
      action: async () => {
        this.actionLoading = true;
        try {
          if (apt.id) {
            // Rejection cancels the appointment, opening the slot back up
            await this.bookingService.updateAppointmentStatus(apt.id, 'cancelled');
            if (this.selectedAppointment?.id === apt.id) {
              this.selectedAppointment.status = 'cancelled';
            }
          }
        } catch (error) {
          console.error('Error rejecting appointment', error);
        } finally {
          this.actionLoading = false;
        }
      }
    };
  }

  async completeAppointment(apt: BookedAppointment) {
    if (!apt.id || this.actionLoading) return;

    this.confirmConfig = {
      isOpen: true,
      title: 'Complete Session',
      message: `Mark this session with ${apt.patientName} as completed?`,
      confirmText: 'Completed',
      confirmBtnClass: 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/25',
      icon: 'award',
      action: async () => {
        this.actionLoading = true;
        try {
          if (apt.id) {
            if (this.clinicalNotes) {
              await this.bookingService.updateTreatmentNotes(apt.id, this.clinicalNotes);
            }
            await this.bookingService.updateAppointmentStatus(apt.id, 'completed');
            if (this.selectedAppointment?.id === apt.id) {
              this.selectedAppointment.status = 'completed';
              this.selectedAppointment.treatmentNotes = this.clinicalNotes;
            }
          }
        } catch (error) {
          console.error('Error completing appointment', error);
        } finally {
          this.actionLoading = false;
        }
      }
    };
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

  sendWhatsApp(apt: BookedAppointment, type: 'reminder' | 'chat' = 'chat') {
    if (!apt || !apt.patientPhone) {
      console.error('Patient phone number not available');
      return;
    }

    let message = '';
    if (type === 'reminder') {
      message = `Hello ${apt.patientName}, this is a reminder for your HealthHub appointment today at ${apt.time}. Please be on time.`;
    }
    
    // Clean phone number (remove any non-numeric characters except +)
    const phone = apt.patientPhone.replace(/[^\d+]/g, '');
    const baseUrl = `https://wa.me/${phone}`;
    const url = message ? `${baseUrl}?text=${this.encodeURIComponent(message)}` : baseUrl;
    window.open(url, '_blank');
  }

  getPatientImage(apt: any, index: number): string {
    if (apt.patientImage && !apt.patientImage.includes('ui-avatars.com')) {
      return apt.patientImage;
    }
    return this.patientImages[index % this.patientImages.length];
  }

  encodeURIComponent(str: string): string {
    return encodeURIComponent(str);
  }
}
