import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { MockApiService } from '../../../core/services/mock-api.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private api = inject(MockApiService);

  appointments$: Observable<any[]> | undefined;
  patients$: Observable<any[]> | undefined;

  stats = {
    todayPatients: 8,
    pendingReports: 3,
    weeklyRevenue: '$1,240',
    upcomingMeetings: 2
  };

  ngOnInit() {
    this.appointments$ = this.api.getAppointments();
    this.patients$ = this.api.getPatients();
  }
}
