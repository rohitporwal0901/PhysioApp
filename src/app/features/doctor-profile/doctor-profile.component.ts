import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { MockApiService } from '../../core/services/mock-api.service';
import { BookingService } from '../../core/services/booking.service';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-doctor-profile',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
    templateUrl: './doctor-profile.component.html',
    styleUrl: './doctor-profile.component.scss'
})
export class DoctorProfileComponent implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private api = inject(MockApiService);
    private bookingService = inject(BookingService);
    private authService = inject(AuthService);

    doctor: any = null;
    activeTab: 'profile' | 'book' = 'profile';

    // Booking form
    selectedDate = new Date().toISOString().split('T')[0];
    selectedSlot = '';
    bookingConfirmed = false;
    bookedSlots: string[] = [];
    bookingError = '';

    availableSlots = [
        '09:00 AM', '09:45 AM', '10:30 AM', '11:15 AM',
        '12:00 PM', '02:00 PM', '02:45 PM', '03:30 PM',
        '04:15 PM', '05:00 PM'
    ];

    ngOnInit() {
        // Try to get doctor from navigation state
        const nav = this.router.getCurrentNavigation();
        const state = nav?.extras?.state as { doctor: any };
        if (state?.doctor) {
            this.doctor = state.doctor;
        } else {
            // Fallback: load from service using route param
            const docId = this.route.snapshot.paramMap.get('id');
            this.api.getDoctors().subscribe(docs => {
                this.doctor = docs.find(d => d.id === docId) || docs[0];
            });
        }
    }

    /** Check if the patient is registered */
    get isPatientRegistered(): boolean {
        return this.authService.isLoggedIn && this.authService.userRole === 'patient';
    }

    /** Get registered patient name */
    get patientName(): string {
        return this.bookingService.currentPatient?.fullName || '';
    }

    // Navigate to patient registration first, pass doctorId so it returns here
    goToPatientRegister() {
        this.router.navigate(['/patient/register'], {
            queryParams: { doctorId: this.doctor?.id }
        });
    }

    startBooking() {
        if (this.isPatientRegistered) {
            this.activeTab = 'book';
            this.bookingError = '';
            this.onDateChange();
        } else {
            // Not registered as a patient in current session
            if (this.authService.isLoggedIn) {
                // Logged in but not as a patient (Doctor or Admin)
                this.bookingError = `You are currently logged in as an ${this.authService.userRole}. Only patients can book appointments.`;
            } else {
                // Not logged in at all - "Already Registered? Book Slot" flow
                // Take them to login and then come back
                this.router.navigate(['/login'], { 
                    queryParams: { returnUrl: this.router.url } 
                });
            }
        }
    }

    /** When date changes, reload booked slots for that date */
    async onDateChange() {
        if (this.doctor && this.selectedDate) {
            this.bookedSlots = await this.bookingService.getBookedSlotsForDoctor(this.doctor.id, this.selectedDate);
            // If the selected slot is now booked, deselect it
            if (this.bookedSlots.includes(this.selectedSlot)) {
                this.selectedSlot = '';
            }
        }
    }

    /** Check if a slot is already booked */
    isSlotBooked(slot: string): boolean {
        return this.bookedSlots.includes(slot);
    }

    selectSlot(slot: string) {
        if (!this.isSlotBooked(slot)) {
            this.selectedSlot = slot;
        }
    }

    async confirmBooking() {
        if (this.selectedDate && this.selectedSlot && this.doctor) {
            const result = await this.bookingService.bookAppointment({
                doctorId: this.doctor.id,
                doctorName: this.doctor.fullName || this.doctor.name || 'Doctor',
                doctorSpecialty: this.doctor.specialization || this.doctor.specialty || 'Physiotherapist',
                doctorImage: this.doctor.image,
                date: this.selectedDate,
                time: this.selectedSlot,
                type: 'Consultation'
            });

            if (result.success) {
                this.bookingConfirmed = true;
                this.bookingError = '';
                // Refresh booked slots
                this.bookedSlots = await this.bookingService.getBookedSlotsForDoctor(this.doctor.id, this.selectedDate);
            } else {
                this.bookingError = result.error || 'This slot is already booked or you are not registered. Please try another slot.';
            }
        }
    }

    goToDashboard() {
        this.router.navigate(['/patient/dashboard']);
    }

    goToDoctorDashboard() {
        this.router.navigate(['/doctor/dashboard']);
    }

    goBack() {
        this.router.navigate(['/']);
    }

    get minDate(): string {
        return new Date().toISOString().split('T')[0];
    }
}
