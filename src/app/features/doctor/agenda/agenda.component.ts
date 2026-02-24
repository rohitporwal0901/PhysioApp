import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockApiService } from '../../../core/services/mock-api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss'
})
export class AgendaComponent implements OnInit {
  private api = inject(MockApiService);

  agenda$: Observable<any[]> | null = null;
  selectedAppointment: any = null;

  ngOnInit() {
    // Filter down to doctor D1's agenda for today
    this.agenda$ = this.api.getAppointments().pipe(
      map(appointments => appointments.filter(a => a.doctorId === 'D1'))
    );
  }

  selectAppointment(apt: any) {
    this.selectedAppointment = apt;
  }
}
