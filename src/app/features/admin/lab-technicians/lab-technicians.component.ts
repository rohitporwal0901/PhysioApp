import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Observable } from 'rxjs';
import { MockApiService } from '../../../core/services/mock-api.service';

@Component({
    selector: 'app-admin-lab-technicians',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
    templateUrl: './lab-technicians.component.html',
    styleUrl: './lab-technicians.component.scss'
})
export class LabTechniciansComponent implements OnInit {
    private api = inject(MockApiService);
    
    allTechs: any[] = [];
    filteredTechs: any[] = [];
    paginatedTechs: any[] = [];
    
    // Pagination
    currentPage = 1;
    pageSize = 8;
    totalPages = 1;

    showAddModal = false;
    searchQuery = '';

    newTech = {
        name: '',
        specialty: '',
        phone: '',
        whatsapp: '',
        image: '',
        qualification: '',
        experience: ''
    };

    specialties = [
        'Blood Collection', 'Imaging/Radiology', 'Pathology Specialist', 
        'ECG Technician', 'Diagnostic Support', 'Home Sample Collection'
    ];

    ngOnInit() {
        this.api.getLabTechnicians().subscribe(techs => {
            this.allTechs = techs;
            this.applyFilters();
        });
    }

    applyFilters() {
        if (!this.searchQuery) {
            this.filteredTechs = this.allTechs;
        } else {
            const query = this.searchQuery.toLowerCase();
            this.filteredTechs = this.allTechs.filter(tech => 
                tech.name.toLowerCase().includes(query) || 
                tech.specialty.toLowerCase().includes(query)
            );
        }
        this.totalPages = Math.ceil(this.filteredTechs.length / this.pageSize);
        this.currentPage = 1;
        this.updatePaginatedTechs();
    }

    updatePaginatedTechs() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.paginatedTechs = this.filteredTechs.slice(start, end);
    }

    setPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.updatePaginatedTechs();
        }
    }

    onSearchChange() {
        this.applyFilters();
    }

    openAddModal() {
        this.newTech = { 
            name: '', 
            specialty: '', 
            phone: '', 
            whatsapp: '', 
            image: '',
            qualification: '',
            experience: ''
        };
        this.showAddModal = true;
    }

    addTech() {
        if (this.newTech.name && this.newTech.specialty) {
            this.api.addLabTechnician(this.newTech);
            this.showAddModal = false;
        }
    }

    removeTech(id: string) {
        if (confirm('Are you sure you want to remove this lab technician?')) {
            this.api.removeUser(id);
        }
    }

    toggleAvailability(id: string) {
        this.api.toggleLabTechnicianAvailability(id);
    }

    toggleActive(id: string) {
        this.api.toggleLabTechnicianActive(id);
    }
}
