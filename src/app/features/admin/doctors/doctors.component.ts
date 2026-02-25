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
        this.doctors$ = this.api.getDoctors();
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
        this.api.removeDoctor(id);
    }

    toggleAvailability(id: string) {
        this.api.toggleDoctorAvailability(id);
    }
}
