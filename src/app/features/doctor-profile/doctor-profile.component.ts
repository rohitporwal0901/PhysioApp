import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { MockApiService } from '../../core/services/mock-api.service';
import { Observable } from 'rxjs';

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

    doctor: any = null;
    activeTab: 'profile' | 'register' | 'book' = 'profile';

    // Registration form
    regForm = {
        name: '',
        email: '',
        phone: '',
        dob: '',
        password: '',
        confirmPassword: ''
    };

    // Booking form
    selectedDate = '';
    selectedSlot = '';
    bookingConfirmed = false;

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

    // Get doctor from window history state (when page is refreshed)
    get doctorFromState(): any {
        return history.state?.doctor;
    }

    register() {
        if (this.regForm.name && this.regForm.email && this.regForm.password) {
            this.activeTab = 'book';
        }
    }

    confirmBooking() {
        if (this.selectedDate && this.selectedSlot) {
            this.bookingConfirmed = true;
        }
    }

    goBack() {
        this.router.navigate(['/']);
    }

    get minDate(): string {
        return new Date().toISOString().split('T')[0];
    }
}
