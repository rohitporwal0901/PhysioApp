import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { ImageUploadService } from '../../../core/services/image-upload.service';

@Component({
  selector: 'app-patient-register',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class PatientRegisterComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private imageUpload = inject(ImageUploadService);

  // Form Fields
  fullName = '';
  email = '';
  phone = '';
  dob = '';
  gender = '';
  address = '';
  condition = '';
  emergencyContact = '';
  password = '';
  confirmPassword = '';
  agreeTerms = false;
  
  // Profile Photo
  profilePhotoUrl: string = '';
  isUploadingPhoto: boolean = false;

  // UI States
  currentStep = 1;
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  submitAttempted = false;

  // Options
  genders = ['Male', 'Female', 'Other'];
  conditions = [
    'Back Pain', 'Neck Pain', 'Shoulder Injury', 
    'Knee Pain', 'Sports Injury', 'Post-Surgery Recovery',
    'Arthritis', 'Neurological Condition', 'General Wellness'
  ];

  ngOnInit() {
    // Check for doctor context
    this.route.queryParams.subscribe(params => {
      if (params['dr']) {
        // Can be used to auto-assign doctor after registration
      }
    });
  }

  get isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  get isPhoneValid(): boolean {
    const phoneRegex = /^\+?[0-9]{10,14}$/;
    return phoneRegex.test(this.phone.replace(/\s/g, ''));
  }

  get isEmergencyPhoneValid(): boolean {
    if (!this.emergencyContact) return true;
    const phoneRegex = /^\+?[0-9]{10,14}$/;
    return phoneRegex.test(this.emergencyContact.replace(/\s/g, ''));
  }

  get step1Valid(): boolean {
    return !!(
      this.fullName && 
      this.isEmailValid && 
      this.isPhoneValid && 
      this.dob && 
      this.gender
    );
  }

  get step2Valid(): boolean {
    return !!(this.password && this.confirmPassword && this.passwordsMatch && this.agreeTerms);
  }

  get passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
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
      const path = `profiles/patients/temp_${Date.now()}`;
      this.profilePhotoUrl = await this.imageUpload.uploadImage(file, path);
    } catch (err: any) {
      alert('Photo upload failed: ' + err.message);
    } finally {
      this.isUploadingPhoto = false;
    }
  }

  nextStep() {
    this.submitAttempted = true;
    if (this.step1Valid) {
        this.currentStep = 2;
        this.submitAttempted = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep() {
    this.currentStep = 1;
    this.submitAttempted = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async register() {
    this.submitAttempted = true;
    if (!this.step2Valid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const patientData = {
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      dob: this.dob,
      gender: this.gender,
      address: this.address,
      condition: this.condition,
      emergencyContact: this.emergencyContact,
      image: this.profilePhotoUrl,
      password: this.password, // Include password here
      role: 'patient',
      createdAt: new Date().toISOString()
    };

    try {
      const res = await this.auth.registerPatient(patientData);
      if (res.success) {
        this.router.navigate(['/patient/dashboard']);
      } else {
        this.errorMessage = res.error || 'Registration failed';
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'An unexpected error occurred';
    } finally {
      this.isLoading = false;
    }
  }
}
