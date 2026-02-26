import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-patient-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class PatientRegisterComponent {
    private router = inject(Router);

    isLoading = false;
    showPassword = false;
    currentStep = 1; // 1 = personal, 2 = medical

    // Step 1 — Personal Info
    fullName = '';
    email = '';
    phone = '';
    dob = '';
    gender = '';
    address = '';

    // Step 2 — Medical / Account
    password = '';
    confirmPassword = '';
    condition = '';
    emergencyContact = '';
    agreeTerms = false;

    conditions = [
        'Back Pain', 'Knee Injury', 'Shoulder Pain', 'Neck Pain',
        'Sports Injury', 'Post Surgery', 'Frozen Shoulder', 'Arthritis',
        'Sciatica', 'Stroke Rehab', 'Other'
    ];

    genders = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

    get passwordsMatch(): boolean {
        return this.password === this.confirmPassword;
    }

    get step1Valid(): boolean {
        return !!(this.fullName && this.email && this.phone && this.dob && this.gender);
    }

    get step2Valid(): boolean {
        return !!(this.password && this.passwordsMatch && this.agreeTerms);
    }

    togglePassword() {
        this.showPassword = !this.showPassword;
    }

    nextStep() {
        if (this.step1Valid) {
            this.currentStep = 2;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    prevStep() {
        this.currentStep = 1;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    register() {
        if (!this.step2Valid) return;
        this.isLoading = true;
        // Simulate registration delay, then redirect to book appointment
        setTimeout(() => {
            this.isLoading = false;
            this.router.navigate(['/patient/book-appointment']);
        }, 1200);
    }
}
