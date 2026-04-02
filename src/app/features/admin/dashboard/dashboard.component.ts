import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { MockApiService } from '../../../core/services/mock-api.service';
import { Observable, map, BehaviorSubject, combineLatest } from 'rxjs';
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
  labTechnicians$: Observable<any[]> | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 10;

  // Today's Date String
  todayStr = new Date().toISOString().split('T')[0];

  currentPage$ = new BehaviorSubject<number>(1);
  pagedAppointments$: Observable<any[]> | null = null;
  totalAppointments$ = new BehaviorSubject<number>(0);

  ngOnInit() {
    this.doctors$ = this.api.getDoctors();
    console.log("Doctors: ", this.doctors$);

    this.patients$ = this.api.getPatients();
    this.labTechnicians$ = this.api.getLabTechnicians();

    // Filter appointments for today and sort by time
    this.appointments$ = this.api.getAppointments().pipe(
      map(appts => {
        const filtered = appts
          .filter(a => a.date === this.todayStr)
          .sort((a, b) => {
            const timeA = this.parseTime(a.time);
            const timeB = this.parseTime(b.time);
            return timeA - timeB;
          });
        this.totalAppointments$.next(filtered.length);
        return filtered;
      })
    );

    // Combine for pagination
    if (this.appointments$) {
      this.pagedAppointments$ = combineLatest([
        this.appointments$,
        this.currentPage$
      ]).pipe(
        map(([appts, page]) => {
          const start = (page - 1) * this.pageSize;
          const end = start + this.pageSize;
          return appts.slice(start, end);
        })
      );
    }
  }

  nextPage() {
    const total = this.totalAppointments$.value;
    if (this.currentPage$.value * this.pageSize < total) {
      this.currentPage$.next(this.currentPage$.value + 1);
    }
  }

  prevPage() {
    if (this.currentPage$.value > 1) {
      this.currentPage$.next(this.currentPage$.value - 1);
    }
  }

  getWhatsAppMessage(apt: any): string {
    const message = `Hi ${apt.patientName}, this is a reminder for your HealthHub appointment with ${apt.doctorName} today at ${apt.time}. See you there!`;
    return encodeURIComponent(message);
  }

  private parseTime(timeStr: string): number {
    if (!timeStr) return 0;
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }
}

