import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { Observable } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './book-appointment.component.html',
  styleUrl: './book-appointment.component.scss'
})
export class BookAppointmentComponent implements OnInit {
  private api = inject(MockApiService);

  doctors$: Observable<any[]> | null = null;

  // Booking State
  currentStep = 1;
  selectedDoctor: any = null;
  selectedDate: Date = new Date();
  selectedTimeSlot: string | null = null;

  // Dummy slots for UI
  availableTimeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '11:00 AM',
    '01:00 PM', '01:30 PM', '03:00 PM', '04:30 PM'
  ];

  ngOnInit() {
    this.doctors$ = this.api.getDoctors();
  }

  selectDoctor(doc: any) {
    if (!doc.available) return;
    this.selectedDoctor = doc;
    this.currentStep = 2;
  }

  selectTimeSlot(slot: string) {
    this.selectedTimeSlot = slot;
  }

  confirmBooking() {
    if (this.selectedTimeSlot && this.selectedDoctor) {
      this.currentStep = 3;
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
}

