import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  query, 
  where, 
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  Timestamp,
  getDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MockApiService {
  private firestore = inject(Firestore);

  /** Get all registered doctors from 'users' collection */
  getDoctors(): Observable<any[]> {
    const q = query(
      collection(this.firestore, 'users'),
      where('role', '==', 'doctor')
    );
    return this.collectionToObservable(q);
  }

  /** Get all registered patients from 'users' collection */
  getPatients(): Observable<any[]> {
    const q = query(
      collection(this.firestore, 'users'),
      where('role', '==', 'patient')
    );
    return this.collectionToObservable(q);
  }

  /** Get patients specifically assigned to a doctor (through their bookings) */
  getPatientsByDoctor(doctorId: string): Observable<any[]> {
    const q = query(
      collection(this.firestore, 'users'),
      where('role', '==', 'patient'),
      where('assignedDoctors', 'array-contains', doctorId)
    );
    return this.collectionToObservable(q);
  }

  /** Get all appointments */
  getAppointments(): Observable<any[]> {
    return this.collectionToObservable(collection(this.firestore, 'appointments'));
  }

  /** Add a new doctor */
  addDoctor(doctor: any): Promise<any> {
    return addDoc(collection(this.firestore, 'users'), {
      ...doctor,
      role: 'doctor',
      createdAt: Timestamp.now(),
      isAvailable: true
    });
  }

  removeUser(uid: string): Promise<void> {
    const docRef = doc(this.firestore, 'users', uid);
    return deleteDoc(docRef);
  }

  /** Alias for removeUser to match component usage */
  removeDoctor(uid: string): Promise<void> {
    return this.removeUser(uid);
  }

  /** Toggle doctor availability */
  async toggleDoctorAvailability(uid: string): Promise<void> {
    const docRef = doc(this.firestore, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      await updateDoc(docRef, {
        isAvailable: !data['isAvailable']
      });
    }
  }

  // Generic helper for real-time collection updates
  private collectionToObservable(q: any): Observable<any[]> {
    return new Observable<any[]>(subscriber => {
      console.log('Starting Firestore snapshot for query...', q);
      return onSnapshot(q, (snapshot: any) => {
        const data = snapshot.docs.map((d: any) => {
          const docData = d.data();
          return {
            id: d.id,
            ...docData,
            // Fallback for availability field naming inconsistency
            available: docData.available ?? docData.isAvailable ?? false,
            // Ensure rating exists for UI
            rating: docData.rating ?? 4.5
          };
        });
        console.log(`Firestore snapshot received: ${data.length} items found.`, data);
        subscriber.next(data);
      }, (error: any) => {
        console.error('Firestore snapshot error:', error);
        subscriber.error(error);
      });
    });
  }
}
