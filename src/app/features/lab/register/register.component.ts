import { Component, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { ImageUploadService } from '../../../core/services/image-upload.service';
import { PaymentService, SubscriptionPlan } from '../../../core/services/payment.service';

@Component({
    selector: 'app-lab-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class LabRegisterComponent {
    private router = inject(Router);
    private authService = inject(AuthService);
    private fileUploadService = inject(ImageUploadService);
    private paymentService = inject(PaymentService);

    isLoading = false;
    isProcessingPayment = false;
    showPassword = false;
    currentStep = 1;
    totalSteps = 5;
    errorMessage = '';
    submitAttempted = false;

    // Step 1 - Subscription Plan
    selectedPlan: SubscriptionPlan | null = null;
    plans = this.paymentService.plans;

    // Step 1 - Basic Info
    fullName = '';
    labName = '';
    profilePhotoUrl = '';
    isUploadingPhoto = false;

    // Step 2 - Contact 
    email = '';
    phone = '';
    address = '';
    city = '';
    state = '';

    // Step 3 - Documents
    licenseNumber = '';
    testsPdfName = '';
    testsPdfUrl = '';
    isUploadingDoc = false;

    // Step 4 - Account
    password = '';
    confirmPassword = '';
    agreeTerms = false;

    states = [
        'Andhra Pradesh', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan',
        'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
    ];

    sidebarSteps = [
        { num: 1, label: 'Subscription Plan', icon: 'credit-card' },
        { num: 2, label: 'Basic Info', icon: 'building' },
        { num: 3, label: 'Contact', icon: 'map-pin' },
        { num: 4, label: 'Documents', icon: 'file-text' },
        { num: 5, label: 'Account', icon: 'lock' }
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
        return !!this.selectedPlan;
    }
    get step2Valid(): boolean {
        return !!(this.fullName && this.labName);
    }
    get step3Valid(): boolean {
        return !!(this.email && this.isEmailValid && this.phone && this.isPhoneValid && this.address && this.city);
    }
    get step4Valid(): boolean {
        return !!(this.licenseNumber);
    }
    get step5Valid(): boolean {
        return !!(this.password && this.password.length >= 6 && this.passwordsMatch && this.agreeTerms);
    }
    get currentStepValid(): boolean {
        switch (this.currentStep) {
            case 1: return this.step1Valid;
            case 2: return this.step2Valid;
            case 3: return this.step3Valid;
            case 4: return this.step4Valid;
            case 5: return this.step5Valid;
            default: return false;
        }
    }

    selectPlan(plan: SubscriptionPlan) {
        this.selectedPlan = plan;
        this.nextStep();
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

    async onPhotoSelected(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        const validation = this.fileUploadService.validateFile(file);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        this.isUploadingPhoto = true;
        try {
            const path = `profiles/labs/temp_${Date.now()}`;
            this.profilePhotoUrl = await this.fileUploadService.uploadImage(file, path);
        } catch (err: any) {
            alert('Photo upload failed: ' + err.message);
        } finally {
            this.isUploadingPhoto = false;
        }
    }

    async onPdfSelected(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        const validation = this.fileUploadService.validateDocument(file);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        this.isUploadingDoc = true;
        try {
            const path = `documents/labs/temp_${Date.now()}_${file.name}`;
            this.testsPdfUrl = await this.fileUploadService.uploadDocument(file, path);
            this.testsPdfName = file.name;
        } catch (err: any) {
            alert('Document upload failed: ' + err.message);
        } finally {
            this.isUploadingDoc = false;
        }
    }

    async register() {
        this.submitAttempted = true;
        if (!this.step5Valid || !this.selectedPlan) return;

        this.isProcessingPayment = true;
        this.errorMessage = '';

        try {
            // STEP 1: Process Payment
            const paymentResult = await this.paymentService.processPayment(this.selectedPlan, {
                fullName: this.fullName,
                email: this.email,
                phone: this.phone
            });

            if (paymentResult.status !== 'success') {
                throw new Error('Payment was not completed.');
            }

            // STEP 2: Finalize Registration
            this.isLoading = true;
            const result = await this.authService.registerLab({
                email: this.email,
                password: this.password,
                fullName: this.fullName,
                labName: this.labName,
                phone: this.phone,
                address: this.address,
                city: this.city,
                state: this.state,
                testsPdfUrl: this.testsPdfUrl,
                licenseNumber: this.licenseNumber,
                image: this.profilePhotoUrl,
                subscriptionPlan: this.selectedPlan.id,
                paymentStatus: 'completed'
            } as any);

            if (result.success && this.authService.currentUser?.uid) {
                // STEP 3: Save Transaction History
                await this.paymentService.saveTransaction(
                    paymentResult, 
                    this.authService.currentUser.uid, 
                    this.selectedPlan,
                    { fullName: this.fullName, email: this.email },
                    'lab'
                );
                this.router.navigate(['/lab/dashboard']);
            } else {
                throw new Error(result.error ?? 'Registration failed.');
            }

        } catch (err: any) {
            this.errorMessage = err.message || 'An error occurred during payment/registration.';
        } finally {
            this.isLoading = false;
            this.isProcessingPayment = false;
        }
    }
}
