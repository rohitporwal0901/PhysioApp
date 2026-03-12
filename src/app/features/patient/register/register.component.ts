import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-patient-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class PatientRegisterComponent {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private authService = inject(AuthService);

    isLoading = false;
    showPassword = false;
    showConfirmPassword = false;
    currentStep = 1; // 1 = personal, 2 = medical + account
    errorMessage = '';
    successMessage = '';

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

    // Doctor context (passed from doctor-profile page)
    private doctorId: string | null = null;

    conditions = [
        'Back Pain', 'Knee Injury', 'Shoulder Pain', 'Neck Pain',
        'Sports Injury', 'Post Surgery', 'Frozen Shoulder', 'Arthritis',
        'Sciatica', 'Stroke Rehab', 'Other'
    ];

    genders = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

    ngOnInit() {
        this.doctorId = this.route.snapshot.queryParamMap.get('doctorId');
    }

    get passwordsMatch(): boolean {
        return this.password === this.confirmPassword;
    }

    get step1Valid(): boolean {
        return !!(this.fullName && this.email && this.phone && this.dob && this.gender);
    }

    get step2Valid(): boolean {
        return !!(this.password && this.password.length >= 6 && this.passwordsMatch && this.agreeTerms);
    }

    togglePassword() { this.showPassword = !this.showPassword; }
    toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

    nextStep() {
        if (this.step1Valid) {
            this.currentStep = 2;
            this.errorMessage = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    prevStep() {
        this.currentStep = 1;
        this.errorMessage = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async register() {
        if (!this.step2Valid) return;
        this.isLoading = true;
        this.errorMessage = '';

        const result = await this.authService.registerPatient({
            email: this.email,
            password: this.password,
            fullName: this.fullName,
            phone: this.phone,
            dob: this.dob,
            gender: this.gender,
            address: this.address,
            condition: this.condition,
            emergencyContact: this.emergencyContact
        });

        this.isLoading = false;

        if (result.success) {
            if (this.doctorId) {
                this.router.navigate(['/doctor-profile', this.doctorId], { queryParams: { tab: 'book' } });
            } else {
                this.router.navigate(['/patient/dashboard']);
            }
        } else {
            this.errorMessage = result.error ?? 'Registration failed. Please try again.';
        }
    }
}
