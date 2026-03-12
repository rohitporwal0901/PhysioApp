import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppUser {
  uid: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  fullName: string;
  createdAt?: Date;
  available?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<AppUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const profile = await this.fetchUserProfile(firebaseUser.uid);
        this.currentUserSubject.next(profile);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  get currentUser(): AppUser | null {
    return this.currentUserSubject.getValue();
  }

  get isLoggedIn(): boolean {
    return this.currentUserSubject.getValue() !== null;
  }

  get userRole(): string | null {
    return this.currentUserSubject.getValue()?.role ?? null;
  }

  private async fetchUserProfile(uid: string): Promise<AppUser | null> {
    try {
      const ref = doc(this.firestore, 'users', uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as AppUser;
        return { ...data, uid };
      }
      return null;
    } catch (e) {
      console.error('Error fetching user profile', e);
      return null;
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
      const profile = await this.fetchUserProfile(cred.user.uid);
      if (!profile) {
        await signOut(this.auth);
        return { success: false, error: 'User profile not found. Please contact support.' };
      }
      this.currentUserSubject.next(profile);
      this.navigateByRole(profile.role);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: this.mapFirebaseError(err.code) };
    }
  }

  async registerPatient(data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    dob: string;
    gender: string;
    address?: string;
    condition?: string;
    emergencyContact?: string;
    image?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, data.email, data.password);
      
      const { password, ...cleanData } = data;
      const profile: AppUser = {
        uid: cred.user.uid,
        email: data.email,
        role: 'patient',
        fullName: data.fullName,
        createdAt: new Date()
      };

      const dummyImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName)}&background=random&color=fff&size=512`;

      await setDoc(doc(this.firestore, 'users', cred.user.uid), {
        ...cleanData,
        ...profile,
        image: data.image || dummyImage,
        address: data.address ?? '',
        condition: data.condition ?? '',
        emergencyContact: data.emergencyContact ?? '',
        createdAt: new Date().toISOString()
      });
      this.currentUserSubject.next(profile);
      return { success: true };
    } catch (err: any) {
      console.error('Registration error details:', err);
      return { success: false, error: this.mapFirebaseError(err.code) };
    }
  }

  async registerDoctor(data: {
    email: string;
    password: string;
    fullName: string;
    gender: string;
    dob: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    qualification: string;
    specialization: string;
    experience: string;
    registrationNumber?: string;
    council?: string;
    areasOfInterest?: string[];
    consultationFee?: string;
    followUpFee?: string;
    consultationType?: string;
    availableDays?: string[];
    image?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, data.email, data.password);
      
      const { password, ...cleanData } = data;
      const profile: AppUser = {
        uid: cred.user.uid,
        email: data.email,
        role: 'doctor',
        available: true,
        fullName: data.fullName,
        createdAt: new Date()
      };

      const dummyImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName)}&background=0ea5e9&color=fff&size=512`;

      await setDoc(doc(this.firestore, 'users', cred.user.uid), {
        ...cleanData,
        ...profile,
        image: data.image || dummyImage,
        createdAt: new Date().toISOString()
      });
      this.currentUserSubject.next(profile);
      return { success: true };
    } catch (err: any) {
      console.error('Doctor registration error details:', err);
      return { success: false, error: this.mapFirebaseError(err.code) };
    }
  }

  async logout() {
    await signOut(this.auth);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  navigateByRole(role: string) {
    switch (role) {
      case 'admin': this.router.navigate(['/admin/dashboard']); break;
      case 'doctor': this.router.navigate(['/doctor/dashboard']); break;
      case 'patient': this.router.navigate(['/patient/dashboard']); break;
      default: this.router.navigate(['/login']);
    }
  }

  private mapFirebaseError(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use': return 'This email is already registered. Please login instead.';
      case 'auth/invalid-email': return 'Please enter a valid email address.';
      case 'auth/weak-password': return 'Password must be at least 6 characters.';
      case 'auth/user-not-found': return 'No account found with this email.';
      case 'auth/wrong-password': return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential': return 'Invalid email or password. Please try again.';
      case 'auth/operation-not-allowed': return 'Registration is currently disabled. Please enable Email/Password login in Firebase Console.';
      case 'auth/too-many-requests': return 'Too many failed attempts. Please try again later.';
      default: return 'An error occurred. Please try again.';
    }
  }
}
