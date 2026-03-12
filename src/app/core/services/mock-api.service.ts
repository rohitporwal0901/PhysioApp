import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  query, 
  where, 
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc
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

  removeUser(uid: string): Promise<void> {
    const docRef = doc(this.firestore, 'users', uid);
    return deleteDoc(docRef);
  }

  // Generic helper for real-time collection updates
  private collectionToObservable(q: any): Observable<any[]> {
    return new Observable<any[]>(subscriber => {
      return onSnapshot(q, (snapshot: any) => {
        const data = snapshot.docs.map((d: any) => ({
          id: d.id,
          ...d.data()
        }));
        subscriber.next(data);
      }, (error: any) => subscriber.error(error));
    });
  }
}
