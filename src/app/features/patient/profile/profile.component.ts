import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService, AppUser } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

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

  user: any = null;
  isEditModalOpen = false;
  profileForm!: FormGroup;
  isUpdating = false;

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
}
