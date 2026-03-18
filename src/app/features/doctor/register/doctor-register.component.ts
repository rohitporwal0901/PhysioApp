import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { ImageUploadService } from '../../../core/services/image-upload.service';

@Component({
    selector: 'app-doctor-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
    templateUrl: './doctor-register.component.html',
    styleUrl: './doctor-register.component.scss'
})
export class DoctorRegisterComponent {
    private router = inject(Router);
    private authService = inject(AuthService);
    private imageUpload = inject(ImageUploadService);

    isLoading = false;
    showPassword = false;
    currentStep = 1;
    totalSteps = 6;
    errorMessage = '';

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
    profilePhotoUrl = '';
    isUploadingPhoto = false;
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
        return !!(this.password && this.password.length >= 6 && this.passwordsMatch && this.agreeTerms);
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
        if (idx > -1) this.selectedAreas.splice(idx, 1);
        else this.selectedAreas.push(area);
    }

    toggleDay(day: string) {
        const idx = this.availableDays.indexOf(day);
        if (idx > -1) this.availableDays.splice(idx, 1);
        else this.availableDays.push(day);
    }

    togglePassword() {
        this.showPassword = !this.showPassword;
    }

    goToStep(step: number) {
        if (step < this.currentStep) {
            this.currentStep = step;
            this.errorMessage = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    nextStep() {
        if (this.currentStep < this.totalSteps && this.currentStepValid) {
            this.currentStep++;
            this.errorMessage = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.errorMessage = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    onFileSelect(type: 'photo' | 'certificate' | 'id', event: any) {
        const file = event?.target?.files?.[0];
        if (file) {
            if (type === 'certificate') this.certificateName = file.name;
            if (type === 'id') this.idProofName = file.name;
        }
    }

    async onPhotoSelected(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        const validation = this.imageUpload.validateFile(file);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        this.isUploadingPhoto = true;
        try {
            const path = `profiles/doctors/temp_${Date.now()}`;
            this.profilePhotoUrl = await this.imageUpload.uploadImage(file, path);
            this.profilePhotoName = file.name;
        } catch (err: any) {
            alert('Photo upload failed: ' + err.message);
        } finally {
            this.isUploadingPhoto = false;
        }
    }

    async register() {
        if (!this.step6Valid) return;
        this.isLoading = true;
        this.errorMessage = '';

        const result = await this.authService.registerDoctor({
            email: this.email,
            password: this.password,
            fullName: this.fullName,
            gender: this.gender,
            dob: this.dob,
            phone: this.phone,
            address: this.address,
            city: this.city,
            state: this.state,
            qualification: this.qualification,
            specialization: this.specialization,
            experience: this.experience,
            registrationNumber: this.registrationNumber,
            council: this.council,
            areasOfInterest: this.selectedAreas,
            consultationFee: this.consultationFee,
            followUpFee: this.followUpFee,
            consultationType: this.consultationType,
            availableDays: this.availableDays,
            image: this.profilePhotoUrl
        });

        this.isLoading = false;

        if (result.success) {
            this.router.navigate(['/doctor/dashboard']);
        } else {
            this.errorMessage = result.error ?? 'Registration failed. Please try again.';
        }
    }
}
