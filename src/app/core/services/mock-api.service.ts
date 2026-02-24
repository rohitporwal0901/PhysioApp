import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { DUMMY_DOCTORS, DUMMY_APPOINTMENTS, DUMMY_PATIENTS } from '../data/dummy-data';

@Injectable({
    providedIn: 'root'
})
export class MockApiService {

    // Simulating network delay for realistic SaaS feel
    private readonly DEFAULT_DELAY = 800;

    getDoctors(): Observable<any[]> {
        return of(DUMMY_DOCTORS).pipe(delay(this.DEFAULT_DELAY));
    }

    getAppointments(): Observable<any[]> {
        return of(DUMMY_APPOINTMENTS).pipe(delay(this.DEFAULT_DELAY));
    }

    getPatients(): Observable<any[]> {
        return of(DUMMY_PATIENTS).pipe(delay(this.DEFAULT_DELAY));
    }
}
