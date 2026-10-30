import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Observable } from 'rxjs';
import { MockApiService } from '../../../core/services/mock-api.service';

import { ToastService } from '../../../core/services/toast.service';
import { ImageUploadService } from '../../../core/services/image-upload.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-admin-lab-technicians',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule, ConfirmDialogComponent],
    templateUrl: './lab-technicians.component.html',
    styleUrl: './lab-technicians.component.scss'
})
export class LabTechniciansComponent implements OnInit {
    private api = inject(MockApiService);
    private toast = inject(ToastService);
    private imageUpload = inject(ImageUploadService);
    
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
    
    allLabs: any[] = [];
    filteredLabs: any[] = [];
    paginatedLabs: any[] = [];
    
    // Pagination
    currentPage = 1;
    pageSize = 4;
    totalPages = 1;

    searchQuery = '';

    ngOnInit() {
        this.api.getLabTechnicians().subscribe(labs => {
            this.allLabs = labs;
            this.applyFilters(true);
        });
    }

    applyFilters(preservePage: boolean = false) {
        if (!this.searchQuery) {
            this.filteredLabs = this.allLabs;
        } else {
            const query = this.searchQuery.toLowerCase();
            this.filteredLabs = this.allLabs.filter(lab => 
                (lab.labName && lab.labName.toLowerCase().includes(query)) ||
                (lab.fullName && lab.fullName.toLowerCase().includes(query)) ||
                (lab.name && lab.name.toLowerCase().includes(query)) ||
                (lab.email && lab.email.toLowerCase().includes(query))
            );
        }
        this.totalPages = Math.ceil(this.filteredLabs.length / this.pageSize);
        
        if (!preservePage || this.currentPage > this.totalPages) {
            this.currentPage = 1;
        }
        
        this.updatePaginatedLabs();
    }

    updatePaginatedLabs() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.paginatedLabs = this.filteredLabs.slice(start, end);
    }

    setPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.updatePaginatedLabs();
        }
    }

    onSearchChange() {
        this.applyFilters();
    }

    removeLab(id: string) {
        this.confirmConfig = {
          isOpen: true,
          title: 'Remove Laboratory?',
          message: 'This will remove the lab and all associated data. Are you sure?',
          confirmText: 'Delete Lab',
          confirmBtnClass: 'bg-red-500 hover:bg-red-600 shadow-red-500/20',
          icon: 'trash-2',
          action: async () => {
            try {
                await this.api.removeUser(id);
                this.toast.success('Laboratory removed successfully.', 'Deleted');
            } catch (error) {
                this.toast.error('Failed to remove lab.', 'Error');
            }
          }
        };
    }

    async toggleAvailability(id: string) {
        try {
            await this.api.toggleLabTechnicianAvailability(id);
            this.toast.info('Availability status updated.', 'Status Update');
        } catch (error) {
            this.toast.error('Failed to update status.', 'Error');
        }
    }

    async toggleActive(id: string) {
        try {
            await this.api.toggleLabTechnicianActive(id);
            this.toast.info('Lab visibility updated.', 'Status Update');
        } catch (error) {
            this.toast.error('Failed to update visibility.', 'Error');
        }
    }

    callLaboratory(phone: string) {
        if (phone) {
            window.location.href = `tel:${phone}`;
        }
    }
}
