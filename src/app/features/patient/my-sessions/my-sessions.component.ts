import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { MockApiService } from '../../../core/services/mock-api.service';

@Component({
  selector: 'app-my-sessions',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './my-sessions.component.html',
  styleUrl: './my-sessions.component.scss'
})
export class MySessionsComponent implements OnInit {
  private api = inject(MockApiService);

  // Dummy data for past and upcoming sessions
  upcomingSessions = [
    { id: 'S1', date: 'Nov 8, 2023', time: '11:00 AM', doctor: 'Dr. Sarah Jenkins', specialty: 'Follow-up Mobility', status: 'Pending', type: 'In-person' },
    { id: 'S2', date: 'Nov 15, 2023', time: '10:00 AM', doctor: 'Dr. Sarah Jenkins', specialty: 'Strengthening', status: 'Scheduled', type: 'In-person' }
  ];

  pastSessions = [
    { id: 'S0', date: 'Nov 1, 2023', time: '10:00 AM', doctor: 'Dr. Sarah Jenkins', specialty: 'Sports Injury', status: 'Completed', type: 'In-person', notes: 'Patient showed 15% improvement in knee flexion. Prescribed resistance bands.', prescription: true },
    { id: 'S-1', date: 'Oct 25, 2023', time: '02:00 PM', doctor: 'Dr. Sarah Jenkins', specialty: 'Post-op Check', status: 'Completed', type: 'Video Consult', notes: 'Incision healing well. Swelling reduced.', prescription: false },
    { id: 'S-2', date: 'Oct 15, 2023', time: '09:00 AM', doctor: 'Dr. Sarah Jenkins', specialty: 'Initial Assessment', status: 'Completed', type: 'In-person', notes: 'Diagnosed minor meniscus strain. Started Phase 1 therapy.', prescription: true }
  ];

  activeTab: 'upcoming' | 'past' = 'upcoming';

  ngOnInit() {
  }
}
