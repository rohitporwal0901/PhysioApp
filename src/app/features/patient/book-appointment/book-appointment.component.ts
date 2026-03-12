import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { Observable } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

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

  doctors$: Observable<any[]> | null = null;

  // Booking State
  currentStep = 1;
  selectedDoctor: any = null;
  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedTimeSlot: string | null = null;
  bookedSlots: string[] = [];
  bookingError = '';
  isProcessing = false;

  // All available slots
  availableTimeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '11:00 AM',
    '01:00 PM', '01:30 PM', '03:00 PM', '04:30 PM'
  ];

  ngOnInit() {
    if (!this.authService.isLoggedIn || this.authService.userRole !== 'patient') {
      this.router.navigate(['/login']);
      return;
    }
    this.doctors$ = this.api.getDoctors();
  }

  get patientName(): string {
    return this.authService.currentUser?.fullName || '';
  }

  selectDoctor(doc: any) {
    this.selectedDoctor = doc;
    this.currentStep = 2;
    this.refreshBookedSlots();
  }

  onDateChange() {
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

    const result = await this.bookingService.bookAppointment({
      doctorId: this.selectedDoctor.id,
      doctorName: this.selectedDoctor.fullName || this.selectedDoctor.name,
      doctorSpecialty: this.selectedDoctor.specialization || 'Physiotherapist',
      date: this.selectedDate,
      time: this.selectedTimeSlot,
      type: 'Consultation'
    });

    this.isProcessing = false;

    if (result.success) {
      this.currentStep = 3;
    } else {
      this.bookingError = result.error || 'Booking failed.';
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
}
