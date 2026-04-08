import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { SpecializationService, Specialty } from '../../../core/services/specialization.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-specialties',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './specialties.component.html',
  styleUrl: './specialties.component.scss'
})
export class AdminSpecialtiesComponent implements OnInit {
  private specialtyService = inject(SpecializationService);
  private toast = inject(ToastService);

  specialties: Specialty[] = [];
  isLoading = false;
  isSaving = false;

  // Form
  showForm = false;
  isEditing = false;
  currentId = '';
  formName = '';
  formIcon = 'stethoscope'; // Default icon

  availableIcons = [
    'stethoscope', 'activity', 'heart', 'brain', 'bone', 'baby', 'eye', 'smile',
    'user', 'users', 'microscope', 'clipboard-list', 'shield-check',
    'heart-pulse', 'dna', 'thermometer', 'ambulance', 'hospital', 'syringe'
  ];

  ngOnInit() {
    this.loadSpecialties();
  }

  loadSpecialties() {
    this.isLoading = true;
    this.specialtyService.getSpecialties().subscribe({
      next: (data) => {
        this.specialties = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.toast.error('Failed to load specialties');
        this.isLoading = false;
      }
    });
  }

  openAddForm() {
    this.isEditing = false;
    this.currentId = '';
    this.formName = '';
    this.formIcon = 'stethoscope';
    this.showForm = true;
  }

  editSpecialty(s: Specialty) {
    this.isEditing = true;
    this.currentId = s.id!;
    this.formName = s.name;
    this.formIcon = s.icon;
    this.showForm = true;
  }

  async saveSpecialty() {
    if (!this.formName.trim()) {
      this.toast.error('Name is required');
      return;
    }

    const confirmMsg = this.isEditing ? 'Are you sure you want to update this specialty?' : 'Are you sure you want to add this new specialty?';
    if (!confirm(confirmMsg)) return;

    this.isSaving = true;
    try {
      if (this.isEditing) {
        await this.specialtyService.updateSpecialty(this.currentId, {
          name: this.formName,
          icon: this.formIcon
        });
        this.toast.success('Specialization updated');
      } else {
        await this.specialtyService.addSpecialty(this.formName, this.formIcon);
        this.toast.success('Specialization added');
      }
      this.showForm = false;
    } catch (err: any) {
      this.toast.error(err.message || 'Action failed');
    } finally {
      this.isSaving = false;
    }
  }

  async deleteSpecialty(id: string) {
    if (confirm('Are you sure you want to delete this specialization?')) {
      try {
        await this.specialtyService.deleteSpecialty(id);
        this.toast.success('Specialization deleted');
      } catch (err) {
        this.toast.error('Delete failed');
      }
    }
  }

  async seedDefaultSpecialties() {
    const defaultSpecialties = [
      { name: 'Physiotherapy', icon: 'activity' },
      { name: 'Cardiology', icon: 'heart' },
      { name: 'Orthopedics', icon: 'bone' },
      { name: 'Neurology', icon: 'brain' },
      { name: 'Pediatrics', icon: 'baby' },
      { name: 'Dermatology', icon: 'user' },
      { name: 'General Physician', icon: 'stethoscope' },
      { name: 'Dental', icon: 'smile' },
      { name: 'Ophthalmology', icon: 'eye' },
      { name: 'Psychiatry', icon: 'brain-circuit' }
    ];

    if (confirm('This will add 10 default categories. Continue?')) {
      this.isSaving = true;
      try {
        for (const s of defaultSpecialties) {
          try {
            await this.specialtyService.addSpecialty(s.name, s.icon);
          } catch (e) {
            // Skip existing ones
            console.log(`Skipping ${s.name} as it may already exist.`);
          }
        }
        this.toast.success('Successfully seeded default categories');
      } catch (err) {
        this.toast.error('Bulk seed failed');
      } finally {
        this.isSaving = false;
      }
    }
  }
}
