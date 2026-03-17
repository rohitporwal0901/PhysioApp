import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Observable } from 'rxjs';
import { MockApiService } from '../../../core/services/mock-api.service';

import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-admin-doctors',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule, ConfirmDialogComponent],
    templateUrl: './doctors.component.html',
    styleUrl: './doctors.component.scss'
})
export class DoctorsComponent implements OnInit {
    private api = inject(MockApiService);
    private toast = inject(ToastService);
    
    isProcessing = false;
    
    // Confirmation dialog state
    confirmConfig = {
      isOpen: false,
      title: '',
      message: '',
      confirmText: '',
      confirmBtnClass: '',
      icon: '',
      action: () => {}
    };
    allDoctors: any[] = [];
    filteredDoctors: any[] = [];
    paginatedDoctors: any[] = [];
    
    // Pagination
    currentPage = 1;
    pageSize = 8;
    totalPages = 1;

    showAddModal = false;
    searchQuery = '';

    newDoctor = {
        name: '',
        specialty: '',
        image: ''
    };

    specialties = [
        'Sports Injury', 'Neurological Rehab', 'Pediatric Physiotherapy',
        'Orthopedics', 'Geriatric Rehab', 'Cardiopulmonary',
        'Post-Surgical Rehab', 'Manual Therapy', 'Pain Management'
    ];

    ngOnInit() {
        this.api.getDoctors().subscribe(docs => {
            console.log('Doctors updated in component:', docs);
            this.allDoctors = docs;
            this.applyFilters(true); // true to preserve current page if possible
        });
    }

    applyFilters(preservePage: boolean = false) {
        if (!this.searchQuery) {
            this.filteredDoctors = this.allDoctors;
        } else {
            const query = this.searchQuery.toLowerCase();
            this.filteredDoctors = this.allDoctors.filter(doc => 
                doc.name.toLowerCase().includes(query) || 
                doc.specialty.toLowerCase().includes(query)
            );
        }
        this.totalPages = Math.ceil(this.filteredDoctors.length / this.pageSize);
        
        if (!preservePage || this.currentPage > this.totalPages) {
            this.currentPage = 1;
        }
        
        this.updatePaginatedDoctors();
    }

    updatePaginatedDoctors() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.paginatedDoctors = this.filteredDoctors.slice(start, end);
    }

    setPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.updatePaginatedDoctors();
        }
    }

    onSearchChange() {
        this.applyFilters();
    }

    openAddModal() {
        this.newDoctor = { name: '', specialty: '', image: '' };
        this.showAddModal = true;
    }

    async addDoctor() {
        if (this.newDoctor.name && this.newDoctor.specialty) {
            this.isProcessing = true;
            try {
                await this.api.addDoctor(this.newDoctor);
                this.toast.success('New doctor profile has been created.', 'Doctor Added');
                this.showAddModal = false;
            } catch (error) {
                this.toast.error('Failed to add doctor.', 'Error');
            } finally {
                this.isProcessing = false;
            }
        }
    }

    removeDoctor(id: string) {
        this.confirmConfig = {
          isOpen: true,
          title: 'Remove Doctor?',
          message: 'This action will permanently delete the doctor from the database. Are you sure?',
          confirmText: 'Delete Doctor',
          confirmBtnClass: 'bg-red-500 hover:bg-red-600 shadow-red-500/20',
          icon: 'trash-2',
          action: async () => {
            try {
                await this.api.removeDoctor(id);
                this.toast.success('Doctor has been removed successfully.', 'Deleted');
            } catch (error) {
                this.toast.error('Failed to remove doctor.', 'Error');
            }
          }
        };
    }

    async toggleAvailability(id: string) {
        try {
            await this.api.toggleDoctorAvailability(id);
            this.toast.info('Availability status updated.', 'Status Update');
        } catch (error) {
            this.toast.error('Failed to update status.', 'Error');
        }
    }

    async toggleActive(id: string) {
        try {
            await this.api.toggleDoctorActive(id);
            this.toast.info('Visibility status updated.', 'Status Update');
        } catch (error) {
            this.toast.error('Failed to update status.', 'Error');
        }
    }
}
