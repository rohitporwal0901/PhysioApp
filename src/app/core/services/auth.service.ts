import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppUser {
  uid: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient' | 'lab';
  fullName: string;
  phone?: string;
  dob?: string;
  gender?: string;
  address?: string;
  condition?: string;
  emergencyContact?: string;
  image?: string;
  assignedDoctors?: string[];
  createdAt?: any;
  available?: boolean;
  active?: boolean;
  testPdfUrl?: string;
  labName?: string;
  licenseNumber?: string;
  subscriptionPlan?: string;
  paymentStatus?: string;
  ratingScore?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  // Unsplash profile image collections
  private doctorImages = [
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop'
  ];

  private patientImages = [
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop'
  ];

  getRandomProfileImage(role: 'doctor' | 'patient'): string {
    const images = role === 'doctor' ? this.doctorImages : this.patientImages;
    return images[Math.floor(Math.random() * images.length)];
  }

  private currentUserSubject = new BehaviorSubject<AppUser | null | undefined>(undefined);
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
    const val = this.currentUserSubject.getValue();
    return val === undefined ? null : val;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.getValue();
  }

  get userRole(): string | null {
    return this.currentUserSubject.getValue()?.role ?? null;
  }

  async waitForAuth(): Promise<AppUser | null> {
    const currentState = this.currentUserSubject.getValue();
    if (currentState !== undefined) {
      return currentState;
    }
    return new Promise((resolve) => {
      const sub = this.currentUserSubject.subscribe(user => {
        if (user !== undefined) {
          sub.unsubscribe();
          resolve(user);
        }
      });
    });
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
      // Removed automatic navigation so login component can handle returnUrl
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

      const dummyImage = this.getRandomProfileImage('patient');

      await setDoc(doc(this.firestore, 'users', cred.user.uid), {
        ...cleanData,
        ...profile,
        image: data.image || dummyImage,
        address: data.address ?? '',
        condition: data.condition ?? '',
        emergencyContact: data.emergencyContact ?? '',
        createdAt: new Date()
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
        active: true,
        fullName: data.fullName,
        createdAt: new Date()
      };

      const dummyImage = this.getRandomProfileImage('doctor');

      await setDoc(doc(this.firestore, 'users', cred.user.uid), {
        ...cleanData,
        ...profile,
        image: data.image || dummyImage,
        createdAt: new Date()
      });
      this.currentUserSubject.next(profile);
      return { success: true };
    } catch (err: any) {
      console.error('Doctor registration error details:', err);
      return { success: false, error: this.mapFirebaseError(err.code) };
    }
  }

  async registerLab(data: {
    email: string;
    password: string;
    fullName: string;
    labName: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    testPdfUrl: string;
    licenseNumber: string;
    subscriptionPlan: string;
    paymentStatus?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, data.email, data.password);

      const { password, ...cleanData } = data;
      const profile: AppUser = {
        uid: cred.user.uid,
        email: data.email,
        role: 'lab',
        available: true,
        active: true,
        fullName: data.fullName,
        createdAt: new Date()
      };

      const dummyImage = this.getRandomProfileImage('patient');

      await setDoc(doc(this.firestore, 'users', cred.user.uid), {
        ...cleanData,
        ...profile,
        image: dummyImage,
        createdAt: new Date()
      });
      this.currentUserSubject.next(profile);
      return { success: true };
    } catch (err: any) {
      console.error('Lab registration error details:', err);
      return { success: false, error: this.mapFirebaseError(err.code) };
    }
  }

  async updateProfile(uid: string, data: any): Promise<{ success: boolean; error?: string }> {
    try {
      const ref = doc(this.firestore, 'users', uid);
      await setDoc(ref, data, { merge: true });

      // Update local state if it's the current user
      const current = this.currentUserSubject.getValue();
      if (current && current.uid === uid) {
        this.currentUserSubject.next({ ...current, ...data });
      }
      return { success: true };
    } catch (err: any) {
      console.error('Update profile error:', err);
      return { success: false, error: err.message };
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
      case 'lab': this.router.navigate(['/lab/dashboard']); break;
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
