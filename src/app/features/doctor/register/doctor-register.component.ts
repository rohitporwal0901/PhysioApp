import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { ImageUploadService } from '../../../core/services/image-upload.service';
import { PaymentService } from '../../../core/services/payment.service';
import { SpecializationService } from '../../../core/services/specialization.service';
import { OnInit } from '@angular/core';

@Component({
    selector: 'app-doctor-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
    templateUrl: './doctor-register.component.html',
    styleUrl: './doctor-register.component.scss'
})
export class DoctorRegisterComponent implements OnInit {
    private router = inject(Router);
    private authService = inject(AuthService);
    private imageUpload = inject(ImageUploadService);
    private paymentService = inject(PaymentService);
    private specializationService = inject(SpecializationService);

    ngOnInit() {
        this.specializationService.getSpecialties().subscribe(data => {
            this.dynamicSpecialties = data;
        });
    }

    isLoading = false;
    showPassword = false;
    currentStep = 1;
    totalSteps = 6;
    errorMessage = '';
    submitAttempted = false;

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

    // Step 4 — Fees & Availability
    consultationFee = '';
    followUpFee = '';
    consultationType = 'in-person';
    availableDays: string[] = [];
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Step 5 — Documents & Account
    password = '';
    confirmPassword = '';
    agreeTerms = false;
    profilePhotoName = '';
    profilePhotoUrl = '';
    isUploadingPhoto = false;
    certificateName = '';
    idProofName = '';

    // Step 6 - Subscription
    selectedPlan: any = null;
    plans = [
      {
        type: 'monthly',
        name: 'Monthly Plan',
        price: 499,
        durationMonths: 1,
        features: [
          'Digital Patient Records',
          'Appointment Scheduling',
          'Revenue Tracking',
          'Email/SMS Notifications',
          'Standard Support'
        ],
        recommended: false
      },
      {
        type: 'halfYearly',
        name: 'Half-Yearly Plan',
        price: 2499,
        durationMonths: 6,
        features: [
          'All Monthly Features',
          'Priority Support',
          'Detailed Analytics',
          'Customized Clinic Reports',
          '15% Discount on Yearly'
        ],
        recommended: true
      },
      {
        type: 'yearly',
        name: 'Yearly Plan',
        price: 4499,
        durationMonths: 12,
        features: [
          'All Half-Yearly Features',
          'Dedicated Account Manager',
          'Advanced Marketing Tools',
          'Custom Branding',
          '2 Months FREE'
        ],
        recommended: false
      }
    ];

    genders = ['Male', 'Female', 'Other'];
    states = [
        'Andhra Pradesh', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan',
        'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
    ];
    qualifications = [
        'MBBS', 'MD', 'MS', 'BDS', 'MDS', 'BAMS', 'BHMS', 'BPT', 'MPT', 'DNB', 'DM', 'MCh', 'PhD', 'DCH', 'DGO'
    ];

    dynamicSpecialties: any[] = [];

    sidebarSteps = [
        { num: 1, label: 'Basic Information', icon: 'user' },
        { num: 2, label: 'Contact Details', icon: 'phone' },
        { num: 3, label: 'Qualifications', icon: 'graduation-cap' },
        { num: 4, label: 'Fees & Availability', icon: 'calendar' },
        { num: 5, label: 'Account & Documents', icon: 'shield-check' },
        { num: 6, label: 'Subscription Plan', icon: 'credit-card' },
    ];

    get passwordsMatch(): boolean {
        return this.password === this.confirmPassword;
    }

    get isEmailValid(): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(this.email);
    }
    get isPhoneValid(): boolean {
        const phoneRegex = /^\+?[0-9]{10,14}$/;
        return phoneRegex.test(this.phone.replace(/\s/g, ''));
    }

    get step1Valid(): boolean {
        return !!(this.fullName && this.gender && this.dob);
    }
    get step2Valid(): boolean {
        return !!(this.email && this.isEmailValid && this.phone && this.isPhoneValid);
    }
    get step3Valid(): boolean {
        return !!(this.qualification && this.specialization && this.experience);
    }
    get step4Valid(): boolean {
        return !!(this.consultationFee);
    }
    get step5Valid(): boolean {
        return !!(this.password && this.password.length >= 6 && this.passwordsMatch && this.agreeTerms);
    }
    get step6Valid(): boolean {
        return !!this.selectedPlan;
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
            this.submitAttempted = false;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    nextStep() {
        this.submitAttempted = true;
        if (this.currentStep < this.totalSteps && this.currentStepValid) {
            this.currentStep++;
            this.submitAttempted = false;
            this.errorMessage = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.submitAttempted = false;
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

    selectPlan(plan: any) {
        this.selectedPlan = plan;
    }

    async register() {
        this.submitAttempted = true;
        if (!this.step6Valid || !this.step5Valid) return;
        this.isLoading = true;
        this.errorMessage = '';

        try {
            // 1. Create Order (Mock)
            const order = await this.paymentService.createOrder(this.selectedPlan.type, this.selectedPlan.price);
            
            // 2. Mock Payment Processing
            const paymentSuccess = await this.paymentService.verifyPayment(order.orderId, { status: 'success' });
            
            if (!paymentSuccess) {
                this.errorMessage = 'Payment failed. Please try again.';
                this.isLoading = false;
                return;
            }

            // 3. Register User only after payment success
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
                consultationFee: this.consultationFee,
                followUpFee: this.followUpFee,
                consultationType: this.consultationType,
                availableDays: this.availableDays,
                image: this.profilePhotoUrl
            });

            if (result.success) {
                // 4. Save Transaction & Update Subscription in profile
                const currentUser = this.authService.currentUser;
                if (currentUser) {
                    const expiryDate = this.paymentService.calculateExpiryDate(this.selectedPlan.type);
                    
                    // Save to transactions collection
                    await this.paymentService.saveTransaction({
                        userId: currentUser.uid,
                        userType: 'doctor',
                        planType: this.selectedPlan.type,
                        amount: this.selectedPlan.price,
                        paymentStatus: 'success',
                        txnId: `txn_mock_${Date.now()}`,
                        expiryDate: expiryDate
                    });

                    // Update User Profile with subscription info
                    await this.authService.updateProfile(currentUser.uid, {
                        subscription: {
                            plan: this.selectedPlan.type,
                            startDate: new Date(),
                            expiryDate: expiryDate,
                            status: 'active'
                        }
                    });

                    this.router.navigate(['/doctor/dashboard']);
                }
            } else {
                this.errorMessage = result.error ?? 'Registration failed. Please try again.';
            }
        } catch (err: any) {
            this.errorMessage = 'An unexpected error occurred: ' + err.message;
        } finally {
            this.isLoading = false;
        }
    }
}
