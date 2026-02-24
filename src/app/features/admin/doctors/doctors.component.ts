import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Observable } from 'rxjs';
import { MockApiService } from '../../../core/services/mock-api.service';

@Component({
    selector: 'app-admin-doctors',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    templateUrl: './doctors.component.html',
    styleUrl: './doctors.component.scss'
})
export class DoctorsComponent implements OnInit {
    private api = inject(MockApiService);
    doctors$: Observable<any[]> | undefined;

    ngOnInit() {
        this.doctors$ = this.api.getDoctors();
    }
}
