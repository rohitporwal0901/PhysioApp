import { Component, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { ImageUploadService } from '../../../core/services/image-upload.service';
import { PaymentService } from '../../../core/services/payment.service';

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
    showPassword = false;
    currentStep = 1;
    totalSteps = 5;
    errorMessage = '';
    submitAttempted = false;

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

    // Step 5 - Subscription
    selectedPlan: any = null;
    plans = [
        {
            type: 'monthly',
            name: 'Monthly Plan',
            price: 999, // Labs might have different pricing or same
            durationMonths: 1,
            features: [
                'Digital Lab Records',
                'Test Report Management',
                'Automated Email Delivery',
                'Revenue Tracking',
                'Standard Support'
            ],
            recommended: false
        },
        {
            type: 'halfYearly',
            name: 'Half-Yearly Plan',
            price: 4999,
            durationMonths: 6,
            features: [
                'All Monthly Features',
                'Priority Support',
                'Bulk Result Upload',
                'Detailed Analytics',
                '15% Savings'
            ],
            recommended: true
        },
        {
            type: 'yearly',
            name: 'Yearly Plan',
            price: 8999,
            durationMonths: 12,
            features: [
                'All Half-Yearly Features',
                'Dedicated Account Manager',
                'API Access',
                'Custom Branding',
                '2 Months FREE'
            ],
            recommended: false
        }
    ];

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
        return !!(this.fullName && this.labName);
    }
    get step2Valid(): boolean {
        return !!(this.email && this.isEmailValid && this.phone && this.isPhoneValid && this.address && this.city);
    }
    get step3Valid(): boolean {
        return !!(this.licenseNumber);
    }
    get step4Valid(): boolean {
        return !!(this.password && this.password.length >= 6 && this.passwordsMatch && this.agreeTerms);
    }
    get step5Valid(): boolean {
        return !!this.selectedPlan;
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

    selectPlan(plan: any) {
        this.selectedPlan = plan;
    }

    async register() {
        this.submitAttempted = true;
        if (!this.step4Valid || !this.step5Valid) return;

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

            // 3. Register user after payment success
            const result = await this.authService.registerLab({
                email: this.email,
                password: this.password,
                fullName: this.fullName,
                labName: this.labName,
                phone: this.phone,
                address: this.address,
                city: this.city,
                state: this.state,
                testPdfUrl: this.testsPdfUrl,
                licenseNumber: this.licenseNumber,
                subscriptionPlan: this.selectedPlan.type,
                paymentStatus: 'completed'
            });

            if (result.success) {
                const currentUser = this.authService.currentUser;
                if (currentUser) {
                    const expiryDate = this.paymentService.calculateExpiryDate(this.selectedPlan.type);

                    // Save transaction
                    await this.paymentService.saveTransaction({
                        userId: currentUser.uid,
                        userType: 'lab',
                        planType: this.selectedPlan.type,
                        amount: this.selectedPlan.price,
                        paymentStatus: 'success',
                        txnId: `txn_mock_${Date.now()}`,
                        expiryDate: expiryDate
                    });

                    // Update User Profile
                    await this.authService.updateProfile(currentUser.uid, {
                        subscription: {
                            plan: this.selectedPlan.type,
                            startDate: new Date(),
                            expiryDate: expiryDate,
                            status: 'active'
                        }
                    });

                    this.router.navigate(['/lab/dashboard']);
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
