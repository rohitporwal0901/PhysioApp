import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  doc, 
  updateDoc,
  Timestamp,
  orderBy
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { AuthService, AppUser } from './auth.service';

export interface BookedAppointment {
  id?: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;          // YYYY-MM-DD
  time: string;          // e.g. '09:00 AM'
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  type: string;
  notes: string;
  createdAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  private appointmentsCollection = collection(this.firestore, 'appointments');

  get isPatientRegistered(): boolean {
    const user = this.auth.currentUser;
    return !!user && user.role === 'patient';
  }

  get currentPatient(): AppUser | null {
    const user = this.auth.currentUser;
    return user && user.role === 'patient' ? user : null;
  }

  // ═══════════════════════════════════════
  //  BOOKING LOGIC
  // ═══════════════════════════════════════

  async bookAppointment(data: {
    doctorId: string;
    doctorName: string;
    doctorSpecialty: string;
    doctorImage?: string;
    date: string;
    time: string;
    type?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const user = this.auth.currentUser;
    if (!user || user.role !== 'patient') {
      return { success: false, error: 'Only registered patients can book appointments.' };
    }

    // 1. Check if slot is already booked (Confirmed or Pending)
    const isBooked = await this.isSlotTaken(data.doctorId, data.date, data.time);
    if (isBooked) {
      return { success: false, error: 'This time slot is already taken. Please choose another.' };
    }

    try {
      const appointment: BookedAppointment = {
        patientId: user.uid,
        patientName: user.fullName,
        patientEmail: user.email,
        doctorId: data.doctorId,
        doctorName: data.doctorName,
        doctorSpecialty: data.doctorSpecialty,
        date: data.date,
        time: data.time,
        status: 'pending', // Starts as pending for doctor approval
        type: data.type || 'Consultation',
        notes: '',
        createdAt: Timestamp.now()
      };

      await addDoc(this.appointmentsCollection, appointment);
      return { success: true };
    } catch (err) {
      console.error('Booking error:', err);
      return { success: false, error: 'Failed to book appointment. Please try again.' };
    }
  }

  private async isSlotTaken(doctorId: string, date: string, time: string): Promise<boolean> {
    const q = query(
      this.appointmentsCollection,
      where('doctorId', '==', doctorId),
      where('date', '==', date),
      where('time', '==', time),
      where('status', 'in', ['pending', 'confirmed'])
    );
    const snap = await getDocs(q);
    return !snap.empty;
  }

  // ═══════════════════════════════════════
  //  RETRIEVE APPOINTMENTS (Real-time)
  // ═══════════════════════════════════════

  getPatientAppointments(patientId: string): Observable<BookedAppointment[]> {
    const q = query(
      this.appointmentsCollection,
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    return this.collectionToObservable(q);
  }

  getDoctorAppointments(doctorId: string): Observable<BookedAppointment[]> {
    const q = query(
      this.appointmentsCollection,
      where('doctorId', '==', doctorId),
      orderBy('createdAt', 'desc')
    );
    return this.collectionToObservable(q);
  }

  /** Get booked slots for a doctor on a specific date to disable them in UI */
  async getBookedSlots(doctorId: string, date: string): Promise<string[]> {
    const q = query(
      this.appointmentsCollection,
      where('doctorId', '==', doctorId),
      where('date', '==', date),
      where('status', 'in', ['pending', 'confirmed'])
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data()['time']);
  }

  /** Alias for legacy/component usage */
  getBookedSlotsForDoctor(doctorId: string, date: string): Promise<string[]> {
    return this.getBookedSlots(doctorId, date);
  }

  // ═══════════════════════════════════════
  //  STATUS MANAGEMENT (Doctor Actions)
  // ═══════════════════════════════════════

  async updateAppointmentStatus(appointmentId: string, status: 'confirmed' | 'cancelled' | 'completed'): Promise<void> {
    const docRef = doc(this.firestore, 'appointments', appointmentId);
    await updateDoc(docRef, { status });
  }

  // Helper to convert Firestore query to Observable
  private collectionToObservable(q: any): Observable<BookedAppointment[]> {
    return new Observable<BookedAppointment[]>(subscriber => {
      return onSnapshot(q, (snapshot: any) => {
        const data = snapshot.docs.map((d: any) => ({
          id: d.id,
          ...d.data()
        })) as BookedAppointment[];
        subscriber.next(data);
      }, (error: any) => subscriber.error(error));
    });
  }
}
