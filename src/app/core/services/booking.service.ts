import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  onSnapshot, 
  doc, 
  updateDoc,
  Timestamp,
  orderBy,
  arrayUnion,
  limit
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { AuthService, AppUser } from './auth.service';

export interface BookedAppointment {
  id?: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  patientGender?: string;
  patientCondition?: string;
  patientImage?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;          // YYYY-MM-DD
  time: string;          // e.g. '09:00 AM'
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  type: string;
  notes: string;          // Patient's complaint/reason for visit
  treatmentNotes?: string; // Doctor's notes after/during session
  feedback?: {
    rating: number;
    comment: string;
    createdAt: any;
  };
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
    notes?: string;
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
      // Get the full patient profile to store the latest details in appointment
      const patientRef = doc(this.firestore, 'users', user.uid);
      const patientSnap = await getDoc(patientRef);
      const patientData = patientSnap.data() as any;

      const appointment: BookedAppointment = {
        patientId: user.uid,
        patientName: user.fullName,
        patientEmail: user.email,
        patientPhone: patientData?.phone || '',
        patientGender: patientData?.gender || '',
        patientCondition: patientData?.condition || data.type || 'General Consultation',
        patientImage: patientData?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`,
        doctorId: data.doctorId,
        doctorName: data.doctorName,
        doctorSpecialty: data.doctorSpecialty,
        date: data.date,
        time: data.time,
        status: 'pending',
        type: data.type || 'Consultation',
        notes: data.notes || '',
        createdAt: Timestamp.now()
      };

      await addDoc(this.appointmentsCollection, appointment);
      
      // 2. Link patient to doctor permanently in their profile
      const userRef = doc(this.firestore, 'users', user.uid);
      await updateDoc(userRef, {
        assignedDoctors: arrayUnion(data.doctorId)
      });

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

  async updateTreatmentNotes(appointmentId: string, treatmentNotes: string): Promise<void> {
    const docRef = doc(this.firestore, 'appointments', appointmentId);
    await updateDoc(docRef, { treatmentNotes });
  }

  async updateFeedback(appointmentId: string, feedback: { rating: number; comment: string }): Promise<void> {
    const docRef = doc(this.firestore, 'appointments', appointmentId);
    await updateDoc(docRef, { 
      feedback: {
        ...feedback,
        createdAt: Timestamp.now()
      }
    });
  }

  getLatestFeedbacks(limitCount: number = 5): Observable<BookedAppointment[]> {
    const q = query(
      this.appointmentsCollection,
      where('feedback', '!=', null),
      orderBy('feedback.createdAt', 'desc'),
      limit(limitCount)
    );
    return this.collectionToObservable(q);
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
