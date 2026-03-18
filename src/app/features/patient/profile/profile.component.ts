import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService, AppUser } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ImageUploadService } from '../../../core/services/image-upload.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private imageUpload = inject(ImageUploadService);

  user: any = null;
  isEditModalOpen = false;
  profileForm!: FormGroup;
  isUpdating = false;
  isUploadingImage = false;

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        this.initForm(user);
      }
    });
  }

  initForm(user: any) {
    this.profileForm = this.fb.group({
      fullName: [user.fullName || '', [Validators.required]],
      phone: [user.phone || '', [Validators.required]],
      emergencyContact: [user.emergencyContact || ''],
      address: [user.address || ''],
      condition: [user.condition || ''],
      gender: [user.gender || 'Male'],
      dob: [user.dob || '']
    });
  }

  toggleEditModal() {
    this.isEditModalOpen = !this.isEditModalOpen;
    if (this.isEditModalOpen && this.user) {
      this.initForm(this.user);
    }
  }

  async onUpdateProfile() {
    if (this.profileForm.invalid) return;

    this.isUpdating = true;
    const result = await this.authService.updateProfile(this.user.uid, this.profileForm.value);
    this.isUpdating = false;

    if (result.success) {
      this.toastService.success('Profile updated successfully!');
      this.isEditModalOpen = false;
    } else {
      this.toastService.error(result.error || 'Failed to update profile');
    }
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate
    const validation = this.imageUpload.validateFile(file);
    if (!validation.valid) {
      this.toastService.error(validation.error || 'Invalid file');
      return;
    }

    this.isUploadingImage = true;
    try {
      // 1. Upload to Firebase Storage
      const path = `profiles/patients/${this.user.uid}_${Date.now()}`;
      const publicUrl = await this.imageUpload.uploadImage(file, path);
      
      // 2. Update Firestore profile with new public URL
      const updateRes = await this.authService.updateProfile(this.user.uid, { image: publicUrl });
      
      if (updateRes.success) {
        this.user = { ...this.user, image: publicUrl };
        this.toastService.success('Profile image updated!');
      } else {
        this.toastService.error('Update failed: ' + updateRes.error);
      }
    } catch (err: any) {
      this.toastService.error('Upload failed: ' + err.message);
    } finally {
      this.isUploadingImage = false;
    }
  }
}
