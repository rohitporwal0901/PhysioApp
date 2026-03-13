import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { BookingService, BookedAppointment } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { Observable, of } from 'rxjs';
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
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);

  doctors$: Observable<any[]> | null = null;
  upcomingAppointments: BookedAppointment[] = [];
  patientName = 'Guest';
  isLoading = true;
  currentTreatmentPlan: any = null;

  // Unsplash doctor profile image collection
  private doctorImages = [
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop'
  ];

  ngOnInit() {
    this.doctors$ = this.api.getDoctors();

    const user = this.authService.currentUser;
    if (user) {
      this.patientName = user.fullName.split(' ')[0];
      
      // Get real-time appointments from Firestore
      this.bookingService.getPatientAppointments(user.uid).subscribe(appointments => {
        // Show only confirmed appointments in the dashboard summary
        this.upcomingAppointments = appointments.filter(apt => apt.status === 'confirmed');
        
        // Find latest appointment with an AI Report to show as current treatment plan
        const latestWithAI = appointments
          .filter(apt => !!apt.aiReport)
          .sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA;
          })[0];
          
        if (latestWithAI) {
          this.currentTreatmentPlan = latestWithAI.aiReport;
        }

        this.isLoading = false;
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
    }
  }

  getDoctorImage(doc: any, index: number): string {
    if (doc.image && !doc.image.includes('ui-avatars.com')) {
      return doc.image;
    }
    return this.doctorImages[index % this.doctorImages.length];
  }

  encodeURIComponent(str: string): string {
    return encodeURIComponent(str);
  }
}
