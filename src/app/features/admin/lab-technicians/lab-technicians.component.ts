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
    
    allLabs: any[] = [];
    filteredLabs: any[] = [];
    paginatedLabs: any[] = [];
    
    // Pagination
    currentPage = 1;
    pageSize = 8;
    totalPages = 1;

    showAddModal = false;
    searchQuery = '';

    newLab = {
        name: '',
        phone: '',
        whatsapp: '',
        image: '',
        address: '',
        experience: 'Open 24/7'
    };

    ngOnInit() {
        this.api.getLabTechnicians().subscribe(labs => {
            this.allLabs = labs;
            this.applyFilters();
        });
    }

    applyFilters() {
        if (!this.searchQuery) {
            this.filteredLabs = this.allLabs;
        } else {
            const query = this.searchQuery.toLowerCase();
            this.filteredLabs = this.allLabs.filter(lab => 
                lab.name.toLowerCase().includes(query)
            );
        }
        this.totalPages = Math.ceil(this.filteredLabs.length / this.pageSize);
        this.currentPage = 1;
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

    openAddModal() {
        this.newLab = { 
            name: '', 
            phone: '', 
            whatsapp: '', 
            image: '',
            address: '',
            experience: 'Open 24/7'
        };
        this.showAddModal = true;
    }

    addLab() {
        if (this.newLab.name) {
            this.api.addLabTechnician(this.newLab);
            this.showAddModal = false;
        }
    }

    removeLab(id: string) {
        if (confirm('Are you sure you want to remove this lab?')) {
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
