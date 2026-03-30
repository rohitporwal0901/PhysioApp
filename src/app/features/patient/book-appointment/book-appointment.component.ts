import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { Observable, map } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './book-appointment.component.html',
  styleUrl: './book-appointment.component.scss'
})
export class BookAppointmentComponent implements OnInit {
  private api = inject(MockApiService);
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  doctors$: Observable<any[]> | null = null;

  // Booking State
  currentStep = 1;
  selectedDoctor: any = null;
  selectedDate: string = new Date().toISOString().split('T')[0];
  private prevDate: string = this.selectedDate;
  selectedTimeSlot: string | null = null;
  bookedSlots: string[] = [];
  bookingError = '';
  isProcessing = false;
  patientNotes = '';

  // All available slots (Standardized with DoctorProfile)
  availableTimeSlots = [
    '09:00 AM', '09:45 AM', '10:30 AM', '11:15 AM',
    '12:00 PM', '02:00 PM', '02:45 PM', '03:30 PM',
    '04:15 PM', '05:00 PM'
  ];

  selectedConsultationType = '';

  ngOnInit() {
    if (!this.authService.isLoggedIn || this.authService.userRole !== 'patient') {
      this.router.navigate(['/login']);
      return;
    }
    this.doctors$ = this.api.getDoctors().pipe(
      map(docs => docs.filter(doc => doc.active))
    );
  }

  get patientName(): string {
    return this.authService.currentUser?.fullName || '';
  }

  selectDoctor(doc: any) {
    if (doc.available === false) return;
    this.selectedDoctor = doc;
    this.setDefaultConsultationType();
    this.currentStep = 2;
    this.refreshBookedSlots();
  }

  onDateChange() {
    // Prevent clearing: if value is emptied (Clear button clicked), restore on next tick
    if (!this.selectedDate) {
      setTimeout(() => { this.selectedDate = this.prevDate; }, 10);
      return;
    }
    this.prevDate = this.selectedDate;
    this.refreshBookedSlots();
    if (this.selectedTimeSlot && this.bookedSlots.includes(this.selectedTimeSlot)) {
      this.selectedTimeSlot = null;
    }
  }

  async refreshBookedSlots() {
    if (this.selectedDoctor && this.selectedDate) {
      this.bookedSlots = await this.bookingService.getBookedSlots(this.selectedDoctor.id, this.selectedDate);
    }
  }

  isSlotBooked(slot: string): boolean {
    return this.bookedSlots.includes(slot) || this.isSlotInPast(slot);
  }

  isSlotInPast(slot: string): boolean {
    if (this.selectedDate !== this.minDate) return false;

    const now = new Date();
    const [time, period] = slot.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);

    return slotTime < now;
  }

  selectTimeSlot(slot: string) {
    if (!this.isSlotBooked(slot)) {
      this.selectedTimeSlot = slot;
      this.bookingError = '';
    }
  }

  async confirmBooking() {
    if (!this.selectedTimeSlot || !this.selectedDoctor) return;
    
    this.isProcessing = true;
    this.bookingError = '';

    if (!this.selectedConsultationType) {
      this.bookingError = 'Please select a consultation type.';
      this.isProcessing = false;
      return;
    }

    if (!this.patientNotes || this.patientNotes.trim().length < 10) {
      this.bookingError = 'Please provide a brief description of your problem (at least 10 characters).';
      this.isProcessing = false;
      return;
    }

    const result = await this.bookingService.bookAppointment({
      doctorId: this.selectedDoctor.id,
      doctorName: this.selectedDoctor.fullName || this.selectedDoctor.name,
      doctorSpecialty: this.selectedDoctor.specialization || 'Physiotherapist',
      doctorImage: this.selectedDoctor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.selectedDoctor.fullName || 'Doctor')}&background=0D8ABC&color=fff`,
      date: this.selectedDate,
      time: this.selectedTimeSlot,
      type: this.selectedConsultationType || 'Consultation',
      notes: this.patientNotes
    });

    this.isProcessing = false;

    if (result.success) {
      this.toast.success('Your appointment has been requested!', 'Booking Successful');
      this.currentStep = 3;
    } else {
      this.bookingError = result.error || 'Booking failed.';
      this.toast.error(this.bookingError, 'Booking Failed');
      this.refreshBookedSlots(); // Refresh in case it was just booked
    }
  }

  goBack() {
    if (this.currentStep > 1) {
      if (this.currentStep === 2) {
        this.selectedDoctor = null;
        this.selectedTimeSlot = null;
      }
      this.currentStep--;
    }
  }

  bookAnotherSlot() {
    this.currentStep = 1;
    this.selectedDoctor = null;
    this.selectedTimeSlot = null;
    this.bookingError = '';
    this.isProcessing = false;
  }

  get formattedDate(): string {
    if (!this.selectedDate) return '';
    const d = new Date(this.selectedDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  goToPatientDashboard() {
    this.router.navigate(['/patient/dashboard']);
  }

  goToDoctorDashboard() {
    this.router.navigate(['/doctor/dashboard']);
  }

  encodeURIComponent(str: string): string {
    return encodeURIComponent(str);
  }

  private setDefaultConsultationType() {
    if (!this.selectedDoctor) return;
    
    const type = (this.selectedDoctor.consultationType || '').toLowerCase();
    if (type === 'online') {
        this.selectedConsultationType = 'Online';
    } else if (type === 'in person' || type === 'in-person') {
        this.selectedConsultationType = 'In Person';
    } else if (type === 'both') {
        this.selectedConsultationType = 'In Person'; // Default to In Person but allows choice
    } else {
        // Fallback for missing or other types
        this.selectedConsultationType = 'In Person';
    }
  }
}
