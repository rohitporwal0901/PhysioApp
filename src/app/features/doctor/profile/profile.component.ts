import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { ImageUploadService } from '../../../core/services/image-upload.service';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private api = inject(MockApiService);
  private fb = inject(FormBuilder);
  private imageUpload = inject(ImageUploadService);

  user: any;
  isEditModalOpen = false;
  isUpdating = false;
  isUploadingImage = false;
  profileForm!: FormGroup;

  ngOnInit() {
    this.user = this.auth.currentUser;
    this.initForm();
  }

  private initForm() {
    this.profileForm = this.fb.group({
      fullName: [this.user?.fullName || '', Validators.required],
      phone: [this.user?.phone || '', Validators.required],
      specialization: [this.user?.specialization || ''],
      qualification: [this.user?.qualification || ''],
      experience: [this.user?.experience || 0],
      consultationFee: [this.user?.consultationFee || 0],
      followUpFee: [this.user?.followUpFee || 0],
      address: [this.user?.address || ''],
      gender: [this.user?.gender || 'Male'],
      city: [this.user?.city || ''],
      state: [this.user?.state || '']
    });
  }

  toggleEditModal() {
    this.isEditModalOpen = !this.isEditModalOpen;
    if (this.isEditModalOpen) {
      this.initForm();
    }
  }

  onUpdateProfile() {
    if (this.profileForm.invalid) return;

    this.isUpdating = true;
    
    // Actual API call
    this.auth.updateProfile(this.user.uid, this.profileForm.value).then(res => {
      if (res.success) {
        this.user = { ...this.user, ...this.profileForm.value };
        this.isUpdating = false;
        this.isEditModalOpen = false;
        console.log('Profile updated successfully!');
      } else {
        this.isUpdating = false;
        alert('Error updating profile: ' + res.error);
      }
    });
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate
    const validation = this.imageUpload.validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    this.isUploadingImage = true;
    try {
      // 1. Upload to Firebase Storage
      const path = `profiles/doctors/${this.user.uid}_${Date.now()}`;
      const publicUrl = await this.imageUpload.uploadImage(file, path);
      
      // 2. Update Firestore profile with new public URL
      const updateRes = await this.auth.updateProfile(this.user.uid, { image: publicUrl });
      
      if (updateRes.success) {
        this.user = { ...this.user, image: publicUrl };
        console.log('Profile image updated via Cloudflare R2');
      } else {
        alert('Failed to update profile image: ' + updateRes.error);
      }
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      this.isUploadingImage = false;
    }
  }
}
