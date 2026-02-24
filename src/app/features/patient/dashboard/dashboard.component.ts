import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { Observable } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private api = inject(MockApiService);

  doctors$: Observable<any[]> | null = null;
  upcomingAppointments = [
    { date: 'Nov 1, 2023', time: '10:00 AM', doctor: 'Dr. Sarah Jenkins', specialty: 'Sports Injury', status: 'Confirmed' },
    { date: 'Nov 8, 2023', time: '11:00 AM', doctor: 'Dr. Sarah Jenkins', specialty: 'Follow-up', status: 'Pending' }
  ];

  ngOnInit() {
    this.doctors$ = this.api.getDoctors();
  }
}

