import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService, AppUser } from '../../../core/services/auth.service';

@Component({
  selector: 'app-lab-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  currentUser: AppUser | null = null;
  
  // Dummy data for dashboard
  stats = [
    { label: 'Total Patients Reached', value: '342', icon: 'users', color: 'bg-blue-100 text-blue-600' },
    { label: 'Tests Available', value: '45+', icon: 'flask-conical', color: 'bg-purple-100 text-purple-600' },
    { label: 'Profile Views', value: '1,204', icon: 'eye', color: 'bg-green-100 text-green-600' },
    { label: 'Rating', value: '4.8', icon: 'star', color: 'bg-amber-100 text-amber-600' }
  ];

  recentActivities = [
    { title: 'Dr. Sharma viewed your tests.', time: '2 hours ago', icon: 'eye' },
    { title: 'New patient inquiry received.', time: '5 hours ago', icon: 'message-circle' },
    { title: 'Your subscription covers 30 more days.', time: '1 day ago', icon: 'calendar' }
  ];

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user || null;
    });
  }
}
