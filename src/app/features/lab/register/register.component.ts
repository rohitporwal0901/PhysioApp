import { Component, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { ImageUploadService } from '../../../core/services/image-upload.service';

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

    isLoading = false;
    showPassword = false;
    currentStep = 1;
    totalSteps = 5;
    errorMessage = '';

    // Step 1 - Basic Info
    fullName = '';
    labName = '';

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

    // Step 5 - Subscription
    subscriptionPlan = 'monthly';
    paymentStatus = 'pending';
    showRazorpayModal = false;

    states = [
        'Andhra Pradesh', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan',
        'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
    ];

    sidebarSteps = [
        { num: 1, label: 'Basic Info', icon: 'building' },
        { num: 2, label: 'Contact', icon: 'map-pin' },
        { num: 3, label: 'Documents', icon: 'file-text' },
        { num: 4, label: 'Account', icon: 'lock' },
        { num: 5, label: 'Subscription', icon: 'credit-card' }
    ];

    get subscriptionAmount(): number {
        switch (this.subscriptionPlan) {
            case 'monthly': return 1999;
            case 'half-yearly': return 9999;
            case 'yearly': return 17999;
            default: return 1999;
        }
    }

    get passwordsMatch(): boolean {
        return this.password === this.confirmPassword;
    }

    get step1Valid(): boolean {
        return !!(this.fullName && this.labName);
    }
    get step2Valid(): boolean {
        return !!(this.email && this.phone && this.address && this.city);
    }
    get step3Valid(): boolean {
        return !!(this.licenseNumber);
    }
    get step4Valid(): boolean {
        return !!(this.password && this.password.length >= 6 && this.passwordsMatch && this.agreeTerms);
    }
    get step5Valid(): boolean {
        return !!this.subscriptionPlan;
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
        if (!this.step5Valid) return;
        this.showRazorpayModal = true;
    }

    onPaymentClosed() {
        this.showRazorpayModal = false;
        this.isLoading = false;
    }

    async onPaymentSuccess(txnId: string) {
        this.showRazorpayModal = false;
        this.paymentStatus = 'completed';
        this.isLoading = true;
        this.errorMessage = '';

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
            subscriptionPlan: this.subscriptionPlan,
            paymentStatus: this.paymentStatus
        } as any);

        this.isLoading = false;

        if (result.success) {
            this.router.navigate(['/lab/dashboard']);
        } else {
            this.errorMessage = result.error ?? 'Registration failed. Please try again.';
        }
    }
}
