import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Observable } from 'rxjs';
import { MockApiService } from '../../../core/services/mock-api.service';

@Component({
    selector: 'app-admin-doctors',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
    templateUrl: './doctors.component.html',
    styleUrl: './doctors.component.scss'
})
export class DoctorsComponent implements OnInit {
    private api = inject(MockApiService);
    doctors$: Observable<any[]> | undefined;
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
            this.allDoctors = docs;
            this.applyFilters();
        });
    }

    applyFilters() {
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
        this.currentPage = 1;
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

    addDoctor() {
        if (this.newDoctor.name && this.newDoctor.specialty) {
            this.api.addDoctor(this.newDoctor);
            this.showAddModal = false;
        }
    }

    removeDoctor(id: string) {
        if (confirm('Are you sure you want to remove this doctor?')) {
            this.api.removeDoctor(id);
        }
    }

    toggleAvailability(id: string) {
        this.api.toggleDoctorAvailability(id);
    }

    toggleActive(id: string) {
        this.api.toggleDoctorActive(id);
    }
}
