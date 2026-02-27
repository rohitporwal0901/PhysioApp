import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

export interface RegisteredPatient {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    dob: string;
    gender: string;
    address?: string;
    condition?: string;
    emergencyContact?: string;
    image: string;
    registeredAt: Date;
}

export interface BookedAppointment {
    id: string;
    patientId: string;
    patientName: string;
    patientImage: string;
    patientEmail: string;
    doctorId: string;
    doctorName: string;
    doctorSpecialty: string;
    doctorImage: string;
    date: string;          // YYYY-MM-DD
    time: string;          // e.g. '09:00 AM'
    duration: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
    type: string;
    notes: string;
    bookedAt: Date;
}

@Injectable({
    providedIn: 'root'
})
export class BookingService {

    // ── Registered Patient (current session) ──
    private currentPatientSubject = new BehaviorSubject<RegisteredPatient | null>(null);
    currentPatient$ = this.currentPatientSubject.asObservable();

    // ── All Booked Appointments ──
    private appointmentsSubject = new BehaviorSubject<BookedAppointment[]>([]);
    appointments$ = this.appointmentsSubject.asObservable();

    constructor() {
        // Pre-fill with dummy appointments to make demo realistic
        const DUMMY_APPOINTMENTS: BookedAppointment[] = [
            { id: 'A1', patientName: 'John Doe', patientImage: 'https://randomuser.me/api/portraits/men/11.jpg', patientId: 'P1', patientEmail: 'john@example.com', doctorId: 'D1', doctorName: 'Dr. Sarah Jenkins', doctorSpecialty: 'Sports Injury', doctorImage: 'https://randomuser.me/api/portraits/women/44.jpg', time: '09:00 AM', duration: '45m', status: 'completed', type: 'Initial Assessment', date: new Date().toISOString().split('T')[0], notes: 'Patient reports mild lower back pain.', bookedAt: new Date() },
            { id: 'A2', patientName: 'Alice Smith', patientImage: 'https://randomuser.me/api/portraits/women/11.jpg', patientId: 'P2', patientEmail: 'alice@example.com', doctorId: 'D1', doctorName: 'Dr. Sarah Jenkins', doctorSpecialty: 'Sports Injury', doctorImage: 'https://randomuser.me/api/portraits/women/44.jpg', time: '10:00 AM', duration: '30m', status: 'completed', type: 'Follow-up Therapy', date: new Date().toISOString().split('T')[0], notes: 'Progressing well with stretches.', bookedAt: new Date() },
            { id: 'A3', patientName: 'Bob Brown', patientImage: 'https://randomuser.me/api/portraits/men/22.jpg', patientId: 'P3', patientEmail: 'bob@example.com', doctorId: 'D2', doctorName: 'Dr. Mark Lee', doctorSpecialty: 'Neurological Rehab', doctorImage: 'https://randomuser.me/api/portraits/men/46.jpg', time: '01:00 PM', duration: '30m', status: 'scheduled', type: 'Routine Checkup', date: new Date().toISOString().split('T')[0], notes: '', bookedAt: new Date() }
        ];
        this.appointmentsSubject.next(DUMMY_APPOINTMENTS);
    }

    // ── Logged-in user info (for doctor/patient dashboard context) ──
    private loggedInUserSubject = new BehaviorSubject<{ role: string; id: string; name: string } | null>(null);
    loggedInUser$ = this.loggedInUserSubject.asObservable();

    // ═══════════════════════════════════════
    //  PATIENT REGISTRATION
    // ═══════════════════════════════════════

    get isPatientRegistered(): boolean {
        return this.currentPatientSubject.getValue() !== null;
    }

    get currentPatient(): RegisteredPatient | null {
        return this.currentPatientSubject.getValue();
    }

    registerPatient(data: {
        fullName: string;
        email: string;
        phone: string;
        dob: string;
        gender: string;
        address?: string;
        condition?: string;
        emergencyContact?: string;
    }): RegisteredPatient {
        const patient: RegisteredPatient = {
            id: 'P' + Date.now(),
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            dob: data.dob,
            gender: data.gender,
            address: data.address,
            condition: data.condition,
            emergencyContact: data.emergencyContact,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName)}&background=0F9B8E&color=fff&size=200`,
            registeredAt: new Date()
        };
        this.currentPatientSubject.next(patient);
        return patient;
    }

    // ═══════════════════════════════════════
    //  LOGIN / SESSION MANAGEMENT
    // ═══════════════════════════════════════

    setLoggedInUser(role: string, id: string, name: string) {
        this.loggedInUserSubject.next({ role, id, name });
    }

    get loggedInUser() {
        return this.loggedInUserSubject.getValue();
    }

    // ═══════════════════════════════════════
    //  BOOKING APPOINTMENTS
    // ═══════════════════════════════════════

    bookAppointment(data: {
        doctorId: string;
        doctorName: string;
        doctorSpecialty: string;
        doctorImage: string;
        date: string;
        time: string;
        type?: string;
    }): BookedAppointment | null {
        const patient = this.currentPatientSubject.getValue();
        if (!patient) return null; // Must be registered

        // Check if slot already booked
        if (this.isSlotBooked(data.doctorId, data.date, data.time)) {
            return null;
        }

        const appointment: BookedAppointment = {
            id: 'A' + Date.now(),
            patientId: patient.id,
            patientName: patient.fullName,
            patientImage: patient.image,
            patientEmail: patient.email,
            doctorId: data.doctorId,
            doctorName: data.doctorName,
            doctorSpecialty: data.doctorSpecialty,
            doctorImage: data.doctorImage,
            date: data.date,
            time: data.time,
            duration: '45m',
            status: 'confirmed',
            type: data.type || 'Consultation',
            notes: '',
            bookedAt: new Date()
        };

        const current = this.appointmentsSubject.getValue();
        this.appointmentsSubject.next([...current, appointment]);
        return appointment;
    }

    // ═══════════════════════════════════════
    //  SLOT AVAILABILITY
    // ═══════════════════════════════════════

    isSlotBooked(doctorId: string, date: string, time: string): boolean {
        const appointments = this.appointmentsSubject.getValue();
        return appointments.some(
            a => a.doctorId === doctorId && a.date === date && a.time === time && a.status !== 'cancelled'
        );
    }

    getBookedSlotsForDoctor(doctorId: string, date: string): string[] {
        const appointments = this.appointmentsSubject.getValue();
        return appointments
            .filter(a => a.doctorId === doctorId && a.date === date && a.status !== 'cancelled')
            .map(a => a.time);
    }

    // ═══════════════════════════════════════
    //  DASHBOARD QUERIES
    // ═══════════════════════════════════════

    /** Get appointments for a specific doctor */
    getAppointmentsForDoctor(doctorId: string): Observable<BookedAppointment[]> {
        return this.appointments$.pipe(
            map(apts => apts.filter(a => a.doctorId === doctorId))
        );
    }

    /** Get appointments for a specific patient */
    getAppointmentsForPatient(patientId: string): Observable<BookedAppointment[]> {
        return this.appointments$.pipe(
            map(apts => apts.filter(a => a.patientId === patientId))
        );
    }

    /** Get appointments for the currently logged-in patient */
    getMyAppointments(): Observable<BookedAppointment[]> {
        const patient = this.currentPatientSubject.getValue();
        if (!patient) return new BehaviorSubject<BookedAppointment[]>([]).asObservable();
        return this.getAppointmentsForPatient(patient.id);
    }

    /** Get all booked appointments (for admin or general view) */
    getAllAppointments(): Observable<BookedAppointment[]> {
        return this.appointments$;
    }
}
