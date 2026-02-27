import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { BookingService } from '../../../core/services/booking.service';
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
  private router = inject(Router);

  doctors$: Observable<any[]> | null = null;

  // Booking State
  currentStep = 1;
  selectedDoctor: any = null;
  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedTimeSlot: string | null = null;
  bookedSlots: string[] = [];
  bookingError = '';

  // All available slots
  availableTimeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '11:00 AM',
    '01:00 PM', '01:30 PM', '03:00 PM', '04:30 PM'
  ];

  ngOnInit() {
    // Check if patient is registered
    if (!this.bookingService.isPatientRegistered) {
      this.router.navigate(['/patient/register']);
      return;
    }
    this.doctors$ = this.api.getDoctors();
  }

  get isPatientRegistered(): boolean {
    return this.bookingService.isPatientRegistered;
  }

  get patientName(): string {
    return this.bookingService.currentPatient?.fullName || '';
  }

  selectDoctor(doc: any) {
    if (!doc.available) return;
    this.selectedDoctor = doc;
    this.currentStep = 2;
    // Load booked slots for this doctor on selected date
    this.refreshBookedSlots();
  }

  onDateChange() {
    this.refreshBookedSlots();
    // If selected slot is now booked, deselect it
    if (this.selectedTimeSlot && this.bookedSlots.includes(this.selectedTimeSlot)) {
      this.selectedTimeSlot = null;
    }
  }

  refreshBookedSlots() {
    if (this.selectedDoctor && this.selectedDate) {
      this.bookedSlots = this.bookingService.getBookedSlotsForDoctor(this.selectedDoctor.id, this.selectedDate);
    }
  }

  isSlotBooked(slot: string): boolean {
    return this.bookedSlots.includes(slot);
  }

  selectTimeSlot(slot: string) {
    if (!this.isSlotBooked(slot)) {
      this.selectedTimeSlot = slot;
      this.bookingError = '';
    }
  }

  confirmBooking() {
    if (this.selectedTimeSlot && this.selectedDoctor) {
      const appointment = this.bookingService.bookAppointment({
        doctorId: this.selectedDoctor.id,
        doctorName: this.selectedDoctor.name,
        doctorSpecialty: this.selectedDoctor.specialty,
        doctorImage: this.selectedDoctor.image,
        date: this.selectedDate,
        time: this.selectedTimeSlot,
        type: 'Consultation'
      });

      if (appointment) {
        this.currentStep = 3;
        this.bookingError = '';
      } else {
        this.bookingError = 'This slot is already booked. Please select another.';
      }
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

  goToPatientDashboard() {
    this.router.navigate(['/patient/dashboard']);
  }

  goToDoctorDashboard() {
    this.router.navigate(['/doctor/dashboard']);
  }

  get formattedDate(): string {
    if (!this.selectedDate) return '';
    const d = new Date(this.selectedDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}

