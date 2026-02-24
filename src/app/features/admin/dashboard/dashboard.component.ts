import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { MockApiService } from '../../../core/services/mock-api.service';
import { Observable } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private api = inject(MockApiService);

  doctors$: Observable<any[]> | null = null;
  appointments$: Observable<any[]> | null = null;
  patients$: Observable<any[]> | null = null;

  ngOnInit() {
    this.doctors$ = this.api.getDoctors();
    this.appointments$ = this.api.getAppointments();
    this.patients$ = this.api.getPatients();
  }
}

