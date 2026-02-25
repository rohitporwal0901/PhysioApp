import { Injectable, signal } from '@angular/core';
import { of, Observable, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DUMMY_DOCTORS, DUMMY_APPOINTMENTS, DUMMY_PATIENTS } from '../data/dummy-data';

@Injectable({
    providedIn: 'root'
})
export class MockApiService {

    // Simulating network delay for realistic SaaS feel
    private readonly DEFAULT_DELAY = 600;

    // Reactive doctor store — allows Add Doctor to reflect on landing page
    private doctorsSubject = new BehaviorSubject<any[]>([...DUMMY_DOCTORS]);

    getDoctors(): Observable<any[]> {
        return this.doctorsSubject.asObservable();
    }

    addDoctor(doctor: any): void {
        const current = this.doctorsSubject.getValue();
        const newDoctor = {
            ...doctor,
            id: `D${current.length + 1}`,
            rating: 4.5,
            available: true,
            image: doctor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=0F9B8E&color=fff&size=200`
        };
        this.doctorsSubject.next([...current, newDoctor]);
    }

    removeDoctor(id: string): void {
        const current = this.doctorsSubject.getValue();
        this.doctorsSubject.next(current.filter(d => d.id !== id));
    }

    toggleDoctorAvailability(id: string): void {
        const current = this.doctorsSubject.getValue();
        this.doctorsSubject.next(current.map(d =>
            d.id === id ? { ...d, available: !d.available } : d
        ));
    }

    getAppointments(): Observable<any[]> {
        return of(DUMMY_APPOINTMENTS).pipe(delay(this.DEFAULT_DELAY));
    }

    getPatients(): Observable<any[]> {
        return of(DUMMY_PATIENTS).pipe(delay(this.DEFAULT_DELAY));
    }
}
