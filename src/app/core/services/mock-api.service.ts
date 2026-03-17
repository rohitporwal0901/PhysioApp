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
      isAvailable: true,
      isActive: true
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

  /** Toggle doctor active status */
  async toggleDoctorActive(uid: string): Promise<void> {
    console.log('Toggling Active for Doctor:', uid);
    const docRef = doc(this.firestore, 'users', uid);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const currentActive = data['isActive'] ?? data['active'] ?? false;
        await updateDoc(docRef, {
          isActive: !currentActive,
          active: !currentActive // Map to both for compatibility
        });
        console.log('Update successful: isActive ->', !currentActive);
      } else {
        console.warn('Doctor document not found:', uid);
      }
    } catch (error) {
      console.error('Error in toggleDoctorActive:', error);
      throw error;
    }
  }

  /** Toggle doctor availability */
  async toggleDoctorAvailability(uid: string): Promise<void> {
    console.log('Toggling Availability for Doctor:', uid);
    const docRef = doc(this.firestore, 'users', uid);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const currentAvailable = data['isAvailable'] ?? data['available'] ?? false;
        await updateDoc(docRef, {
          isAvailable: !currentAvailable,
          available: !currentAvailable // Map both
        });
        console.log('Update successful: isAvailable ->', !currentAvailable);
      }
    } catch (error) {
      console.error('Error in toggleDoctorAvailability:', error);
      throw error;
    }
  }

  /** Get all registered lab technicians from 'users' collection */
  getLabTechnicians(): Observable<any[]> {
    const q = query(
      collection(this.firestore, 'users'),
      where('role', '==', 'lab_technician')
    );
    return this.collectionToObservable(q);
  }

  /** Add a new lab technician */
  addLabTechnician(tech: any): Promise<any> {
    return addDoc(collection(this.firestore, 'users'), {
      ...tech,
      role: 'lab_technician',
      createdAt: Timestamp.now(),
      isAvailable: true,
      isActive: true
    });
  }

  /** Toggle lab technician availability */
  async toggleLabTechnicianAvailability(uid: string): Promise<void> {
    const docRef = doc(this.firestore, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      await updateDoc(docRef, {
        isAvailable: !data['isAvailable']
      });
    }
  }

  /** Toggle lab technician active status */
  async toggleLabTechnicianActive(uid: string): Promise<void> {
    const docRef = doc(this.firestore, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      await updateDoc(docRef, {
        isActive: data['isActive'] === undefined ? false : !data['isActive']
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
            // Fallback for active field
            active: docData.active ?? docData.isActive ?? false,
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
