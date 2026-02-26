import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-doctor-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
    templateUrl: './doctor-register.component.html',
    styleUrl: './doctor-register.component.scss'
})
export class DoctorRegisterComponent {
    private router = inject(Router);

    isLoading = false;
    showPassword = false;
    currentStep = 1;
    totalSteps = 6;

    // Step 1 — Basic Info
    fullName = '';
    gender = '';
    dob = '';
    nationality = 'Indian';
    state = '';

    // Step 2 — Contact Info
    email = '';
    phone = '';
    altPhone = '';
    address = '';
    city = '';
    pincode = '';

    // Step 3 — Qualifications
    qualification = '';
    specialization = '';
    experience = '';
    registrationNumber = '';
    council = '';

    // Step 4 — Areas of Interest
    selectedAreas: string[] = [];
    areasOfInterest = [
        'Sports Rehabilitation', 'Orthopaedic Physiotherapy', 'Neurological Rehab',
        'Cardiopulmonary Therapy', 'Paediatric Physiotherapy', 'Geriatric Care',
        'Manual Therapy', 'Post-Surgical Recovery', 'Women\'s Health',
        'Pain Management', 'Exercise Therapy', 'Electrotherapy'
    ];

    // Step 5 — Fees & Availability
    consultationFee = '';
    followUpFee = '';
    consultationType = 'in-person';
    availableDays: string[] = [];
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Step 6 — Documents & Account
    password = '';
    confirmPassword = '';
    agreeTerms = false;
    profilePhotoName = '';
    certificateName = '';
    idProofName = '';

    genders = ['Male', 'Female', 'Other'];
    states = [
        'Andhra Pradesh', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan',
        'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
    ];
    qualifications = [
        'BPT (Bachelor of Physiotherapy)',
        'MPT (Master of Physiotherapy)',
        'DPT (Doctor of Physiotherapy)',
        'PhD in Physiotherapy',
        'Diploma in Physiotherapy'
    ];

    sidebarSteps = [
        { num: 1, label: 'Basic Information', icon: 'user' },
        { num: 2, label: 'Contact Details', icon: 'phone' },
        { num: 3, label: 'Qualifications', icon: 'graduation-cap' },
        { num: 4, label: 'Areas of Interest', icon: 'heart-pulse' },
        { num: 5, label: 'Fees & Availability', icon: 'calendar' },
        { num: 6, label: 'Account & Documents', icon: 'shield-check' },
    ];

    get passwordsMatch(): boolean {
        return this.password === this.confirmPassword;
    }

    get step1Valid(): boolean {
        return !!(this.fullName && this.gender && this.dob);
    }

    get step2Valid(): boolean {
        return !!(this.email && this.phone);
    }

    get step3Valid(): boolean {
        return !!(this.qualification && this.specialization && this.experience);
    }

    get step4Valid(): boolean {
        return this.selectedAreas.length > 0;
    }

    get step5Valid(): boolean {
        return !!(this.consultationFee);
    }

    get step6Valid(): boolean {
        return !!(this.password && this.passwordsMatch && this.agreeTerms);
    }

    get currentStepValid(): boolean {
        switch (this.currentStep) {
            case 1: return this.step1Valid;
            case 2: return this.step2Valid;
            case 3: return this.step3Valid;
            case 4: return this.step4Valid;
            case 5: return this.step5Valid;
            case 6: return this.step6Valid;
            default: return false;
        }
    }

    toggleArea(area: string) {
        const idx = this.selectedAreas.indexOf(area);
        if (idx > -1) {
            this.selectedAreas.splice(idx, 1);
        } else {
            this.selectedAreas.push(area);
        }
    }

    toggleDay(day: string) {
        const idx = this.availableDays.indexOf(day);
        if (idx > -1) {
            this.availableDays.splice(idx, 1);
        } else {
            this.availableDays.push(day);
        }
    }

    togglePassword() {
        this.showPassword = !this.showPassword;
    }

    goToStep(step: number) {
        if (step <= this.currentStep) {
            this.currentStep = step;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    nextStep() {
        if (this.currentStep < this.totalSteps && this.currentStepValid) {
            this.currentStep++;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // Simulated file pick
    onFileSelect(type: 'photo' | 'certificate' | 'id', event: any) {
        const file = event?.target?.files?.[0];
        if (file) {
            if (type === 'photo') this.profilePhotoName = file.name;
            if (type === 'certificate') this.certificateName = file.name;
            if (type === 'id') this.idProofName = file.name;
        }
    }

    register() {
        if (!this.step6Valid) return;
        this.isLoading = true;
        setTimeout(() => {
            this.isLoading = false;
            this.router.navigate(['/doctor/dashboard']);
        }, 1500);
    }
}
