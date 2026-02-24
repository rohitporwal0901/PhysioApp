import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Observable } from 'rxjs';
import { MockApiService } from '../../../core/services/mock-api.service';

@Component({
    selector: 'app-doctor-patients',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    templateUrl: './patients.component.html',
    styleUrl: './patients.component.scss'
})
export class PatientsComponent implements OnInit {
    private api = inject(MockApiService);
    patients$: Observable<any[]> | undefined;

    ngOnInit() {
        this.patients$ = this.api.getPatients();
    }
}
