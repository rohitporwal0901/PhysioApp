import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { Observable, map, of } from 'rxjs';
import { MockApiService } from '../../../core/services/mock-api.service';

@Component({
    selector: 'app-admin-patients',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
    templateUrl: './patients.component.html',
    styleUrl: './patients.component.scss'
})
export class PatientsComponent implements OnInit {
    private api = inject(MockApiService);

    allPatients: any[] = [];
    allDoctors: any[] = [];
    paginatedPatients: any[] = [];

    // Pagination
    currentPage = 1;
    pageSize = 4;
    totalPages = 1;

    showAddModal = false;
    newPatient = {
        fullName: '',
        condition: '',
        phone: '',
        email: '',
        gender: '',
        dob: '',
        address: '',
        emergencyContact: '',
        image: '',
        assignedDoctors: [] as string[]
    };

    ngOnInit() {
        // Subscribe to doctors first to have them ready for names
        this.api.getDoctors().subscribe(docs => {
            this.allDoctors = docs;
        });

        this.api.getPatients().subscribe(patients => {
            this.allPatients = patients;
            this.applyPagination();
        });
    }

    applyPagination() {
        this.totalPages = Math.ceil(this.allPatients.length / this.pageSize);
        if (this.currentPage > this.totalPages) this.currentPage = 1;
        this.updatePaginatedPatients();
    }

    updatePaginatedPatients() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.paginatedPatients = this.allPatients.slice(start, end);
    }

    setPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.updatePaginatedPatients();
        }
    }

    openAddModal() {
        this.newPatient = {
            fullName: '',
            condition: '',
            phone: '',
            email: '',
            gender: '',
            dob: '',
            address: '',
            emergencyContact: '',
            image: '',
            assignedDoctors: []
        };
        this.showAddModal = true;
    }

    async addPatient() {
        if (!this.newPatient.fullName || !this.newPatient.phone) return;

        const patientData = {
            ...this.newPatient,
            id: 'PAT-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
            createdAt: new Date().toISOString(),
            status: 'active',
            role: 'patient',
            lastVisit: 'Just Added'
        };

        await this.api.addPatient(patientData);
        this.showAddModal = false;
        // The subscription in ngOnInit will automatically update allPatients and re-apply pagination
    }

    getDoctorName(doctorId: string, doctors: any[]): string {
        const doc = doctors.find(d => d.id === doctorId || d.uid === doctorId);
        return doc ? (doc.fullName || doc.name) : 'Pending Assignment';
    }
}
