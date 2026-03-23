import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { MockApiService } from '../../core/services/mock-api.service';
import { BookingService } from '../../core/services/booking.service';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

import { ToastService } from '../../core/services/toast.service';

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
    private toast = inject(ToastService);

    doctor: any = null;
    activeTab: 'profile' | 'book' = 'profile';
    isProcessing = false;

    // Booking form
    selectedDate = new Date().toISOString().split('T')[0];
    private prevDate: string = this.selectedDate;
    selectedSlot = '';
    bookingConfirmed = false;
    bookedSlots: string[] = [];
    bookingError = '';
    patientNotes = '';

    availableSlots = [
       '09:00 AM', '09:45 AM', '10:30 AM', '11:15 AM',
    '12:00 PM', '02:00 PM', '02:45 PM', '03:30 PM',
    '04:15 PM', '05:00 PM'
    ];

    selectedConsultationType = '';

    // Unsplash doctor profile image collection
    private doctorImages = [
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop'
    ];

    ngOnInit() {
        // Try to get doctor from navigation state
        const nav = this.router.getCurrentNavigation();
        const state = nav?.extras?.state as { doctor: any };
        if (state?.doctor) {
            this.doctor = state.doctor;
            this.setDefaultConsultationType();
        } else {
            // Fallback: load from service using route param
            const docId = this.route.snapshot.paramMap.get('id');
            this.api.getDoctors().subscribe(docs => {
                this.doctor = docs.find(d => d.id === docId) || docs[0];
                this.setDefaultConsultationType();
            });
        }
        
        this.route.queryParams.subscribe(params => {
            if (params['tab'] === 'book') {
                if (this.isPatientRegistered) {
                    this.activeTab = 'book';
                    this.onDateChange();
                }
            }
        });
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
                const currentUrl = this.router.url.split('?')[0]; // strip existing query params if any
                this.router.navigate(['/login'], { 
                    queryParams: { returnUrl: `${currentUrl}?tab=book` } 
                });
            }
        }
    }

    /** When date changes, reload booked slots for that date */
    async onDateChange() {
        // Prevent clearing: if value is emptied (Clear button clicked), restore on next tick
        if (!this.selectedDate) {
            setTimeout(() => { this.selectedDate = this.prevDate; }, 0);
            return;
        }
        this.prevDate = this.selectedDate;
        if (this.doctor && this.selectedDate) {
            this.bookedSlots = await this.bookingService.getBookedSlotsForDoctor(this.doctor.id, this.selectedDate);
            // If the selected slot is now booked, deselect it
            if (this.bookedSlots.includes(this.selectedSlot)) {
                this.selectedSlot = '';
            }
        }
    }

    /** Check if a slot is already booked or in the past */
    isSlotBooked(slot: string): boolean {
        return this.bookedSlots.includes(slot) || this.isSlotInPast(slot);
    }

    isSlotInPast(slot: string): boolean {
        // Only disable past slots if the selected date is today
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

    selectSlot(slot: string) {
        if (!this.isSlotBooked(slot)) {
            this.selectedSlot = slot;
        }
    }

    async confirmBooking() {
        if (this.selectedDate && this.selectedSlot && this.doctor) {
            if (!this.selectedConsultationType) {
                this.bookingError = 'Please select a consultation type.';
                return;
            }

            if (!this.patientNotes || this.patientNotes.trim().length < 10) {
                this.bookingError = 'Please describe your condition/complaint (min 10 characters).';
                return;
            }
            
            this.isProcessing = true;
            this.bookingError = '';

            const result = await this.bookingService.bookAppointment({
                doctorId: this.doctor.id,
                doctorName: this.doctor.fullName || this.doctor.name || 'Doctor',
                doctorSpecialty: this.doctor.specialization || this.doctor.specialty || 'Physiotherapist',
                doctorImage: this.doctor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.doctor.fullName || 'Doctor')}&background=0D8ABC&color=fff`,
                date: this.selectedDate,
                time: this.selectedSlot,
                type: this.selectedConsultationType || 'Consultation',
                notes: this.patientNotes
            });

            this.isProcessing = false;

            if (result.success) {
                this.toast.success('Your appointment has been requested!', 'Success');
                this.bookingConfirmed = true;
                this.bookingError = '';
                // Refresh booked slots
                this.bookedSlots = await this.bookingService.getBookedSlotsForDoctor(this.doctor.id, this.selectedDate);
            } else {
                this.bookingError = result.error || 'This slot is already booked or you are not registered.';
                this.toast.error(this.bookingError, 'Booking Failed');
            }
        }
    }

    bookAnotherSlot() {
        this.bookingConfirmed = false;
        this.selectedSlot = '';
        this.bookingError = '';
        this.setDefaultConsultationType();
        this.onDateChange();
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

    getDoctorImage(): string {
        if (!this.doctor) return '';
        if (this.doctor.image && !this.doctor.image.includes('ui-avatars.com')) {
            return this.doctor.image;
        }
        // Use a stable image based on the doctor's name length for consistency on this page
        const index = (this.doctor.fullName || this.doctor.name || '').length;
        return this.doctorImages[index % this.doctorImages.length];
    }

    encodeURIComponent(str: string): string {
        return encodeURIComponent(str);
    }

    private setDefaultConsultationType() {
        if (!this.doctor) return;
        
        const type = (this.doctor.consultationType || '').toLowerCase();
        if (type === 'online') {
            this.selectedConsultationType = 'Online';
        } else if (type === 'in person' || type === 'in-person') {
            this.selectedConsultationType = 'In Person';
        } else if (type === 'both') {
            this.selectedConsultationType = 'In Person';
        } else {
            // Fallback for missing or other types
            this.selectedConsultationType = 'In Person';
        }
    }
}
