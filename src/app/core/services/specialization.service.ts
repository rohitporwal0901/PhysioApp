import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc, updateDoc, query, where, getDocs, onSnapshot } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';

export interface Specialty {
  id?: string;
  name: string;
  icon: string;
  createdAt: any;
}

@Injectable({
  providedIn: 'root'
})
export class SpecializationService {
  private firestore = inject(Firestore);
  private specialtiesCollection = collection(this.firestore, 'specialties');

  private collectionToObservable(q: any): Observable<any[]> {
    return new Observable<any[]>(subscriber => {
      return onSnapshot(q, (snapshot: any) => {
        const data = snapshot.docs.map((d: any) => ({
          id: d.id,
          ...d.data()
        }));
        subscriber.next(data);
      }, (error: any) => {
        subscriber.error(error);
      });
    });
  }

  getSpecialties(): Observable<Specialty[]> {
    const q = query(this.specialtiesCollection);
    return this.collectionToObservable(q) as Observable<Specialty[]>;
  }

  async addSpecialty(name: string, icon: string): Promise<any> {
    // Check for duplicates
    const q = query(this.specialtiesCollection, where('name', '==', name));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error('Specialization already exists');
    }

    return addDoc(this.specialtiesCollection, {
      name,
      icon,
      createdAt: new Date()
    });
  }

  async updateSpecialty(id: string, data: Partial<Specialty>) {
    const specialtyDoc = doc(this.firestore, `specialties/${id}`);
    return updateDoc(specialtyDoc, data);
  }

  async deleteSpecialty(id: string) {
    const specialtyDoc = doc(this.firestore, `specialties/${id}`);
    return deleteDoc(specialtyDoc);
  }
}
